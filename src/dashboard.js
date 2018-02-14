import {inject} from 'aurelia-framework';
import {App} from './app';
//import {json} from 'aurelia-fetch-client';
@inject(App)
export class Dashboard {
  constructor(app) {
    this.app = app;
  }
  async activate() {
    this.userTypes = JSON.parse(process.env.userRoles).roles;
    this.uid = this.app.auth.getTokenPayload().sub;
    this.user = await this.app.appState.getUser(this.uid);
    console.log(this.user);
    console.log(this.app.auth.tokenInterceptor);
    // if (localStorage.getItem('userEmail') === null) {
    localStorage.setItem('userEmail', this.user.email);
    // }
    if (localStorage.getItem('token') === null) {
      let newToken = sessionStorage.getItem('aurelia_id_token');
      if (newToken === null) {
        newToken = localStorage.getItem('aurelia_id_token');
        console.log('this is the newToken');
        console.log(newToken);
      }
      localStorage.setItem('token', newToken);
    }
    this.newUser = false;
    /* istanbul ignore else */
    if (this.user.userType === 'Developer') {
      this.userTypes.push('Developer');
    }
    this.childRoute();
    //console.log(this.user);
  }

  childRoute() {
    if (this.user.userType === undefined || this.user.userType === '' || this.user.userType === null) {
      this.newUser = true;
      console.log('new user');
      this.app.router.navigate('dashboard/user-account');
    }
    if (this.user.userType === 'Developer') {
      this.app.router.navigate('dashboard/developer');
    }
    //else {
    //   this.app.router.navigate('/');
    // }
  }

  // async updateUser(){
  //   await fetch;
  //   this.app.httpClient.fetch('/user/' + this.uid, {
  //     method: 'put',
  //     body: json(this.user)
  //   })
  //   .then((response) => response.json())
  //   .then((data) => {
  //     this.app.appState.setUser(this.user);
  //     //this.app.appState.checkUserRole();
  //     //this.app.appState.newUser = false;
  //     this.activate();
  //   });
  // }
}
