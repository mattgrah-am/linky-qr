<template>
  <div class="container mx-auto p-4">
    <h1 class="text-4xl font-bold mb-8 text-center">
      ShortLink & QR Generator
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
          placeholder="Enter your long URL here" >
      </div>
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        @click="generateShortlink">
        Generate Shortlink & QR
      </button>

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
          <img :src="qrCodeDataUrl" alt="QR Code" class="w-48 h-48 mb-4" >
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
import QRCode from "qrcode";

const longUrl = ref("");
const shortlink = ref("");
const qrCodeDataUrl = ref("");
const qrCodeCopied = ref(false);

const generateShortlink = async () => {
  // In a real application, you would send longUrl to a backend API to generate a shortlink
  // For this example, we'll just use a dummy shortlink
  const dummyShortId = Math.random().toString(36).substring(2, 8);
  shortlink.value = `https://linky.qr/${dummyShortId}`;

  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(shortlink.value);
  } catch (err) {
    console.error(err);
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
