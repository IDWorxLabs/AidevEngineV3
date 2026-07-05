import { exitAfterRegression } from './validate-exit.js';
import { runArchitectureGuidedGenerationRegression } from './architecture-guided-generation-path-regression.js';

runArchitectureGuidedGenerationRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
