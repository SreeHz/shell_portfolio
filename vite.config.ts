import { defineConfig } from "vite";

export default defineConfig({
  // Relative base so the site works at https://<user>.github.io/<repo>/
  // no matter what the repo is named.
  base: "./",
});
