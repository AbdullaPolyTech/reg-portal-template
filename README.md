# Reg Portal Template (Node.js + SQLite)

A registration portal template with role-based access, file uploads, and admin workflows.

## Features

**User** 
- Account registration/login with validation
- Session authentication with SQLite backed sessions
- Submit applications and track them
- Upload files/documents with limitations

**Admin**
- Review applications with search, filter and sorting controls.
- View application details, download files and update application status
- Add new users, update roles, and remove users
- Audit logging for actions (user create/delete, application status change, submissions)

**Security**
- Session cookies: HttpOnly, SameSite=Lax
- CSRF: synchronizer token pattern (session token + hidden form field validation)
- Rate limiting: login and registration
- Pssword hashing: bcrypt
- Upload validation: file type allowlist + size limits

## Tech Stack

- Express 5 + EJS
- SQLite (better-sqlite3)
- Multer for uploads
- Express-session + connect-sqlite3

## Setup

1- Install dependencies: ```npm install```

2- Create environment file: ```cp .env.example .env```

3- Update `SESSION_SECRET` in `.env`

4- Initialize db and seed the admin user: ```npm run seed```

5- Start the server with ```npm run dev```

The app runs at <http://localhost:3000> by default.

Running the seed script creates an admin account if it doesn't exist: 

Email: `admin@local.test`
Pass: `Admin123!`

**Change/delete these after first login for actual deployment.**

## Env variables

- `PORT` (default: 3000)
- `SESSION_SECRET` (required)
- `DB_PATH` (default: `./data/app.db`)

## Upload configs

Uploads are stored in `data/uploads/` with random file names.

Allowed file types:

- PDF
- Word docs
- Images (jpeg, png, gif, webp)

5 files is the limit per application, 5 MB per file.

## Commands

- `npm run dev` start the dev server with nodemon
- `npm run seed` init schema and create the default admin
- `npm start` run the server in prod mode