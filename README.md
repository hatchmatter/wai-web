# WAI Web

## Architecture
[Diagram](https://s.icepanel.io/W7ywJJ89DYtzBE/50WS)

## Development

Wai is built on Next.js, Supabase, and Stripe. This section will guide you through setting up your development environment.

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [Stripe CLI](https://stripe.com/docs/stripe-cli) (optional)
- [Docker](https://www.docker.com/products/docker-desktop)
- [Supabase CLI](https://supabase.io/docs/guides/cli) (you'll need a supabase dev account)

### Installation

- Get `.env.local` file from your friendly neighborhood developer
- Install docker desktop from [here](https://www.docker.com/products/docker-desktop)
- Install supabase cli with `brew install supabase/tap/supabase` or with Scoop on Windows
```
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```
- Install stripe cli with `brew install stripe/stripe-cli/stripe` (optional)
- Run `npm install` to install the dependencies

### Running the app

- Run `supabase start` to start the local supabase server
- Run `npm run dev` to start the development server
- Start the Wai Web Socket Server (see below)
- Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Stripe

- run `stripe login`
- run `stripe listen --forward-to localhost:3000/api/webhook/stripe`

### Supabase

- open [http://127.0.0.1:54323](http://127.0.0.1:54323/) to access the local supabase admin interface
- Create migrations using the supabase cli `supabase migration new <migration_name>`

#### Migrations

- Run `supabase migrate up` to apply migrations
- Run `supabase db reset` to reset the database, apply all migrations, and seed the database
  - After resetting you'll have to create a new user via the supabase admin interface [http://127.0.0.1:54323](http://127.0.0.1:54323/)

### Emails

- Check transactional emails like login links at [http://127.0.0.1:54324/](http://127.0.0.1:54324/)

### Wai Web Socket Server

- Wai runs in on heroku, but you can run it locally for development using instructions below
- To test Wai locally, ensure the WSS is running (see repo for instructions)
- Run ngrok to expose the WSS to the internet `ngrok http 8080` You'll need to set up an [ngrok](https://ngrok.com/) account and set a custom domain if you don't want to have to update the `NEXT_PUBLIC_WSS_URL` in the `.env.local` file every time you start ngrok
- And, update the `NEXT_PUBLIC_WSS_URL` in the `.env.local` file to the ngrok https URL

## Development Workflow
- Create a new branch off of `develop` for your feature
- Push your branch to the remote
- Create a pull request to `develop`
- Merge your pull request
- Delete your branch

## Deployment

The app is hosted on Vercel and is automatically deployed to "staging" on push to the remote `develop` branch. The environment variables are set in the Vercel dashboard. Push to the `main` branch to deploy to production. Supabase migrations run automatically on deployment.

## Seeding
See [https://supabase.com/docs/guides/cli/seeding-your-database](https://supabase.com/docs/guides/cli/seeding-your-database) for more information on seeding the database.

- `DRY=0 npx tsx seed.mts` to seed the database with test data
