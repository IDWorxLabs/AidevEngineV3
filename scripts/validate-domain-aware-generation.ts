import { exitAfterRegression } from './validate-exit.js';
import { runDomainAwareGenerationRegression } from './domain-aware-generation-path-regression.js';

runDomainAwareGenerationRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
