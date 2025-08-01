# Property Portal

This project is a property listings portal inspired by popular real‑estate sites. It has been built using **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **React Query** and **Supabase**. The goal of this portal is to provide a solid foundation for browsing, searching and managing property listings, while demonstrating how to integrate client‑side code with Supabase for authentication, storage and row‑level security.

## Modern responsive UI

The interface now uses a token based theme with a refined colour palette and typography. Property cards display price overlays and subtle hover animations while skeleton loaders keep layouts stable during data fetches.

## Features

- **Browse and search properties** by location, price range, bedrooms, bathrooms, listing type and more.
- **Property detail pages** with image galleries, descriptions, amenities, floor area, EPC rating and a contact form.
- **Nearby schools and amenities** displayed on property pages using OpenStreetMap data cached via Supabase Edge Functions.
- **Favourites**: authenticated users can save and remove favourite properties.
- **Saved searches**: logged in users can store their search criteria and rerun them later from the Saved Searches page.
- **Agent dashboard**: agents can create and edit their own listings, upload photos and respond to enquiries.
- **Authentication** using Supabase’s email/password and magic‑link providers. A `profiles` table stores user roles (`user`, `agent`, `admin`).
- **Messaging**: users can send messages to agents about a property; agents can read and reply.
- **Row Level Security** policies are implemented to ensure users only read and modify the data they are authorised to access.
- **Rate limiting** on login and enquiry submissions helps block abuse.
- **Viewing appointments**: users can request a viewing and agents manage their schedule in a calendar view.

## Getting started

1. **Clone the repo**

   ```bash
   git clone <this-repo-url>
   cd property-portal
   ```

2. **Install dependencies**

   The project uses Leaflet for the map view so be sure all npm packages are installed:

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the `.env.example` file to `.env.local` and provide your Supabase project URL and anon key:

   ```bash
   cp .env.example .env.local
   # then edit .env.local
   ```

4. **Run database migrations**

   The `supabase/seed.sql` file contains the schema definitions, RLS policies and a small amount of seed data. Use the Supabase SQL editor or `psql` to run this file against your project:

```bash
supabase db push supabase/seed.sql
# or open supabase/seed.sql in the SQL editor and run it
```

If you already applied the initial seed you can run `supabase/update_v2.sql`
to add the previous tables and policies. For the reviews feature introduced in
this version, execute `supabase/update_v3.sql` as well.
For the agent analytics and appointments features added in v4, run
`supabase/update_v4.sql` after applying the earlier updates. To load the
sample data used by the new calendar view, execute `supabase/update_v5.sql`

after running the previous updates. To enable caching for nearby schools and
amenities, apply `supabase/update_v6.sql` next.
For favourite lists and comparison support added in v7, run
`supabase/update_v7.sql` after applying the earlier updates.
To refresh derived data for existing rows, execute `supabase/update_v8.sql`
after running the previous updates.

5. **Deploy the Edge Function**

   The `supabase/functions/nearby` function caches queries to OpenStreetMap for
   nearby schools and amenities.

   ```bash
   supabase functions deploy nearby
   ```

6. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:5173](http://localhost:5173).

## Folder structure

This repository uses a simple and flat folder structure. The most important directories are:

```
property-portal/
├── public/              # Static assets
├── src/                 # Front‑end source code
│   ├── api/             # Supabase client and helpers
│   ├── components/      # Reusable presentational components
│   ├── hooks/           # Custom hooks powered by React Query
│   ├── pages/           # Page‑level components mapped to routes
│   ├── router/          # React Router configuration
│   └── types/           # TypeScript types and definitions
├── supabase/            # Database schema and RLS policies
└── package.json         # Project configuration
```

## Security

When deploying this application, configure your hosting platform to redirect all
HTTP traffic to HTTPS. Set headers like **Strict-Transport-Security**,
**X-Content-Type-Options**, **X-Frame-Options**, **Referrer-Policy** and an
appropriate **Content-Security-Policy** that only allows scripts from your own
domain and your Supabase project.

## Testing

Basic end‑to‑end smoke tests can be written using **Cypress** or **Playwright**. A simple example configuration is included under the `cypress/` and `playwright.config.js` folders. Running `npm run test:e2e` will execute those tests. Refer to the respective frameworks’ documentation for more details.

## License

This project is provided for educational purposes and comes with no warranty. You are free to modify and extend it to suit your own needs.
