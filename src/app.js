System.import('isomorphic-fetch');
System.import('whatwg-fetch');
import {PLATFORM} from 'aurelia-pal';
import {inject} from 'aurelia-framework';
import {AuthorizeStep, AuthService} from 'aurelia-auth';
import {UserAccess} from './classes/UserAccess.js';
import {HttpClient} from 'aurelia-fetch-client';
import {AppState} from './classes/AppState.js';
@inject(AuthService, HttpClient)
export class App {
  constructor(auth, httpClient) {
    this.auth = auth;
    this.httpClient = httpClient;
    //this.dashboardTitle = 'Dashboard';
    //this.role = '';
    //this.configHttpClient();
    //this.checkUser();
  }

  dashboardTitle = 'Dashboard';
  role = '';
  authenticated = false;

  async activate() {
    this.configHttpClient();
    this.appState = new AppState(this.httpClient);
    this.userAccess = new UserAccess(this.appState);
    await this.checkUser();
  }

  configHttpClient() {
    this.backend = '';
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      this.backend = process.env.BackendUrl;
    }
    this.httpClient.configure((httpConfig) => {
      httpConfig
      .withDefaults({
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json'
        }
      })
      .useStandardConfiguration()
      .withBaseUrl(this.backend)
      .withInterceptor(this.auth.tokenInterceptor); //Adds bearer token to every HTTP request.
    });
  }

  configureRouter(config, router) {
    config.title = 'NDSSL';
    config.options.pushState = true;
    config.options.root = '/';
    config.addPipelineStep('authorize', AuthorizeStep);//Is the actually Authorization to get into the /dashboard
    config.addPipelineStep('authorize', this.userAccess);// provides access controls to prevent users from certain /dashboard child routes when not their userType (role)
    config.map([
      { route: 'dashboard', name: 'dashboard-router', moduleId: PLATFORM.moduleName('./dashboard-router'), nav: false, title: '', auth: true, settings: 'fa fa-tachometer'},
      { route: 'login', name: 'login', moduleId: PLATFORM.moduleName('./login'), nav: false, title: 'Login', settings: 'fa fa-sign-in'},
      { route: ['', 'home'], name: 'home', moduleId: PLATFORM.moduleName('./home'), nav: false, title: '', settings: 'fa fa-home' },
      { route: 'userutil', name: 'userutil', moduleId: PLATFORM.moduleName('./userutil'), nav: false, title: '' },
      { route: ['welcome', 'welcome'], name: 'welcome',      moduleId: PLATFORM.moduleName('./welcome'),      nav: true, title: 'Welcome' }
    ]);
    config.fallbackRoute('/');
    this.router = router;
  }


  async checkUser() {
    if (this.auth.isAuthenticated()) {
      this.authenticated = true; //Logout element is reliant upon a local var;
      let uid = this.auth.getTokenPayload().sub;
      //console.log(uid);
      this.user = await this.appState.getUser(uid);
      // if (this.user !== undefined){
      //   this.role = this.user.userType;
      // }
    }
  }

  logout() {
    //this.appState.setUser({});
    this.authenticated = false;
    //if (this.role !== 'Charity' && this.role !== 'Volunteer'){
    this.auth.logout('/')
    .then(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('useremail');
      console.log('Promise fulfilled, logged out');
    });
    // } else {
    //   this.auth.logout('/ohaf')
    //   .then(() => {
    //     console.log('Promise fulfilled, logged out');
    //   });
    //  }
    //this.role =  '';
    //this.appState.isOhafLogin = false;
  }

}
