/*
  # Add user_id column to medications table

  1. Changes
    - Add `user_id` column to `medications` table
    - Set up foreign key relationship with auth.users
    - Add Row Level Security policies for user data isolation
    - Update existing records to have a default user_id (if any exist)

  2. Security
    - Enable RLS on `medications` table
    - Add policy for users to only access their own medications
    - Add policy for users to insert their own medications
    - Add policy for users to update their own medications
    - Add policy for users to delete their own medications
*/

-- Add user_id column to medications table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'medications' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE medications ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security on medications table
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own medications" ON medications;
DROP POLICY IF EXISTS "Users can insert own medications" ON medications;
DROP POLICY IF EXISTS "Users can update own medications" ON medications;
DROP POLICY IF EXISTS "Users can delete own medications" ON medications;

-- Create RLS policies for medications
CREATE POLICY "Users can read own medications"
  ON medications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications"
  ON medications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications"
  ON medications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications"
  ON medications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);