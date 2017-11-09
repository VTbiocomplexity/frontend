
import {Dashboard} from '../../src/dashboard';
import {App} from '../../src/app';
import {AuthStub, HttpMock, AppStateStub, RouterStub} from './commons';

function testAsync(runAsync) {
  return (done) => {
    runAsync().then(done, (e) => { fail(e); done(); });
  };
}

describe('the Dashboard module', () => {
  let dashboard;
  let auth;
  let app;
  beforeEach(() => {
    auth = new AuthStub();
    auth.setToken({sub: '3456'});
    app = new App(auth, new HttpMock());
    app.router = new RouterStub();
    app.activate();
    dashboard = new Dashboard(app);
    dashboard.app.appState = new AppStateStub();
  });

  it('should activate dashboard', testAsync(async function() {
    await dashboard.activate();
    expect(dashboard.user.name).toBe('Iddris Elba');
  }));

  it('should update the user', testAsync(async function() {
    let thisuser = {
      _id: '3333333', userType: 'Developer'
    };
    await dashboard.activate();
    await dashboard.updateUser(thisuser);
    expect(dashboard.user.userType).toBe('Developer');
  }));
  //it should not route the user away from the dashboard if userType has not been defined yet
  //it should route the user to the homepage if they are not a developer
});
