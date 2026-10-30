# HIENDBRANDS Shopping Project

Portfolio e-commerce project built with Express, MySQL, and a responsive HTML/CSS/JavaScript storefront.

## Run locally

1. Copy `.env.example` to `.env` and set the local MySQL connection.
2. Create the database named in `DB_NAME`.
3. Install and initialize:

   ```bash
   npm install
   npm run db:init
   npm start
   ```

4. Open `http://localhost:3000`.

The initializer creates only the schema and a public demo catalog. It does not copy users, carts, or orders from a developer machine.

## Deploy

This project needs a Node.js service and MySQL; GitHub Pages alone cannot run it.

For Railway:

1. Create a project from this GitHub repository.
2. Add a MySQL service to the same Railway project.
3. Reference the MySQL `DATABASE_URL` variable from the web service.
4. Set the pre-deploy command to `npm run db:init`.
5. Set the healthcheck path to `/health` and generate a public domain.

Railway detects `npm start` automatically. The app reads Railway's `PORT` and database variables at runtime.

## Useful endpoints

- `/health` — application and database readiness
- `/seller/all` — demo product catalog API
- `/` — storefront
