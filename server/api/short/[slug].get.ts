import { defineEventHandler, getRouterParams, sendRedirect } from "h3";
import _localKvStore from "~/server/utils/localKvStore"; // Import the shared store

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event);

  if (!slug) {
    return new Response("Missing short code", { status: 400 });
  }

  let destinationURL: string | null = null;

  // Check if Cloudflare KV binding is available (for deployed Worker)
  if (
    process.env.NODE_ENV === "production" &&
    event.context.cloudflare?.env?.REDIRECTS
  ) {
    destinationURL = await event.context.cloudflare.env.REDIRECTS.get(
      slug.toLowerCase()
    );
  } else {
    // Fallback for local development using in-memory store
    destinationURL = _localKvStore.get(slug.toLowerCase()) || null;
  }

  if (destinationURL === null) {
    // If the short code is not found, redirect to a default 404 page
    return sendRedirect(event, "https://linkyqr.com/404", 302);
  }

  // Perform the redirect to the stored URL
  return sendRedirect(event, destinationURL, 302);
});
