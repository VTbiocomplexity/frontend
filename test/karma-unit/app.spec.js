import {App} from '../../src/app';
import {AuthStub, HttpMock, RouterStub, AppStateStub} from './commons';
const Counter = require('assertions-counter');

function testAsync(runAsync) {
  return (done) => {
    runAsync().then(done, (e) => { fail(e); done(); });
  };
}

class AuthStub2 extends AuthStub {
  isAuthenticated() {
    this.authenticated = false;
    return this.authenticated;
  }
}

describe('the App module', () => {
  let app1;
  let app2;
  let app4;
  beforeEach(() => {
    app1 = new App(new AuthStub(), new HttpMock());
    app1.auth.setToken({sub: 'token'});
    app1.activate();
    app1.appState = new AppStateStub();
    app2 = new App(new AuthStub2(), new HttpMock());
    app2.activate();
    app2.appState = new AppStateStub();
    app4 = new App(new AuthStub(), new HttpMock('error'));
    app4.auth.setToken({sub: 'token'});
    app4.activate();
    app4.appState = new AppStateStub();
  });

  afterEach(() => {
    viewport.reset();
  });

  it('tests configHttpClient', (done) => {
    const { add: ok } = new Counter(4, done);
    app1.auth.tokenInterceptor = 'tokenInterceptor';
    app1.configHttpClient();
    app1.httpClient.__configureCallback(new(class {
      withDefaults(opts) {
        expect(opts.mode).toBe('cors');
        ok();
        return this;
      }
      useStandardConfiguration() {
        ok();
        return this;
      }
      withBaseUrl() {
        ok();
        return this;
      }
      withInterceptor(token) {
        expect(token).toBe(app1.auth.tokenInterceptor);
        ok();
        return this;
      }
    })());
  });

  it('configures the router', (done) => {
    let configStub = {options: {pushState: true}, addPipelineStep() {}, map() {}, fallbackRoute() {}};
    app1.configureRouter(configStub, RouterStub);
    expect(app1.router).toBeDefined;
    done();
  });

  it('updates by id', testAsync(async function() {
    await app1.updateById('/user/', '123', {});
  }));

  it('catches error on update by id', testAsync(async function() {
    //app1.app.httpClient = new HttpMock('error');
    await app4.updateById('/user/', '123', {});
  }));

  it('should logout and then display the login button', testAsync(async function() {
    await app1.logout();
    await app1.checkUser();
    //login.app.checkUser();
    expect(app1.auth.authenticated).toBe(false);
    expect(app1.authenticated).toBe(false);
    //done();
  }));

  it('closes the menu on cellphone display', (done) => {
    //console.log(app1);
    app1.activate().then(() => {
      app1.close();
      //expect(app1.authenticated).toBe(false);
    });
    done();
  });

  it('does not display the mobile menu hamburger when in widescreen', testAsync(async function() {
    document.body.innerHTML = '<div id="mobilemenutoggle"></div>';
    // document.style = 'width:600px';
    // document.width = 600;
    // window.resizeTo(500, 600);
    // document.documentElement.clientWidth =  600;
    let ws = app1.widescreen;
    expect(ws).toBe(true);
    //done();
  }));

  it('gets the current styles', (done) => {
    //let routre = new RouterStub();
    //routre.currentInstruction.config.name = 'ohaf';
    document.body.innerHTML = '<div id="wjfooter" class="footer"><i id="mobilemenutoggle"></i></div>';
    //app1.router = routre;
    app1.currentStyles;
    done();
  });

  fit('makes a swipeable area and disables it when navigated away from this page', testAsync(async function() {
    document.body.innerHTML = '<div class="page-host" hasEvent="true"><div class="swipe-area"></div></div>';
    await app1.attached();
    expect(app1.manager).toBeDefined;
    await app1.detached();
    expect(document.getElementsByClassName('page-host')[0].getAttribute('hasEvent')).toBe('false');
  }));

  it('closes the menu on cellphone display', (done) => {
    viewport.set(500);
    document.body.innerHTML = '<div class="page-host"><div class="swipe-area"></div><div class="drawer-container"><div class="drawer"></div></div><div class="main-panel"><i class="mobile-menu-toggle"></i></div></div>';
    app1.manager = {on: function() {}, off: function() {}};
    app1.close();
    expect(document.getElementsByClassName('drawer')[0].style.display).toBe('none');
    done();
    viewport.reset();
  });

  it('opens the menu on cellphone display, then closes it', (done) => {
    viewport.set(500);
    document.body.innerHTML = '<div class="page-host"><div class="swipe-area"></div><div class="drawer-container"><div class="drawer" style="display:none"></div></div><div class="main-panel"><i class="mobile-menu-toggle"></i></div></div>';
    app1.manager = {on: function() {}, off: function() {}};
    app1.toggleMobileMenu();
    expect(document.getElementsByClassName('drawer')[0].style.display).toBe('block');
    document.getElementsByClassName('page-host')[0].click();
    expect(document.getElementsByClassName('drawer')[0].style.display).toBe('none');
    done();
    viewport.reset();
  });

  it('should get widescreen as true', (done) => {
    //console.log(app1);
    viewport.set(1000);
    const app3 = new App(new AuthStub, new HttpMock);
    expect(app3.widescreen).toBe(true);
    done();
    viewport.reset();
  });
});
