-- Create birthday posts table
CREATE TABLE IF NOT EXISTS birthday_posts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  image_urls TEXT[], -- Array to store multiple image URLs
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add index for faster retrieval by creation date
CREATE INDEX IF NOT EXISTS idx_birthday_posts_created_at ON birthday_posts(created_at DESC);

-- Sample query to view all posts
SELECT * FROM birthday_posts ORDER BY created_at DESC;
