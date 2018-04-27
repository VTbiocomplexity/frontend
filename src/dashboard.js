import { inject } from 'aurelia-framework';
import { App } from './app';
@inject(App)
export default class Dashboard {
  constructor(app) {
    this.app = app;
  }
  async activate() {
    this.userTypes = JSON.parse(process.env.userRoles).roles;
    this.uid = this.app.auth.getTokenPayload().sub;
    this.user = await this.app.appState.getUser(this.uid);
    localStorage.setItem('userEmail', this.user.email);
    // if (localStorage.getItem('ndssl_id_token') === null) {
    //   let newToken = sessionStorage.getItem('ndssl_id_token');
    //   localStorage.setItem('ndssl_id_token', newToken);
    // }
    // sessionStorage.clear();
    this.childRoute();
  }

  childRoute() {
    if (this.user.userType === undefined || this.user.userType === '' || this.user.userType === null) {
      console.log('new user');
      this.app.router.navigate('dashboard/user-account');
    }
    if (this.user.userType === 'Developer') {
      this.app.router.navigate('dashboard/developer');
    }
  }
}
