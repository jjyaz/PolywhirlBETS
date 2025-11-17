# Pokemon Battle Betting Oracle - Setup Guide

This guide will help you set up the automated Pokemon battle betting oracle that monitors Twitch livestreams.

## Overview

The oracle system automatically:
- Monitors Pokemon battle streams on Twitch
- Detects battles from stream titles using regex patterns
- Creates betting markets in real-time
- Settles markets based on winner detection
- Provides admin review interface for ambiguous cases

## Prerequisites

1. Twitch Developer Account
2. Supabase Project (already configured)
3. Your application deployed and running

## Step 1: Register Twitch Application

1. Visit [Twitch Developer Console](https://dev.twitch.tv/console)
2. Click "Register Your Application"
3. Fill in the application details:
   - **Name**: Polywhirl Bets Oracle
   - **OAuth Redirect URLs**: `http://localhost` (for development)
   - **Category**: Website Integration
4. Click "Create"
5. Note your **Client ID**
6. Click "New Secret" to generate a **Client Secret**
7. **IMPORTANT**: Save both the Client ID and Client Secret securely

## Step 2: Configure Environment Variables

Update your `.env` file with your Twitch credentials:

```env
VITE_TWITCH_CLIENT_ID=your_actual_client_id_here
VITE_TWITCH_CLIENT_SECRET=your_actual_client_secret_here
```

Replace `your_actual_client_id_here` and `your_actual_client_secret_here` with the values from Step 1.

## Step 3: Configure Supabase Edge Function Environment Variables

The Edge Function needs Twitch credentials to monitor streams. Set these up in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to Edge Functions → Settings
3. Add the following secrets:
   - `TWITCH_CLIENT_ID`: Your Twitch Client ID
   - `TWITCH_CLIENT_SECRET`: Your Twitch Client Secret

## Step 4: Initialize Pokemon Games

The first time the oracle runs, it will automatically discover Pokemon games on Twitch. You can manually trigger this by:

1. Using the browser console on your site:
```javascript
import { initializePokemonGames } from './services/pokemonGameDiscovery';
await initializePokemonGames();
```

Or the oracle will auto-discover games on first monitoring cycle.

## Step 5: Set Up Monitoring Schedule

The oracle monitors streams via the Supabase Edge Function. You can trigger it in several ways:

### Option A: Manual Testing
Call the edge function manually to test:
```bash
curl -X GET "https://[YOUR_PROJECT_REF].supabase.co/functions/v1/pokemon-battle-oracle?action=monitor"
```

### Option B: Cron Job (Recommended for Production)
Set up a cron job or scheduled task to call the monitoring endpoint every 2-5 minutes:

Using Supabase Cron (if available in your plan):
```sql
SELECT cron.schedule(
  'monitor-pokemon-streams',
  '*/2 * * * *',  -- Every 2 minutes
  $$
  SELECT net.http_post(
    url := 'https://[YOUR_PROJECT_REF].supabase.co/functions/v1/pokemon-battle-oracle?action=monitor',
    headers := '{}'::jsonb
  );
  $$
);
```

Or use an external cron service like:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com/)
- GitHub Actions scheduled workflows

### Option C: Frontend Polling (Development Only)
For testing, you can add a polling mechanism in your app, but this is NOT recommended for production.

## Step 6: Test the System

1. **Test Stream Discovery**:
   - Call the monitoring endpoint
   - Check the `twitch_stream_sessions` table in Supabase
   - Verify live Pokemon streams are being detected

2. **Test Battle Detection**:
   - Find a Pokemon battle stream on Twitch with a title like "PlayerA vs PlayerB"
   - Wait for the monitoring cycle to run
   - Check if a market was created in `betting_markets` table
   - Verify the market appears in the Pokemon category on your site

3. **Test Settlement**:
   - Wait for a battle stream to end with a winner in the title
   - Check `market_auto_settlement` table for the detection
   - Call settlement endpoint: `?action=settle`
   - Or use the Admin interface to manually review and settle

## How It Works

### Battle Detection Patterns

The system uses multiple regex patterns to detect battles:

1. **"PlayerA vs PlayerB"** format (85% confidence)
2. **"PlayerA vs PlayerB - Winner: PlayerC"** format (95% confidence)
3. **"PlayerA beats PlayerB"** format (90% confidence)
4. **"Winner: PlayerA"** format (70% confidence)
5. **"PlayerA victory"** format (75% confidence)

### Automatic Market Creation

Markets are created when:
- Confidence score ≥ 75%
- Both players are detected
- Player names are different
- No existing market for that stream

### Automatic Settlement

Markets are automatically settled when:
- Confidence score ≥ 90%
- Winner is clearly identified
- Winner matches one of the two players

### Admin Review

Markets require admin review when:
- Confidence score is between 70-90%
- Winner detection is ambiguous
- Stream ended without clear winner

## Admin Interface

Access the admin interface by:
1. Connect your wallet
2. Click the "Admin" button in the navigation
3. Review pending settlements
4. Manually select winners or reject settlements

## Monitoring & Maintenance

### Check Oracle Health

Monitor these tables in Supabase:
- `twitch_stream_sessions`: Should show recent live streams
- `battle_detection_logs`: Shows all detection attempts with confidence scores
- `market_auto_settlement`: Shows pending and completed settlements
- `betting_markets`: Shows created markets

### Common Issues

**No streams detected:**
- Verify Twitch credentials are correct
- Check if Pokemon game IDs are populated in `pokemon_game_ids` table
- Ensure monitoring function is being called regularly

**Markets not created:**
- Check `battle_detection_logs` to see what's being detected
- Verify confidence scores are above 75%
- Check stream titles match expected patterns

**Settlement not working:**
- Check confidence scores in `market_auto_settlement`
- Use admin interface for manual review
- Verify winner names match player names exactly

## API Endpoints

### Monitor Streams
```
GET /functions/v1/pokemon-battle-oracle?action=monitor
```

### Process Settlements
```
GET /functions/v1/pokemon-battle-oracle?action=settle
```

## Security Notes

- Never commit Twitch credentials to version control
- Keep Client Secret secure
- Only authorized wallets should access admin interface
- Consider adding additional authentication for settlement endpoints

## Next Steps

After setup is complete:
1. Monitor the system for 24-48 hours
2. Review detection accuracy in `battle_detection_logs`
3. Adjust confidence thresholds if needed
4. Add more Pokemon game categories as needed
5. Consider adding monitored channels for specific streamers

## Support

If you encounter issues:
1. Check Supabase logs for Edge Function errors
2. Review browser console for frontend errors
3. Verify all environment variables are set correctly
4. Test Twitch API credentials independently
