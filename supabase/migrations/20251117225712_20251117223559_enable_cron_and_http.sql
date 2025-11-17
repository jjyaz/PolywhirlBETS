/*
  # Enable pg_cron and http extensions for scheduled monitoring

  1. Extensions
    - Enable pg_cron for scheduled tasks
    - Enable http for making HTTP requests to Edge Functions
  
  2. Scheduled Job
    - Create cron job to monitor Pokemon streams every 3 minutes
    - Calls the pokemon-battle-oracle Edge Function
*/

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

SELECT cron.schedule(
  'monitor-pokemon-streams',
  '*/3 * * * *',
  $$
  SELECT
    extensions.http_post(
      url := 'https://uwmriqfxosnaqvvzeiuo.supabase.co/functions/v1/pokemon-battle-oracle?action=monitor',
      headers := '{"Content-Type": "application/json"}'::jsonb
    ) as request_id;
  $$
);

SELECT cron.schedule(
  'settle-pokemon-battles',
  '*/5 * * * *',
  $$
  SELECT
    extensions.http_post(
      url := 'https://uwmriqfxosnaqvvzeiuo.supabase.co/functions/v1/pokemon-battle-oracle?action=settle',
      headers := '{"Content-Type": "application/json"}'::jsonb
    ) as request_id;
  $$
);
