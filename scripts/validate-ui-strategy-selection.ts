import { exitAfterRegression } from './validate-exit.js';
import { runUiStrategySelectionRegression } from './ui-strategy-selection-path-regression.js';

runUiStrategySelectionRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
