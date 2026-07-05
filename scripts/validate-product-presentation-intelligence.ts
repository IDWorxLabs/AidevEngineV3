import { exitAfterRegression } from './validate-exit.js';
import { runProductPresentationIntelligenceRegression } from './product-presentation-intelligence-path-regression.js';

runProductPresentationIntelligenceRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
