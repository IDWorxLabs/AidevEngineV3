import { runWebUiRegression } from './web-ui-regression.js';

runWebUiRegression()
  .then((ok) => process.exit(ok ? 0 : 1))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
