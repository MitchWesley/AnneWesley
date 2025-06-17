-- Create RSVP table if it doesn't exist
CREATE TABLE IF NOT EXISTS rsvp (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  gig_date DATE NOT NULL,
  venue VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add index for faster lookups by gig_date
CREATE INDEX IF NOT EXISTS idx_rsvp_gig_date ON rsvp(gig_date);

-- Add index for faster lookups by email
CREATE INDEX IF NOT EXISTS idx_rsvp_email ON rsvp(email);

-- Sample query to view all RSVPs
SELECT * FROM rsvp ORDER BY created_at DESC;
