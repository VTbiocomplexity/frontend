import {Login} from '../../src/login';
import {RouterStub, AuthStub, HttpMock} from './commons';
import {App} from '../../src/app';


class AuthStub1 extends AuthStub {
  authenticate(name, f = false, o = null) {
    return Promise.resolve({
      name: name,
      token: 'heyvgyuv38t327rvuiqt78b934ujwehgyq89ery8t'
    });
  }
}

class AppStub extends App{
  authenticated = false;
}

describe('the Login module', () => {
  let login;
  let app1;
  let auth;

  beforeEach(() => {
    auth = new AuthStub1();
    //auth.setToken({sub: 'aowifjawifhiawofjo'});
    app1 = new AppStub(auth, new HttpMock());
    app1.router = new RouterStub();
    //app1.activate();
    login = new Login(app1);
    //login.app.appState = new AppStateStub();
    //login.activate();
    //sut.app.appState = new AppStateStub();
    //sut.app.authenticated = false;
  });

  it('should authentication', (done) => {
    login.authenticate('google').then((data) => {
      //console.log(login.app.auth);
      expect(login.app.auth.token).toBe('heyvgyuv38t327rvuiqt78b934ujwehgyq89ery8t');
      //expect(login.app.authenticated).toBe(true);
      done();
    }, null);
  });

  it('should provide the route title', (done) => {
    login.attached();
    expect(login.title).toBe('Howdy is cool');
    done();
  });
});
