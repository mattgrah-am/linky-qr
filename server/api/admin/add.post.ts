import { defineEventHandler, readBody } from "h3";
import _localKvStore from "~/server/utils/localKvStore"; // Import the shared store

export default defineEventHandler(async (event) => {
  if (event.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { shortCode, destinationURL } = await readBody(event);

    if (!shortCode || !destinationURL) {
      return new Response("Missing shortCode or destinationURL", {
        status: 400,
      });
    }

    // Check if Cloudflare KV binding is available (for deployed Worker)
    if (
      process.env.NODE_ENV === "production" &&
      event.context.cloudflare?.env?.REDIRECTS
    ) {
      await event.context.cloudflare.env.REDIRECTS.put(
        shortCode.toLowerCase(),
        destinationURL
      );
    } else {
      // Fallback for local development using in-memory store
      _localKvStore.set(shortCode.toLowerCase(), destinationURL);
    }

    return new Response(
      `Short link '${shortCode}' created/updated successfully.`,
      { status: 200 }
    );
  } catch (e) {
    let errorMessage = "An unknown error occurred.";
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return new Response(`Error adding short link: ${errorMessage}`, {
      status: 500,
    });
  }
});
