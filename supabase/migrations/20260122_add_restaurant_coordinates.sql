-- Add latitude and longitude columns to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Create an index on the coordinates for efficient location-based queries
CREATE INDEX IF NOT EXISTS idx_restaurants_coordinates ON restaurants(latitude, longitude);
