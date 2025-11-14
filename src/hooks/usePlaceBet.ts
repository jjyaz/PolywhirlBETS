import { useState } from 'react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { getConnection, PLATFORM_WALLET, solToLamports } from '../lib/solana';
import { supabase } from '../lib/supabase';
import { useWallet } from '../contexts/WalletContext';

const DEMO_MODE = false;

export const usePlaceBet = () => {
  const { publicKey, balance } = useWallet();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeBet = async (
    marketId: string,
    optionId: string,
    amount: number,
    userId: string
  ): Promise<boolean> => {
    if (!publicKey) {
      setError('Wallet not connected');
      return false;
    }

    setPlacing(true);
    setError(null);

    let signature = '';

    try {
      if (balance < amount) {
        throw new Error(`Insufficient balance. You have ${balance.toFixed(4)} SOL but need ${amount.toFixed(4)} SOL.`);
      }

      const { solana } = window as any;
      if (!solana) {
        throw new Error('Phantom wallet not found. Please install Phantom wallet extension.');
      }

      const connection = await getConnection();

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: PLATFORM_WALLET,
          lamports: solToLamports(amount),
        })
      );

      transaction.feePayer = publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signed = await solana.signTransaction(transaction);
      signature = await connection.sendRawTransaction(signed.serialize());

      await connection.confirmTransaction(signature);

      const { data: optionData, error: optionError } = await supabase
        .from('market_options')
        .select('odds')
        .eq('id', optionId)
        .maybeSingle();

      if (optionError) throw new Error(`Failed to fetch option data: ${optionError.message}`);

      const potentialPayout = amount * (optionData?.odds || 1);

      const { error: betError } = await supabase.from('bets').insert({
        user_id: userId,
        market_id: marketId,
        option_id: optionId,
        amount,
        potential_payout: potentialPayout,
        transaction_signature: signature,
        status: 'pending',
      });

      if (betError) throw new Error(`Failed to save bet: ${betError.message}`);

      const { error: txError } = await supabase.from('transactions').insert({
        user_id: userId,
        type: 'bet',
        amount,
        signature,
        status: 'confirmed',
      });

      if (txError) console.error('Failed to save transaction:', txError);

      const { error: updateError } = await supabase
        .from('users')
        .update({ total_bets: supabase.sql`total_bets + 1` })
        .eq('id', userId);

      if (updateError) console.error('Failed to update user stats:', updateError);

      setPlacing(false);
      return true;
    } catch (err) {
      console.error('Bet placement error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to place bet';
      setError(errorMsg);
      setPlacing(false);
      return false;
    }
  };

  return { placeBet, placing, error };
};
