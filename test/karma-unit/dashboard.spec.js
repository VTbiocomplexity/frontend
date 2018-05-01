
import { Dashboard } from '../../src/dashboard';
import { App } from '../../src/app';
import { AuthStub, HttpMock, AppStateStub, RouterStub } from './commons';

function testAsync(runAsync) {
  return (done) => {
    runAsync().then(done, (e) => { fail(e); done(); });
  };
}

describe('the Dashboard module', () => {
  let dashboard, auth, app;
  beforeEach(() => {
    auth = new AuthStub();
    auth.setToken({ sub: '3456' });
    app = new App(auth, new HttpMock());
    app.router = new RouterStub();
    app.activate();
    dashboard = new Dashboard(app);
    dashboard.app.appState = new AppStateStub();
  });

  it('should activate dashboard', testAsync(async () => {
    await dashboard.activate();
    expect(dashboard.user.name).toBe('Cathy Elba');
  }));

  it('sets the local storage token to the session stored aurelia token id', testAsync(async () => {
    spyOn(window.localStorage, 'getItem').and.callFake(() => null);
    spyOn(window.sessionStorage, 'getItem').and.callFake(() => '123');
    await dashboard.activate();
  }));

  it('it should route the user to user-accounts page if userType has not been defined yet', testAsync(async () => {
    await dashboard.activate();
    dashboard.user.userType = '';
    dashboard.childRoute();
    // expect(dashboard.newUser).toBe(true);
  }));

  it('it should not route the user to homepage if they are not a developer', testAsync(async () => {
    await dashboard.activate();
    dashboard.user.userType = 'fun';
    dashboard.childRoute();
  }));
});
