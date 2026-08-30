# 🌐 Database Portability & Remote Deployment Guide

**GUCampusBridge** currently runs on a zero-config local **SQLite** database managed via **Prisma ORM**. This architecture makes local development fast and portable, while allowing 100% seamless migration to remote cloud databases (**PostgreSQL**, **Supabase**, **Neon**, **Railway**, **Render**).

---

## 📁 Architecture Overview

- **Local Database File:** `prisma/dev.db` (SQLite)
- **Prisma Schema:** `prisma/schema.prisma`
- **Express Backend API:** `server/index.js` (runs on `http://localhost:5000`)
- **React Frontend API Client:** `src/services/api.js`

---

## 🚀 How to Port from Local SQLite to Remote Cloud Database

Follow these steps to migrate your local database to a production remote PostgreSQL instance (e.g., Supabase or Neon):

### Step 1: Set Up Remote PostgreSQL
Create a database on your provider of choice:
- **Supabase:** [supabase.com](https://supabase.com) → Create Project → Copy Transaction / Session Connection String.
- **Neon:** [neon.tech](https://neon.tech) → Create Project → Copy PostgreSQL Connection String.
- **Railway / Render:** Create Postgres service → Copy Internal/External Connection URL.

---

### Step 2: Update `prisma/schema.prisma`
Change the `datasource` provider from `sqlite` to `postgresql`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

---

### Step 3: Create `.env` Environment File
Create a `.env` file in the root project directory:

```env
DATABASE_URL="postgresql://username:password@ep-cool-db-123456.us-east-2.aws.neon.tech/gucampusbridge?sslmode=require"
PORT=5000
```

---

### Step 4: Deploy Schema & Seed Remote Database
Run the following commands in your terminal:

```bash
# Push Prisma schema to your remote cloud database
npx prisma db push

# Seed remote database with GUCampusBridge initial data
node prisma/seed.js
```

---

### Step 5: Exporting & Migrating Existing SQLite Data (Optional)
If you accumulated custom local posts/comments in `prisma/dev.db` that you wish to export into PostgreSQL, you can use:

1. **Prisma Studio (Data GUI):**
   ```bash
   npx prisma studio
   ```
2. **`pgloader` CLI tool:**
   ```bash
   pgloader prisma/dev.db postgresql://user:password@host/dbname
   ```

---

## 🛠 Running the Backend & App

- **Run Dev Server + Backend concurrently:**
  ```bash
  npm run dev:full
  ```
- **Run Backend Express API only:**
  ```bash
  npm run server
  ```
- **Re-seed SQLite database:**
  ```bash
  npm run db:seed
  ```
