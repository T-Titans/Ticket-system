-- Fix the missing auto_created column in users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_created BOOLEAN DEFAULT false;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'auto_created';

-- Show success message
SELECT 'SUCCESS: auto_created column added to users table!' as status;