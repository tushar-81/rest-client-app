# REST Client App

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, copy the database configuration example and fill in your credentials:

```bash
cp .example-mikro-orm.config.ts mikro-orm.config.ts
```

Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

Rename `.env.local.example` to `.env.local` and fill in your database credentials:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=rest_client_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
```  

The application will read these variables when configuring MikroORM (see `mikro-orm.config.ts`).

## Usage Examples

### Sending Requests via cURL

Get request:
```bash
curl -X GET "http://localhost:3000/api/request" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://jsonplaceholder.typicode.com/posts/1","method":"GET","headers":{}}'
```

Post request with JSON body:
```bash
curl -X POST "http://localhost:3000/api/request" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://jsonplaceholder.typicode.com/posts","method":"POST","headers": {"Content-Type":"application/json"},"body":"{ \"title\": \"foo\", \"body\": \"bar\", \"userId\": 1 }"}'
```

### In-Browser UI

1. Run `npm run dev`.
2. Open `http://localhost:3000` in your browser.
3. Select HTTP method, enter URL, add headers/body, and click **Send Request**.
4. View response in the **Response** pane and history in **History**.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deployment Steps

1. Create a production build:
   ```bash
   npm run build
   ```
2. Configure environment variables in your hosting platform (e.g., Vercel):
   - `DATABASE_HOST`
   - `DATABASE_PORT`
   - `DATABASE_NAME`
   - `DATABASE_USER`
   - `DATABASE_PASSWORD`
3. Deploy to Vercel (or another provider):
   ```bash
   npx vercel --prod
   ```
4. Ensure the database is reachable from your deployment and migrations have been run:
   ```bash
   npx mikro-orm migration:up
   ```
