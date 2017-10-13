import {App} from '../../src/app';
import {AuthStub, HttpMock} from './commons';
const Counter = require('assertions-counter');

// function testAsync(runAsync) {
//   return (done) => {
//     runAsync().then(done, (e) => { fail(e); done(); });
//   };
// }

describe('the App module', () => {
  let app1;
  //let app2;
  beforeEach(() => {
    app1 = new App(new AuthStub(), new HttpMock());
    app1.auth.setToken('No token');
    //app1.activate();
    //app1.appState = new AppStateStub();
    //app2 = new App(new AuthStub2(), new HttpMock());
    //app2.activate();
    //app2.appState = new AppStateStub();
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

  // it('gets the current route', testAsync(async function() {
  //   //console.log(app1);
  //   //await app1.activate();
  //   let configStub = {options: {pushState: true}, addPipelineStep(){}, map(){}, fallbackRoute(){}};
  //   //let routerStub = {};
  //   await app1.configureRouter(configStub, RouterStub);
  //   //console.log('current instruction ' + app1.router.currentInstruction);
  //   let route = await app1.currentRoute;
  //   expect(route).toBe(route);
  //   //expect(route).toBe('yoyo');
  // }));
});
