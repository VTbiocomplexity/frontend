import { PLATFORM } from 'aurelia-pal';

export class DashboardRouter {
  heading = 'Dashboard Router';
  configureRouter(config, router) {
    config.map([
      {
        route: '', name: 'dashboard', moduleId: PLATFORM.moduleName('./dashboard'), nav: false, title: 'Dashboard', auth: true
      },
      {
        route: 'developer', name: 'developer', moduleId: PLATFORM.moduleName('./dashboard-child-routes/developer'), nav: false, title: 'Developer', auth: true
      },
      {
        route: 'user-account', name: 'user-account', moduleId: PLATFORM.moduleName('./dashboard-child-routes/user-account'), nav: true, title: 'User Account', auth: true
      },
      {
        route: 'rafter', name: 'rafter', moduleId: PLATFORM.moduleName('./dashboard-child-routes/rafter'), nav: true, title: 'Rafter', auth: true
      }
    ]);
    this.router = router;
  }
}
