import {AppState} from '../../src/classes/AppState.js';
import {HttpMock} from './commons';

function testAsync(runAsync) {
  return (done) => {
    runAsync().then(done, (e) => { fail(e); done(); });
  };
}

describe('The AppState module unit tests', () => {
  let appState;
  //let roles = ['developer', 'Volunteer'];
  let user = {'userName': 'John Doe', '_id': 'foo'};
  let userDeveloper = {'userName': 'John Doe', '_id': 'foo', 'userType': 'Developer'};

  beforeEach(() => {
    appState = new AppState(new HttpMock);
  });

  it('should set and then get the corresponding value of the user', (done) => {
    appState.setUser(user);
    appState.getUser('foo').then((returnedUser) => {
      expect(returnedUser).toEqual(user);
      done();
    });
  });

  it('should set a developer user', testAsync(async function() {
    await appState.setUser(userDeveloper);
    await appState.checkUserRole();
    let devroles = await appState.getRoles();
    expect(appState.user._id).toBe('foo');
    expect(devroles.includes('developer')).toBe(true);
    //done();
  }));
  it('should fetch the user when the user is not defined', testAsync(async function() {
    appState.user = {};
    await appState.getUser('123');
    //await dashboard.activate();
    expect(appState.user.name).toBe('Iddris Elba');
  }));
});
