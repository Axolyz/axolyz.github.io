import { defineConfig } from "astro/config";
import { siteTheme } from "./src/theme/integration";
import sageConfig from "./sage.config";

export default defineConfig({
  site: sageConfig.site.url,
  trailingSlash: "always",
  integrations: [siteTheme(sageConfig)],
});
