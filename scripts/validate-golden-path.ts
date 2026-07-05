/**
 * Entry point for npm run validate:golden-path
 */

import { exitAfterRegression } from './validate-exit.js';
import { runGoldenPathRegression } from './golden-path-regression.js';

runGoldenPathRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
