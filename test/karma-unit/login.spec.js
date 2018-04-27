import { Login } from '../../src/login';
import { RouterStub, AuthStub, HttpMock } from './commons';
import { App } from '../../src/app';

class AuthStub1 extends AuthStub {
  authenticated = true;
  authenticate(name) {
    return Promise.resolve({
      name,
      token: 'heyvgyuv38t327rvuiqt78b934ujwehgyq89ery8t'
    });
  }
}

class AppStub extends App {
  authenticated = false;
}

describe('the Login module', () => {
  let login;
  let app1;
  let auth;

  beforeEach(() => {
    auth = new AuthStub1();
    // auth.setToken({sub: 'aowifjawifhiawofjo'});
    app1 = new AppStub(auth, new HttpMock());
    app1.router = new RouterStub();
    app1.authenticated = false;
    // app1.activate();
    login = new Login(app1);
  });

  it('authenticates a google user', (done) => {
    login.app.authenticate('google').then(() => {
      login.app.checkUser();
      expect(login.app.auth.token).toBe('heyvgyuv38t327rvuiqt78b934ujwehgyq89ery8t');
      expect(login.app.auth.isAuthenticated()).toBe(true);
      done();
    }, null);
  });

  it('should display the login form', (done) => {
    document.body.innerHTML = '<div class="home" style="max-width:5in; margin:auto"></div>';
    login.app.showForm('', login.login_Class);
    expect(document.getElementsByClassName('LoginForm')[0].style.display).toBe('');
    done();
  });

  it('should provide the route title', (done) => {
    login.attached();
    expect(login.title).toBe('Howdy is cool');
    done();
  });

  it('should set the token and send the user to the dashboard if logged in', (done) => {
    spyOn(window.localStorage, 'getItem').and.callFake(() => '1234');
    login.app.checkIfLoggedIn();
    expect(login.app.auth.isAuthenticated()).toBe(true);
    done();
  });
  it('should not set the token and not send the user to the dashboard if not logged in', (done) => {
    login.app.authenticated = false;
    spyOn(window.localStorage, 'getItem').and.callFake(() => null);
    login.app.checkIfLoggedIn();
    expect(login.app.authenticated).toBe(false);
    done();
  });
});
