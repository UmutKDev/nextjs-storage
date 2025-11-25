This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

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
 
## Storage: optimistic delete behavior

The Storage UI uses optimistic updates when deleting a file. When you confirm a delete the UI will remove the file immediately from the list (optimistic update) and call the backend. If the delete succeeds the UI stays updated; if it fails, the previous state is restored and the user is shown an error toast.

This improves perceived performance and makes the UI feel more responsive while the backend request completes.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## API client (axios) — usage

This project includes a shared Axios helper at `lib/axios.ts` with a factory `createApiClient` and a default client `api`.

Example usage:

```ts
import { createApiClient, api } from "./lib/axios";

// server side: create an instance for the API base url
const client = createApiClient({ axiosConfig: { baseURL: process.env.NESTJS_API_URL } });

// client side: there's also a default `api` instance that reads tokens from localStorage
await api.get('/some/resource');

// We also handle refresh token flow automatically when a 401 is encountered (if a refresh token is present).
```
