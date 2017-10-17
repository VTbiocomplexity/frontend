
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
    // let thisuser = {
    //   _id: '3456', userType: 'Developer'
    // };
    // dashboard.app.appState.setUser(thisuser);
    //dashboard.app.appState = new AppStateStub();
    await dashboard.activate();
    expect(dashboard.user.name).toBe('Iddris Elba');
  }));

  it('should update the user', testAsync(async function() {
    let thisuser = {
      _id: '3333333', userType: 'Student'
    };
    //dashboard.app.appState.setUser(thisuser);
    //dashboard.app.appState = new AppStateStub();
    await dashboard.activate();
    //console.log(dashboard.user);
    await dashboard.updateUser(thisuser);
    //console.log(dashboard.user);
    //   setTimeout(function() {
    //expect(http.status).toBe(200);
    //     done();
    //   }, 10);
  }));
});
