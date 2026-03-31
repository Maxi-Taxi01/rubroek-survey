-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  q1_feeling TEXT,
  q2_favorite_place TEXT,
  q3_why_place JSONB,
  q3_why_place_other TEXT,
  q4_contact_group TEXT,
  q5_change_contact_why TEXT,
  q6_new_place_choices JSONB,
  q7_place_should_be JSONB,
  q7_place_should_be_other TEXT,
  q8_absolutely_not TEXT,
  q9_contribute TEXT,
  q10_contribute_what TEXT,
  q11_daily_life_better TEXT,
  age_group TEXT,
  lives_in_rubroek TEXT,
  keep_updated TEXT,
  email TEXT,
  ip_hash TEXT,
  user_agent TEXT
);

-- Create index on created_at for efficient querying
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at DESC);

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  id SERIAL PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on ip_hash and created_at for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_created ON rate_limits(ip_hash, created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to INSERT
CREATE POLICY IF NOT EXISTS "Allow anonymous insert" ON survey_responses
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow authenticated users full SELECT and DELETE
CREATE POLICY IF NOT EXISTS "Allow authenticated users full access" ON survey_responses
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated users delete" ON survey_responses
  FOR DELETE
  USING (auth.role() = 'authenticated');
