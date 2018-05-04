// we want font-awesome to load as soon as possible to show the fa-spinner

import * as Bluebird from 'bluebird';
import 'babel-polyfill';
import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../static/styles.css';
import config from './authConfig';
// import 'inputmask';
// import 'jquery-touchswipe';
// remove out if you don't want a Promise polyfill (remove also from webpack.config.js)
Bluebird.config({ warnings: { wForgottenReturn: false } });

export async function configure(aurelia) { // eslint-disable-line
  aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .plugin(PLATFORM.moduleName('au-table'))
    .plugin(PLATFORM.moduleName('aurelia-validation'))
    .plugin(PLATFORM.moduleName('aurelia-auth'), (baseConfig) => {
      baseConfig.configure(config);
    });

  // Uncomment the line below to enable animation.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-animator-css'));
  // if the css animator is enabled, add swap-order="after" to all router-view elements

  // Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-html-import-template-loader'));
  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
  // await aurelia.start();
  // await aurelia.setRoot(PLATFORM.moduleName('app'));
}
