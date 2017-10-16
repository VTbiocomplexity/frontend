System.import('isomorphic-fetch');
System.import('whatwg-fetch');
import {PLATFORM} from 'aurelia-pal';
import {inject} from 'aurelia-framework';
import {AuthorizeStep} from 'aurelia-auth';
import {AuthService} from 'aurelia-auth';
import {HttpClient} from 'aurelia-fetch-client';
@inject(AuthService, HttpClient)
export class App {
  constructor(auth, httpClient) {
    this.auth = auth;
    this.httpClient = httpClient;
    this.dashboardTitle = 'Dashboard';
    this.role = '';
    this.configHttpClient();
    this.checkUser();
  }

  configHttpClient() {
    this.backend = '';
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production'){
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
    config.map([
      { route: 'dashboard', name: 'dashboard-router', moduleId: PLATFORM.moduleName('./dashboard-router'), nav: false, title: '', auth: true, settings: 'fa fa-tachometer'},
      { route: 'login', name: 'login', moduleId: PLATFORM.moduleName('./login'), nav: false, title: 'Login', settings: 'fa fa-sign-in'},
      { route: ['', 'home'], name: 'home', moduleId: PLATFORM.moduleName('./home'), nav: false, title: '', settings: 'fa fa-home' },
      // { route: 'users',         name: 'users',        moduleId: PLATFORM.moduleName('./users'),        nav: true, title: 'Github Users' },
      { route: 'child-router',  name: 'child-router', moduleId: PLATFORM.moduleName('./child-router'), nav: true, title: 'Child Router' },
      { route: ['welcome', 'welcome'], name: 'welcome',      moduleId: PLATFORM.moduleName('./welcome'),      nav: true, title: 'Welcome' }
    ]);
    config.fallbackRoute('/');
    this.router = router;
  }


  async checkUser(){
    if (this.auth.isAuthenticated()) {
      this.authenticated = true; //Logout element is reliant upon a local var;
      let uid = this.auth.getTokenPayload().sub;
      console.log(uid);
      //this.user = await this.appState.getUser(uid);
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
