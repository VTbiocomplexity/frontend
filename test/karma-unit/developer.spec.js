import { Developer } from '../../src/dashboard-child-routes/developer';
import { App } from '../../src/app';
import { AuthStub, HttpMock, AppStateStub, RouterStub } from './commons';

function testAsync(runAsync) {
  return (done) => {
    runAsync().then(done, (e) => { fail(e); done(); });
  };
}
// let dv = new Developer();

describe('the Developer Module', () => {
  let dv;
  let auth;
  let app;
  beforeEach(() => {
    auth = new AuthStub();
    auth.setToken({ sub: '3456' });
    app = new App(auth, new HttpMock());
    app.router = new RouterStub();
    app.activate();
    dv = new Developer(app);
    dv.app.appState = new AppStateStub();
  });

  it('should activate', testAsync(async () => {
    await dv.activate();
    expect(dv.uid).toBe('3456');
  }));
});
