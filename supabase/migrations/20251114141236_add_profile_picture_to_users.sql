/*
  # Add Profile Picture to Users

  1. Changes
    - Add `profile_picture_url` column to users table
    - This will store a URL to the user's profile picture

  2. Notes
    - Users can upload images or use external URLs
    - Column is nullable to allow users without profile pictures
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'profile_picture_url'
  ) THEN
    ALTER TABLE users ADD COLUMN profile_picture_url text;
  END IF;
END $$;