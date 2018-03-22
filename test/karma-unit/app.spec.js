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
  beforeEach(() => {
    app1 = new App(new AuthStub(), new HttpMock());
    app1.auth.setToken({sub: 'token'});
    app1.activate();
    app1.appState = new AppStateStub();
    app2 = new App(new AuthStub2(), new HttpMock());
    app2.activate();
    app2.appState = new AppStateStub();
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

  it('should logout and then display the login button', testAsync(async function() {
    await app1.logout();
    await app1.checkUser();
    //login.app.checkUser();
    expect(app1.auth.authenticated).toBe(false);
    expect(app1.authenticated).toBe(false);
    //done();
  }));

  // it('displays the mobile menu hamburger when drawer is closed and not widescreen', testAsync(async function() {
  //   document.body.innerHTML = '';
  //   // isOpen = app1.drawerOpen;
  //   // expect(isOpen).toBe(false);
  //   document.body.innerHTML = '<div id="mobilemenutoggle" style="display:none"></div><div id="drawerPanel"></div>';
  //   let drawer = document.getElementById('drawerPanel');
  //   drawer.closeDrawer = function() {};
  //   drawer.selected = 'drawer';
  //   let isOpen = app1.drawerOpen;
  //   expect(isOpen).toBe(true);
  //   drawer.selected = '';
  //   isOpen = app1.drawerOpen;
  //   expect(isOpen).toBe(false);
  //   viewport.set(320);
  //   app1.close();
  //   expect(document.getElementById('mobilemenutoggle').style.display).toBe('block');
  //   //done();
  //   viewport.reset();
  // }));


  // it('closes the menu on cellphone display', (done) => {
  //   //console.log(app1);
  //   app1.activate().then(() => {
  //     app1.close();
  //     //expect(app1.authenticated).toBe(false);
  //   });
  //   done();
  // });

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

  it('closes the menu on cellphone display', (done) => {
    //console.log(app1);
    app1.activate().then(() => {
      app1.close();
      //expect(app1.authenticated).toBe(false);
    });
    done();
  });
  it('should get widescreen', (done) => {
    //console.log(app1);
    viewport.set(1000);
    const app3 = new App(new AuthStub, new HttpMock);
    expect(app3.widescreen).toBe(true);
    done();
    viewport.reset();
  });

  // it('should toggle menu to be icons only', () => {
  //   app2.activate();
  //   app2.fullmenu = true;
  //   //console.log(app1);
  //   app2.toggleMenu();
  //   expect(app2.fullmenu).toBe(false);
  //   expect(app2.drawerWidth).toBe('50px');
  //   //done();
  // });

//   it('should toggle menu to be icons with text', () => {
//     app1.fullmenu = false;
//     //console.log(app1);
//     app1.toggleMenu();
//     expect(app1.fullmenu).toBe(true);
//     expect(app1.drawerWidth).toBe('175px');
//   });
//
});
