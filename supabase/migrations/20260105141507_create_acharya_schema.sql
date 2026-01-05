/*
  # Acharya - Personalized Coding Learning Platform

  ## Overview
  This migration creates the database schema for Acharya, a platform that personalizes coding education based on user assessments.

  ## New Tables
  
  ### 1. `profiles`
  Stores user profile information including learning level and social links
  - `id` (uuid, primary key) - Links to auth.users
  - `name` (text) - User's full name
  - `learning_level` (text) - Classification: 'spoonfeeder' or 'well-idea'
  - `coding_level` (integer) - Current coding proficiency level
  - `social_feeds` (jsonb) - Social media links (github, linkedin, twitter, etc.)
  - `goal_description` (text) - User's learning goals
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `quiz_results`
  Stores initial assessment quiz responses
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References profiles
  - `coding_level_score` (integer) - Score 1-3
  - `coding_proficiency_score` (integer) - Score 1-3
  - `decision_making_score` (integer) - Score 1-3
  - `cgpa` (numeric) - Score 1-10
  - `real_life_application_score` (integer) - Score 1-3
  - `total_score` (numeric) - Calculated total score
  - `category` (text) - Determined category: 'spoonfeeder' or 'well-idea'
  - `created_at` (timestamptz) - Quiz completion timestamp

  ### 3. `learning_progress`
  Tracks user progress through learning concepts
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References profiles
  - `concept_name` (text) - Name of the concept
  - `concept_description` (text) - Detailed explanation
  - `is_completed` (boolean) - Mark as read status
  - `difficulty_level` (text) - 'beginner' or 'advanced'
  - `order_index` (integer) - Sequence order
  - `created_at` (timestamptz) - When concept was assigned
  - `completed_at` (timestamptz) - When marked as read

  ### 4. `coding_platforms`
  Stores coding platform statistics and goals
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References profiles
  - `platform` (text) - Platform name: 'codechef' or 'leetcode'
  - `username` (text) - Platform username
  - `contest_rank` (integer) - Current contest ranking
  - `star_rating` (integer) - Star rating (CodeChef only)
  - `current_division` (text) - Current division/level
  - `goal` (text) - Target achievement
  - `last_updated` (timestamptz) - Last sync timestamp

  ### 5. `concept_requests`
  Stores user requests for specific concepts to learn
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References profiles
  - `concept_name` (text) - Requested concept
  - `reason` (text) - Why they want to learn it (weak/interested)
  - `is_processed` (boolean) - Whether content was generated
  - `created_at` (timestamptz) - Request timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Authenticated users required for all operations
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  learning_level text CHECK (learning_level IN ('spoonfeeder', 'well-idea')),
  coding_level integer DEFAULT 0,
  social_feeds jsonb DEFAULT '{}',
  goal_description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create quiz_results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coding_level_score integer CHECK (coding_level_score BETWEEN 1 AND 3),
  coding_proficiency_score integer CHECK (coding_proficiency_score BETWEEN 1 AND 3),
  decision_making_score integer CHECK (decision_making_score BETWEEN 1 AND 3),
  cgpa numeric CHECK (cgpa BETWEEN 1 AND 10),
  real_life_application_score integer CHECK (real_life_application_score BETWEEN 1 AND 3),
  total_score numeric,
  category text CHECK (category IN ('spoonfeeder', 'well-idea')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz results"
  ON quiz_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results"
  ON quiz_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create learning_progress table
CREATE TABLE IF NOT EXISTS learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  concept_name text NOT NULL,
  concept_description text NOT NULL,
  is_completed boolean DEFAULT false,
  difficulty_level text CHECK (difficulty_level IN ('beginner', 'advanced')),
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own learning progress"
  ON learning_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning progress"
  ON learning_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning progress"
  ON learning_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own learning progress"
  ON learning_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create coding_platforms table
CREATE TABLE IF NOT EXISTS coding_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('codechef', 'leetcode')),
  username text NOT NULL,
  contest_rank integer DEFAULT 0,
  star_rating integer DEFAULT 0,
  current_division text DEFAULT '',
  goal text DEFAULT '',
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

ALTER TABLE coding_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coding platforms"
  ON coding_platforms FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coding platforms"
  ON coding_platforms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coding platforms"
  ON coding_platforms FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own coding platforms"
  ON coding_platforms FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create concept_requests table
CREATE TABLE IF NOT EXISTS concept_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  concept_name text NOT NULL,
  reason text DEFAULT '',
  is_processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE concept_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own concept requests"
  ON concept_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own concept requests"
  ON concept_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own concept requests"
  ON concept_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_completed ON learning_progress(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_coding_platforms_user_id ON coding_platforms(user_id);
CREATE INDEX IF NOT EXISTS idx_concept_requests_user_id ON concept_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_concept_requests_processed ON concept_requests(user_id, is_processed);