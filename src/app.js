System.import('isomorphic-fetch');
System.import('whatwg-fetch');
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
    this.menuToggled = false;
  }

  dashboardTitle = 'Dashboard';
  role = '';
  email = '';
  password = '';
  authenticated = false;
  token = '';

  @bindable
  drawerWidth = '175px';

  @bindable
  contentWidth = '62px';

  @bindable
  fullmenu = true;

  async activate() {
    this.configHttpClient();
    this.appState = new AppState(this.httpClient);
    this.userAccess = new UserAccess(this.appState);
    await this.checkUser();
    console.log('hello!');
  }

  toggleMobileMenu(toggle) {
    document.getElementsByClassName('page-host')[0].style.overflow = 'auto';
    if (toggle !== 'close') {
      document.getElementsByClassName('page-host')[0].style.overflow = 'hidden';
      document.getElementsByClassName('page-host')[0].addEventListener('click', function() {
        let drawer = document.getElementsByClassName('drawer')[0];
        let toggleIcon = document.getElementsByClassName('mobile-menu-toggle')[0];
        if (event.target.className !== 'nav-list' && event.target.className !== 'menu-item') {
          drawer.style.display = 'none';
          $(drawer).parent().css('display', 'none');
          toggleIcon.style.display = 'block';
          document.getElementsByClassName('page-host')[0].style.overflow = 'auto';
        }
      });
    }
    this.menuToggled = true;
    let drawer = document.getElementsByClassName('drawer')[0];
    let toggleIcon = document.getElementsByClassName('mobile-menu-toggle')[0];
    if (drawer.style.display === 'none' && toggle !== 'close') {
      drawer.style.display = 'block';
      $(drawer).parent().css('display', 'block');
      toggleIcon.style.display = 'none';
    } else {
      drawer.style.display = 'none';
      $(drawer).parent().css('display', 'none');
      toggleIcon.style.display = 'block';
    }
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
    this.setFooter(style);
    return result;
  }

  get widescreen() {
    console.log('trying to get widescreen');
    let isWide = document.documentElement.clientWidth > 766;
    let drawer = document.getElementsByClassName('drawer')[0];
    let mobileMenuToggle = document.getElementsByClassName('mobile-menu-toggle')[0];
    console.log('hello!');
    if (!this.menuToggled) {
      console.log('did not toggle menu');
      if (!isWide) {
        if (drawer !== null && drawer !== undefined) {
          this.contentWidth = '0px';
          drawer.style.display = 'none';
          $(drawer).parent().css('display', 'none');
          mobileMenuToggle.style.display = 'block';
        }
      } else {
        if (drawer !== null && drawer !== undefined) {
          this.contentWidth = '0px';
          drawer.style.display = 'block';
          $(drawer).parent().css('display', 'block');
          mobileMenuToggle.style.display = 'none';
        }
      }
    }
    if (isWide) {
      if (drawer !== null && drawer !== undefined) {
        if (this.fullmenu) {
          this.contentWidth = '181px';
        } else {
          this.contentWidth = '62px';
        }

        drawer.style.display = 'block';
        $(drawer).parent().css('display', 'block');
        mobileMenuToggle.style.display = 'none';
      }
    }
    let mainP = document.getElementsByClassName('main-panel')[0];
    if (mainP !== null && mainP !== undefined) {
      mainP.style.marginRight = this.contentWidth;
    }
    return isWide;
  }

  setFooter(style) {
    let footer = document.getElementById('wjfooter');
    let color = '';
    /* istanbul ignore else */
    if (footer !== null) {
      footer.style.backgroundColor = '#2a222a';
      footer.innerHTML = '<div style="text-align: center">' +
      '<span>&nbsp;&nbsp;</span><a target="_blank" style="color:' + color + '"  href="https://www.facebook.com/biocomplexity/"><i class="fa fa-facebook-square fa-2x"></i></a>' +
      '<span>&nbsp;&nbsp;</span><a target="_blank" style="color:' + color + '"  href="https://twitter.com/ndssl_bi"><i class="fa fa-twitter fa-2x"></i></a><br>' +
      '</span></div>';
    }
  }

  close() {
    console.log('going to close the menu if not widescreen');
    if (!this.widescreen) {
      this.toggleMobileMenu('close');
    }
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
      this.user = await this.appState.getUser(uid);
    }
  }

  logout() {
    this.authenticated = false;
    this.auth.logout('/')
    .then(() => {
      localStorage.clear();
      console.log('Promise fulfilled, logged out');
    });
  }

  attached() {
    console.log(this.widescreen);
  }

}
