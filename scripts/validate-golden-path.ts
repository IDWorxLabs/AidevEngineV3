/**
 * Entry point for npm run validate:golden-path
 */

import { runGoldenPathRegression } from './golden-path-regression.js';

runGoldenPathRegression()
  .then((ok) => process.exit(ok ? 0 : 1))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
