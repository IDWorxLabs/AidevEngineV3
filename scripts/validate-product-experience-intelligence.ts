import { exitAfterRegression } from './validate-exit.js';
import { runProductExperienceIntelligenceRegression } from './product-experience-intelligence-path-regression.js';

runProductExperienceIntelligenceRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
