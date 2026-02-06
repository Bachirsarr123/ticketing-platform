# Backend Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL credentials:
- `DB_USER`: Your PostgreSQL username (default: postgres)
- `DB_PASSWORD`: Your PostgreSQL password
- `DB_NAME`: Database name (default: ticketing_db)
- `JWT_SECRET`: A strong secret key for JWT tokens

### 3. Create Database

Open PostgreSQL and create the database:

```sql
CREATE DATABASE ticketing_db;
```

### 4. Run Database Schema

Execute the schema file to create all tables:

```bash
psql -U postgres -d ticketing_db -f schema.sql
```

Or manually in PostgreSQL:

```sql
\c ticketing_db
\i schema.sql
```

### 5. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## Database Schema

The database includes the following tables:

- **users**: Organizers and admins (NO regular users)
- **events**: Events created by organizers
- **ticket_types**: Different ticket types for each event
- **tickets**: Individual tickets purchased by visitors (anonymous)

## API Endpoints

### Public Routes (No Authentication)
- `GET /api/events/public` - Get all published events
- `POST /api/purchase/:ticketTypeId` - Purchase a ticket (anonymous)

### Organizer Routes (Authentication Required)
- `POST /api/auth/register` - Register as organizer
- `POST /api/auth/login` - Login
- `POST /api/events` - Create an event
- `GET /api/events/my` - Get my events
- `PUT /api/events/:id/publish` - Publish an event
- `POST /api/ticket-types/:eventId` - Create ticket type
- `GET /api/ticket-types/:eventId` - Get ticket types for event
- `POST /api/scan` - Scan a ticket (organizer only)

## Testing the API

You can test the API using tools like:
- Postman
- Thunder Client (VS Code extension)
- curl

Example: Register an organizer
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "organizer"
  }'
```

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check your `.env` credentials
- Ensure the database `ticketing_db` exists

### Port Already in Use
- Change the `PORT` in `.env` to a different value

### JWT Token Errors
- Ensure `JWT_SECRET` is set in `.env`
- Check that the token is sent in the `Authorization` header as `Bearer <token>`
