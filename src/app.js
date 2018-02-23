System.import('isomorphic-fetch');
System.import('whatwg-fetch');
//System.import('popper.js');
import {PLATFORM} from 'aurelia-pal';
import {inject, bindable} from 'aurelia-framework';
import {AuthorizeStep, AuthService} from 'aurelia-auth';
import {UserAccess} from './classes/UserAccess.js';
import {HttpClient} from 'aurelia-fetch-client';
import {AppState} from './classes/AppState.js';
@inject(AuthService, HttpClient)
export class App {
  constructor(auth, httpClient) {
    this.auth = auth;
    this.httpClient = httpClient;
    //this.fullmenu = true;
    //this.dashboardTitle = 'Dashboard';
    //this.role = '';
    //this.configHttpClient();
    //this.checkUser();
  }

  dashboardTitle = 'Dashboard';
  role = '';
  authenticated = false;
  email = '';
  password = '';
  authenticated = false;
  token = '';
  expanded = false;

  @bindable
  drawerWidth = '175px';

  @bindable
  fullmenu = true;

  //mobileDrawerOpen = false;

  async activate() {
    this.configHttpClient();
    this.appState = new AppState(this.httpClient);
    this.userAccess = new UserAccess(this.appState);
    await this.checkUser();
  }

  get drawerOpen() {
    let drawer = document.getElementById('drawerPanel');
    if (drawer !== null) {
      if (drawer.selected === 'drawer') {
        this.hideToggle();
        return true;
      }
    }
    this.close();
    return false;
  }

  get widescreen() {
    let isWidescreen = document.documentElement.clientWidth > 766;
    /* istanbul ignore else */
    if (isWidescreen) {
      this.hideToggle();
    }
    return isWidescreen;
  }

  get currentStyles() {
    let result = {};
    let style = 'wj';
    let mobilemenutoggle = document.getElementById('mobilemenutoggle');
    result = {
      headerImagePath: '../static/imgs/BI_logo.jpg',
      headerText1: 'NDSSL',
      headerClass: 'home-header',
      headerImageClass: 'home-header-image',
      sidebarClass: 'home-sidebar',
      menuToggleClass: 'home-menu-toggle'
    };
    result.sidebarImagePath = '../static/imgs/BI_logo2.jpg';
      /* istanbul ignore else */
    if (mobilemenutoggle !== null) {
      mobilemenutoggle.style.backgroundColor = '#2a222a';
    }
    //}
    this.setFooter(style);
    return result;
  }

  setFooter(style) {
    let footer = document.getElementById('wjfooter');
    let color = '';
      /* istanbul ignore else */
    if (footer !== null) {
      footer.style.backgroundColor = '#2a222a';
      // if (style === 'ohaf') {
      //   footer.style.backgroundColor = '#565656';
      //   color = '#c09580';
      // }
      footer.innerHTML = '<div style="text-align: center">' +
      // '<a target="_blank" style="color:' + color + '" href="https://github.com/WebJamApps"><i class="fa fa-github fa-2x" aria-hidden="true"></i></a>' +
      // '<span>&nbsp;&nbsp;</span><a target="_blank" style="color:' + color + '"  href="https://www.linkedin.com/company-beta/16257103"><i class="fa fa-linkedin fa-2x" aria-hidden="true"></i></a>' +
      '<span>&nbsp;&nbsp;</span><a target="_blank" style="color:' + color + '"  href="https://www.facebook.com/biocomplexity/"><i class="fa fa-facebook-square fa-2x" aria-hidden="true"></i></a>' +
      // '<span>&nbsp;&nbsp;</span><a target="_blank" style="color:' + color + '"  href="https://plus.google.com/u/1/109586499331294076292"><i class="fa fa-google-plus-square fa-2x" aria-hidden="true"></i></a>' +
      '<span>&nbsp;&nbsp;</span><a target="_blank" style="color:' + color + '"  href="https://twitter.com/ndssl_bi"><i class="fa fa-twitter fa-2x" aria-hidden="true"></i></a><br>' +
      // '<span style="color:white; font-size: 9pt; padding-left:18px;">Powered by ' +
      // '<a class="wjllc" target="_blank" href="https://www.web-jam.com">Web Jam LLC</a>
      '</span></div>';
    }
  }

  toggleMenu() {
    //console.debug(this.fullmenu);
    if (this.fullmenu) {
      this.fullmenu = false;
      this.drawerWidth = '50px';
    } else {
      this.fullmenu = true;
      this.drawerWidth = '175px';
    }
  }

  close() {
    let drawer = document.getElementById('drawerPanel');
    if (drawer !== null) {
      drawer.closeDrawer();
      //console.log(drawer);
    }
    if (!this.widescreen) {
      let mobilemenutoggle = document.getElementById('mobilemenutoggle');
          /* istanbul ignore else */
      if (mobilemenutoggle !== null) {
        mobilemenutoggle.style.display = 'block';
      }
    }
  }

  hideToggle() {
    //console.log('going to hide you hamburger!');
    let mobilemenutoggle = document.getElementById('mobilemenutoggle');
        /* istanbul ignore else */
    if (mobilemenutoggle !== null) {
      mobilemenutoggle.style.display = 'none';
    }
    //let drawer = document.getElementById('drawerPanel');
    //console.log(drawer);
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
      localStorage.clear();
      // localStorage.removeItem('token');
      // localStorage.removeItem('userEmail');
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
