import { exitAfterRegression } from './validate-exit.js';
import { runProductArchitectureIntelligenceRegression } from './product-architecture-intelligence-path-regression.js';

runProductArchitectureIntelligenceRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
