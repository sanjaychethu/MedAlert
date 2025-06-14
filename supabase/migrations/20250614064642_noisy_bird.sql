/*
  # Create health application tables

  1. New Tables
    - `vital_signs`
      - `id` (text, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `timestamp` (timestamptz)
      - `blood_pressure` (jsonb, optional)
      - `heart_rate` (integer, optional)
      - `temperature` (numeric, optional)
      - `oxygen_saturation` (integer, optional)
      - `weight` (numeric, optional)
      - `blood_glucose` (integer, optional)
      - `notes` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `caregivers`
      - `id` (text, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `relationship` (text)
      - `phone` (text, optional)
      - `email` (text, optional)
      - `emergency_contact` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_profiles`
      - `id` (text, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, optional)
      - `date_of_birth` (date, optional)
      - `emergency_contact` (text, optional)
      - `medical_conditions` (text array, optional)
      - `allergies` (text array, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add indexes for better query performance

  3. Changes
    - Create all missing tables referenced in the application
    - Set up proper foreign key relationships
    - Add comprehensive RLS policies
*/

-- Create vital_signs table
CREATE TABLE IF NOT EXISTS vital_signs (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  timestamp timestamptz NOT NULL,
  blood_pressure jsonb,
  heart_rate integer,
  temperature numeric,
  oxygen_saturation integer,
  weight numeric,
  blood_glucose integer,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create caregivers table
CREATE TABLE IF NOT EXISTS caregivers (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  relationship text NOT NULL,
  phone text,
  email text,
  emergency_contact boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text,
  date_of_birth date,
  emergency_contact text,
  medical_conditions text[],
  allergies text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own vital signs" ON vital_signs;
DROP POLICY IF EXISTS "Users can insert own vital signs" ON vital_signs;
DROP POLICY IF EXISTS "Users can update own vital signs" ON vital_signs;
DROP POLICY IF EXISTS "Users can delete own vital signs" ON vital_signs;

DROP POLICY IF EXISTS "Users can read own caregivers" ON caregivers;
DROP POLICY IF EXISTS "Users can insert own caregivers" ON caregivers;
DROP POLICY IF EXISTS "Users can update own caregivers" ON caregivers;
DROP POLICY IF EXISTS "Users can delete own caregivers" ON caregivers;

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- Create RLS policies for vital_signs
CREATE POLICY "Users can read own vital signs"
  ON vital_signs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vital signs"
  ON vital_signs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vital signs"
  ON vital_signs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vital signs"
  ON vital_signs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for caregivers
CREATE POLICY "Users can read own caregivers"
  ON caregivers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own caregivers"
  ON caregivers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own caregivers"
  ON caregivers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own caregivers"
  ON caregivers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vital_signs_user_id ON vital_signs(user_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_timestamp ON vital_signs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_caregivers_user_id ON caregivers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);