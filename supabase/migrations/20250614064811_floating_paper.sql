/*
  # Add missing columns to caregivers table

  1. Changes
    - Add `role` column (text, not null, default 'secondary')
    - Add `permissions` column (text array, default empty array)
    - Add `isActive` column (boolean, default true) 
    - Add `lastActive` column (timestamp with time zone, nullable)

  2. Security
    - No changes to existing RLS policies needed
    - All new columns follow existing security model
*/

-- Add missing columns to caregivers table
DO $$
BEGIN
  -- Add role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'caregivers' AND column_name = 'role'
  ) THEN
    ALTER TABLE caregivers ADD COLUMN role text NOT NULL DEFAULT 'secondary';
  END IF;

  -- Add permissions column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'caregivers' AND column_name = 'permissions'
  ) THEN
    ALTER TABLE caregivers ADD COLUMN permissions text[] DEFAULT '{}';
  END IF;

  -- Add isActive column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'caregivers' AND column_name = 'isActive'
  ) THEN
    ALTER TABLE caregivers ADD COLUMN "isActive" boolean DEFAULT true;
  END IF;

  -- Add lastActive column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'caregivers' AND column_name = 'lastActive'
  ) THEN
    ALTER TABLE caregivers ADD COLUMN "lastActive" timestamptz;
  END IF;
END $$;

-- Add check constraint for role values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'caregivers_role_check'
  ) THEN
    ALTER TABLE caregivers ADD CONSTRAINT caregivers_role_check 
    CHECK (role IN ('primary', 'secondary', 'medical'));
  END IF;
END $$;