import { useState, useEffect } from 'react';
import { supabase, User } from '../lib/supabase';
import { useWallet } from '../contexts/WalletContext';

export const useUser = () => {
  const { publicKey, connected } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrCreateUser = async () => {
      if (!publicKey || !connected) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const walletAddress = publicKey.toString();

      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (existingUser) {
        setUser(existingUser);
      } else {
        const { data: newUser, error } = await supabase
          .from('users')
          .insert({
            wallet_address: walletAddress,
          })
          .select()
          .single();

        if (!error && newUser) {
          setUser(newUser);
        }
      }

      setLoading(false);
    };

    fetchOrCreateUser();
  }, [publicKey, connected]);

  const updateProfile = async (username?: string, profilePictureUrl?: string) => {
    if (!user) return { success: false, error: 'No user found' };

    const updates: Partial<User> = {
      updated_at: new Date().toISOString(),
    };

    if (username !== undefined) updates.username = username;
    if (profilePictureUrl !== undefined) updates.profile_picture_url = profilePictureUrl;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (data) {
      setUser(data);
    }

    return { success: true };
  };

  return { user, loading, updateProfile };
};
