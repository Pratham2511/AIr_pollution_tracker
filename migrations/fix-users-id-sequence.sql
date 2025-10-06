-- Fix users table id column to use proper sequence
-- Run this manually in your Render PostgreSQL console if needed

-- Drop the existing id column constraint if it exists
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;

-- Create a sequence for the id column if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS users_id_seq;

-- Set the sequence to start from the max existing id + 1
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);

-- Set the id column to use the sequence
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');

-- Ensure the sequence is owned by the id column
ALTER SEQUENCE users_id_seq OWNED BY users.id;

-- Verify the fix
SELECT column_name, column_default, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';
