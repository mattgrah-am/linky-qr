import { defineEventHandler, readBody } from "h3";
import qrcode from "qrcode";

export default defineEventHandler(async (event) => {
  if (event.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { text } = await readBody(event);

    if (!text) {
      return new Response("Missing text for QR code generation", {
        status: 400,
      });
    }

    // Generate QR code as a data URL (PNG format)
    const qrCodeDataUrl = await qrcode.toDataURL(text);

    return new Response(JSON.stringify({ qrCodeDataUrl }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    let errorMessage = "An unknown error occurred during QR code generation.";
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
