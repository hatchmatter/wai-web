# WAI Web (DEFUNCT)

## Architecture
[Diagram](https://s.icepanel.io/W7ywJJ89DYtzBE/50WS)

## Development

Wai is built with Next.js and Supabase. This section will guide you through setting up your development environment.

### Prerequisites

- [Node.js](https://nodejs.org/en/)
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
- Run `npm install` to install the dependencies

### Running the app

- Run `npm run supabase:start` to start the local supabase server
- Run `npm run dev` to start the development server
- Start the Wai Web Socket Server (see below)
- Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Running the app in a Dev Container (optional)

- Ensure Dev Containers extension is installed for Visual Studio Code from [here](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- Run `supabase start` to start the local supabase server
- Build and open your project in a dev container
  - In VS Code, open the Command Pallete
  - Run `Dev Containers: Rebuild and Reopen in Container`
- Run `npm run dev` from the dev container to start the development server
- Start the Wai Web Socket Server (see below)
- Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Stripe

- run `stripe login`
- run `stripe listen --forward-to localhost:3000/api/webhook/stripe`

### Supabase

- open [http://127.0.0.1:54323](http://127.0.0.1:54323/) to access the local supabase admin interface

#### Migrations

- Create migrations using the supabase cli `supabase migration new <migration_name>`
- Run `supabase migrate up` to apply migrations
- Run `supabase db reset` to reset the database, apply all migrations, and seed the database
  - After resetting you'll have to add a user. Navigate to the Authentication page in the supabase admin interface [http://127.0.0.1:54323](http://127.0.0.1:54323/)

### Emails
- Check transactional emails like login links at [http://127.0.0.1:54324/](http://127.0.0.1:54324/)

### Wai Web Socket Server
- See [wai-wss](https://github.com/hatchmatterllc/wai-wss) for more information on setting up the Wai Web Socket Server
- sign up for [ngrok](https://ngrok.com/) and set up a custom domain
- Get `ngrok.yml` file from your friendly neighborhood developer
- Run `ngrok start wai-wss wai-web --config ngrok.yml` to expose the WSS to the internet
- Once you've done that, add the ngrok url to the retellai.com dashboard for every agent being used.

## Development Workflow
- Create a new branch off of `main` for your feature
- Push your branch to github
- Create a pull request to `main`
- Get your code approved
- Merge your pull request
- Delete your branch
- Your code will now be on staging-wai.hatchmatter.com

## Deployment
The app is hosted on Vercel and is automatically deployed to "staging" on push to the remote `main` branch. The environment variables are set in the Vercel dashboard. Create a release with a new tag from the `main` branch to deploy to production. Supabase migrations run automatically on deployment.

## Seeding
See [https://supabase.com/docs/guides/cli/seeding-your-database](https://supabase.com/docs/guides/cli/seeding-your-database) for more information on seeding the database.

- `DRY=0 npx tsx seed.mts` to seed the database with test data
