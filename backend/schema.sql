-- ===============================================
-- TICKETING PLATFORM - DATABASE SCHEMA
-- ===============================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS ticket_types CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ===============================================
-- TABLE: users
-- ===============================================
-- Stores organizers and admins (NO regular users)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('organizer', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups during login
CREATE INDEX idx_users_email ON users(email);

-- ===============================================
-- TABLE: events
-- ===============================================
-- Stores events created by organizers
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  organizer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  date_event TIMESTAMP NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries by organizer
CREATE INDEX idx_events_organizer ON events(organizer_id);

-- Index for faster queries on published events
CREATE INDEX idx_events_published ON events(is_published);

-- ===============================================
-- TABLE: ticket_types
-- ===============================================
-- Different ticket types for each event (VIP, Standard, etc.)
CREATE TABLE ticket_types (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries by event
CREATE INDEX idx_ticket_types_event ON ticket_types(event_id);

-- ===============================================
-- TABLE: tickets
-- ===============================================
-- Individual tickets purchased by visitors (NO user_id, anonymous)
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id INTEGER NOT NULL REFERENCES ticket_types(id) ON DELETE CASCADE,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(50) NOT NULL,
  qr_token VARCHAR(255) UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster QR code lookups during scanning
CREATE INDEX idx_tickets_qr_token ON tickets(qr_token);

-- Index for faster queries by event
CREATE INDEX idx_tickets_event ON tickets(event_id);

-- Index for faster queries by ticket type
CREATE INDEX idx_tickets_type ON tickets(ticket_type_id);

-- ===============================================
-- SAMPLE DATA (Optional - for testing)
-- ===============================================

-- Create an admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@ticketing.com', '$2b$10$rZ5YhJKvX8qKZ5YhJKvX8OqKZ5YhJKvX8qKZ5YhJKvX8qKZ5YhJK', 'admin');

-- Create an organizer user
-- Password: organizer123 (hashed with bcrypt)
INSERT INTO users (name, email, password_hash, role) VALUES
('John Organizer', 'organizer@ticketing.com', '$2b$10$rZ5YhJKvX8qKZ5YhJKvX8OqKZ5YhJKvX8qKZ5YhJKvX8qKZ5YhJK', 'organizer');

-- Note: The password hashes above are examples. 
-- You'll need to create real users through the /api/auth/register endpoint
-- or use bcrypt to generate proper hashes.

-- ===============================================
-- USEFUL QUERIES FOR TESTING
-- ===============================================

-- View all users
-- SELECT * FROM users;

-- View all published events
-- SELECT * FROM events WHERE is_published = true;

-- View ticket types for a specific event
-- SELECT * FROM ticket_types WHERE event_id = 1;

-- View all tickets for an event
-- SELECT t.*, tt.name as ticket_type_name, e.title as event_title
-- FROM tickets t
-- JOIN ticket_types tt ON t.ticket_type_id = tt.id
-- JOIN events e ON t.event_id = e.id
-- WHERE t.event_id = 1;

-- Check ticket stock for an event
-- SELECT tt.name, tt.quantity as remaining_stock
-- FROM ticket_types tt
-- WHERE tt.event_id = 1;

-- ===============================================
-- END OF SCHEMA
-- ===============================================
