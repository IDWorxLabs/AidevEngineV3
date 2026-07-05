import { exitAfterRegression } from './validate-exit.js';
import { runWorkflowIntelligenceRegression } from './workflow-intelligence-path-regression.js';

runWorkflowIntelligenceRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
