import { createVitestConfig } from "@cjarero183006/cli-builder/configs/vitest.base.js";

export default createVitestConfig({
  include: ["src/__tests__/**/*.spec.ts"],
});
