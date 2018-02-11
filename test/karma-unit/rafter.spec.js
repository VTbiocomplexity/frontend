import {Rafter} from '../../src/dashboard-child-routes/rafter';
import {App} from '../../src/app';
import {AuthStub, HttpMock, AppStateStub, RouterStub} from './commons';

function testAsync(runAsync) {
  return (done) => {
    runAsync().then(done, (e) => { fail(e); done(); });
  };
}
//let dv = new Developer();

describe('The Rafter Dashboard', () => {
  let rd;
  let rd2;
  let auth;
  let app;
  let app2;
  beforeEach(() => {
    auth = new AuthStub();
    auth.setToken({sub: '3456'});
    app = new App(auth, new HttpMock());
    app.router = new RouterStub();
    app.activate();
    rd = new Rafter(app);
    rd.app.appState = new AppStateStub();
    rd.activate();
    app2 = new App(auth, new HttpMock('rafterError'));
    app2.router = new RouterStub();
    app2.activate();
    rd2 = new Rafter(app2);
    rd2.app.appState = new AppStateStub();
    rd2.activate();
  });

  it('should activate', testAsync(async function() {
    await rd.activate();
    expect(rd.uid).toBe('3456');
  }));

  it('Validates the login form', testAsync(async function() {
    document.body.innerHTML = '<div><button disabled class="rafterLoginButton"></button></div>';
    rd.rafter = {id: 'yo', password: 'yo'};
    await rd.validate();
    let buttonDisabled = document.getElementsByClassName('rafterLoginButton')[0].getAttribute('disabled');
    console.log(buttonDisabled);
    expect(buttonDisabled).toBe(null);
    rd.rafter = {id: '', password: 'yo'};
    await rd.validate();
    buttonDisabled = document.getElementsByClassName('rafterLoginButton')[0].getAttribute('disabled');
    console.log(buttonDisabled);
    expect(buttonDisabled).toBe('');
  }));

  it('Logs in a rafter user', testAsync(async function() {
    await rd.postUSV();
    //expect(window.localStorage.getItem('rafterToken')).not.toBe(null);
    //expect(window.localStorage.getItem('rafterUser')).not.toBe(null);
    window.localStorage.removeItem('rafterToken');
    window.localStorage.removeItem('rafterUser');
    await rd2.postUSV();
    //expect(window.localStorage.getItem('rafterToken')).toBe(null);
    //expect(window.localStorage.getItem('rafterUser')).toBe(null);
  }));
});
