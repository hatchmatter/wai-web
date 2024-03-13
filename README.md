# WAI Web

## Development

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Docker](https://www.docker.com/products/docker-desktop) (for supabase local development)
- [Supabase CLI](https://supabase.io/docs/guides/cli) (you'll need a supabase dev account)

### Installation
- Get `.env.local` file from your friendly neighborhood developer
- Install docker desktop from [here](https://www.docker.com/products/docker-desktop)
- Install supabase cli with `brew install supabase/tap/supabase`
- Install stripe cli with `brew install stripe/stripe-cli/stripe`
- Run `npm install` to install the dependencies

### Running the app
- Run `npm run dev` to start the development server
- Run `supabase start` to start the local supabase server
- Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Testing Stripe
- run `stripe login`
- run `stripe listen --forward-to localhost:3000/api/webhook/stripe`

## Testing Supabase