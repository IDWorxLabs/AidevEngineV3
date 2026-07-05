import { exitAfterRegression } from './validate-exit.js';
import { runProductDesignIntelligenceRegression } from './product-design-intelligence-path-regression.js';

runProductDesignIntelligenceRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
