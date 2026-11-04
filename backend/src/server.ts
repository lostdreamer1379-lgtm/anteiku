import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

// Vercel uses the exported Express app as a serverless function. Keep the
// local listener for `npm run dev` and `npm start` only.
if (process.env.VERCEL !== "1") {
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Anteiku backend listening on :${env.port}`);
  });
}

export default app;
