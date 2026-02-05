import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  plugins: {
    "postcss-import": {
      path: [join(__dirname, "node_modules")],
    },
    "@tailwindcss/postcss": {},
  },
};

export default config;
