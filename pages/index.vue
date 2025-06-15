<template>
  <div class="container mx-auto p-4">
    <h1 class="text-4xl font-bold mb-8 text-center">
      Linky QR - Dynamic QR Code Generator
    </h1>
    <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <div class="mb-4">
        <label for="longUrl" class="block text-gray-700 text-sm font-bold mb-2"
          >Long URL:</label
        >
        <input
          id="longUrl"
          v-model="longUrl"
          type="url"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter your long URL here" />
      </div>
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        @click="generateShortlink"
        :disabled="loading">
        {{ loading ? "Generating..." : "Generate Shortlink & QR" }}
      </button>

      <p v-if="error" class="text-red-500 mt-4">Error: {{ error }}</p>

      <div v-if="shortlink" class="mt-8">
        <h2 class="text-2xl font-bold mb-4">Generated Link:</h2>
        <p class="text-gray-800 break-all mb-4">
          <a
            :href="shortlink"
            target="_blank"
            class="text-blue-600 hover:underline"
            >{{ shortlink }}</a
          >
        </p>
        <div v-if="qrCodeDataUrl" class="flex flex-col items-center mt-4">
          <img :src="qrCodeDataUrl" alt="QR Code" class="w-48 h-48 mb-4" />
          <button
            class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mb-2"
            @click="downloadQrCode">
            Download QR Code
          </button>
          <button
            class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            @click="copyQrCodeImageUrl">
            {{ qrCodeCopied ? "Copied!" : "Copy QR Code Image URL" }}
          </button>
        </div>
        <button
          class="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          @click="copyShortlink">
          Copy Shortlink
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const longUrl = ref("");
const shortlink = ref("");
const qrCodeDataUrl = ref("");
const qrCodeCopied = ref(false);
const loading = ref(false);
const error = ref(null);

const generateShortlink = async () => {
  loading.value = true;
  error.value = null;
  shortlink.value = "";
  qrCodeDataUrl.value = "";

  if (!longUrl.value) {
    error.value = "Please enter a URL.";
    loading.value = false;
    return;
  }

  try {
    // 1. Generate a unique short ID (for local development/example)
    const dummyShortId = Math.random().toString(36).substring(2, 8);

    // 2. Call the server function to add the short link to KV
    const _addResponse = await $fetch("/api/admin/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        shortCode: dummyShortId,
        destinationURL: longUrl.value,
      },
    });

    // Construct the full shortlink URL (assuming it's on the same domain as your Nuxt app)
    // In production, this would be your Cloudflare Pages custom domain or worker.dev subdomain
    shortlink.value = `${window.location.origin}/api/short/${dummyShortId}`;

    // 3. Call the server function to generate the QR code
    const qrResponse = await $fetch("/api/qr/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        text: shortlink.value,
      },
    });

    qrCodeDataUrl.value = qrResponse.qrCodeDataUrl;
  } catch (err) {
    console.error("Error generating shortlink or QR code:", err);
    error.value =
      err.data?.message ||
      err.message ||
      "Failed to generate. Please try again.";
  } finally {
    loading.value = false;
  }
};

const copyShortlink = () => {
  navigator.clipboard.writeText(shortlink.value);
  alert("Shortlink copied to clipboard!");
};

const downloadQrCode = () => {
  const link = document.createElement("a");
  link.href = qrCodeDataUrl.value;
  link.download = "qrcode.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const copyQrCodeImageUrl = () => {
  navigator.clipboard.writeText(qrCodeDataUrl.value);
  qrCodeCopied.value = true;
  setTimeout(() => {
    qrCodeCopied.value = false;
  }, 2000); // Reset after 2 seconds
};
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
