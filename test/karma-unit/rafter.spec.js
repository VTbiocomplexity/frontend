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
  it('retrieves the home directory', testAsync(async function() {
    document.body.innerHTML = '<div class="homeDirContent"></div>';
    await rd.rafterVolumeService('ls');
  }));
  it('tries to retrieves the home directory, but gets an error', testAsync(async function() {
    document.body.innerHTML = '<div class="homeDirContent"></div>';
    rd.app.httpClient = new HttpMock('rafterError');
    await rd.rafterVolumeService('ls');
  }));
  it('tries to retrieves the home directory, but receives a message of error', testAsync(async function() {
    document.body.innerHTML = '<div class="homeDirContent"></div>';
    rd.app.httpClient = new HttpMock('rafterMessage');
    await rd.rafterVolumeService('create');
  }));
  it('tries to init volume service but catches an error', testAsync(async function() {
    //document.body.innerHTML = '<div class="homeDirContent"></div>';
    rd.app.httpClient = new HttpMock('rafterError');
    await rd.initVol('yoyo');
  }));
  it('detects an expired token', (done) => {
    let tkn = {exp: 123};
    let isValid = rd.checkExpired(tkn);
    expect(isValid).toBe(false);
    tkn = {exp: 999999999999};
    isValid = rd.checkExpired(tkn);
    expect(isValid).toBe(true);
    done();
  });
  it('checks if the user has logged in on initial page load and removes the token if is has expired', (done) => {
    let tkn = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6W10sImZpcnN0X25hbWUiOiJuZHNzbCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv' +
      '-i9vRVuzPJEWxPHhXZTSzLXiwPlLB5P9VOlzgDPhmVuPwx2n0q-T9hbV6vGt1E0EL-oKex1dpVE10iM0BWujXvQRC8gPJXhIBNR6zUDXX5ziO_8Y48CNWvKBDKhTjcrGEuj7CEMSt9kZBlgt-E_DnkibnFfHl763k_vPWqJ4okWkhELXtpCj7ObKrjNGRjYzKrMRyjJkIHLOc6ZEsTKkWt4ATzOXN_jVYFqN5tzRpMqiqC-G0oS-aSOiML6HZpqiEu26oLoQ4a6RDAXPp6Me9SXwkhw7K-JNDvW68LRyXIMnz7HisLWhc6-1XykgQ6MLcu4uvsOBD11VQpVmO-5Dkdf2vAlr7jbQ8tvKZaJi4W2PEiVIfR6lNhGPLyU4Zx4bg084tzi6n3jSipKcavfPY' +
      '-iNAbZOYDXlB8GKdDIEFpRQmO11Yyr1_B9OjRYFWrf1scdlLhdXcRQT33FHQo_sakhZMI36s50ksj6B4ghrEHhdvgE1TFBgMg6uyRiNiZiRVgd08kMok_JmlJrjGkqoUIgvZeC9NkjGU8YcV5bF5ZTeJpTlJ7l28W8fY_lkjOs4LBsxoJDdnrdGR-FsfFMQJajL4LEuwXGlpBHjfiLpqflRYhf8poDRU';
    localStorage.setItem('rafterToken', tkn);
    //expect(isValid).toBe(false);
    //tkn = {exp: 999999999999};
    rd.checkIfLoggedIn();
    expect(localStorage.getItem('rafterToken')).toBe(null);
    //expect(isValid).toBe(true);
    done();
  });
  it('checks if the user has logged in on initial page load and detects a valid token', (done) => {
    let tkn = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6W10sImZpcnN0X25hbWUiOiJuZHNzbCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv' +
      '-i9vRVuzPJEWxPHhXZTSzLXiwPlLB5P9VOlzgDPhmVuPwx2n0q-T9hbV6vGt1E0EL-oKex1dpVE10iM0BWujXvQRC8gPJXhIBNR6zUDXX5ziO_8Y48CNWvKBDKhTjcrGEuj7CEMSt9kZBlgt-E_DnkibnFfHl763k_vPWqJ4okWkhELXtpCj7ObKrjNGRjYzKrMRyjJkIHLOc6ZEsTKkWt4ATzOXN_jVYFqN5tzRpMqiqC-G0oS-aSOiML6HZpqiEu26oLoQ4a6RDAXPp6Me9SXwkhw7K-JNDvW68LRyXIMnz7HisLWhc6-1XykgQ6MLcu4uvsOBD11VQpVmO-5Dkdf2vAlr7jbQ8tvKZaJi4W2PEiVIfR6lNhGPLyU4Zx4bg084tzi6n3jSipKcavfPY' +
      '-iNAbZOYDXlB8GKdDIEFpRQmO11Yyr1_B9OjRYFWrf1scdlLhdXcRQT33FHQo_sakhZMI36s50ksj6B4ghrEHhdvgE1TFBgMg6uyRiNiZiRVgd08kMok_JmlJrjGkqoUIgvZeC9NkjGU8YcV5bF5ZTeJpTlJ7l28W8fY_lkjOs4LBsxoJDdnrdGR-FsfFMQJajL4LEuwXGlpBHjfiLpqflRYhf8poDRU';
    localStorage.setItem('rafterToken', tkn);
    //expect(isValid).toBe(false);
    //tkn = {exp: 999999999999};
    rd.checkExpired = function() {return true;};
    rd.checkIfLoggedIn();
    expect(localStorage.getItem('rafterToken')).not.toBe(null);
    //expect(isValid).toBe(true);
    done();
  });
  it('checks if the user has logged during a set interval and removes the token if is has expired', (done) => {
    let tkn = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6W10sImZpcnN0X25hbWUiOiJuZHNzbCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv' +
      '-i9vRVuzPJEWxPHhXZTSzLXiwPlLB5P9VOlzgDPhmVuPwx2n0q-T9hbV6vGt1E0EL-oKex1dpVE10iM0BWujXvQRC8gPJXhIBNR6zUDXX5ziO_8Y48CNWvKBDKhTjcrGEuj7CEMSt9kZBlgt-E_DnkibnFfHl763k_vPWqJ4okWkhELXtpCj7ObKrjNGRjYzKrMRyjJkIHLOc6ZEsTKkWt4ATzOXN_jVYFqN5tzRpMqiqC-G0oS-aSOiML6HZpqiEu26oLoQ4a6RDAXPp6Me9SXwkhw7K-JNDvW68LRyXIMnz7HisLWhc6-1XykgQ6MLcu4uvsOBD11VQpVmO-5Dkdf2vAlr7jbQ8tvKZaJi4W2PEiVIfR6lNhGPLyU4Zx4bg084tzi6n3jSipKcavfPY' +
      '-iNAbZOYDXlB8GKdDIEFpRQmO11Yyr1_B9OjRYFWrf1scdlLhdXcRQT33FHQo_sakhZMI36s50ksj6B4ghrEHhdvgE1TFBgMg6uyRiNiZiRVgd08kMok_JmlJrjGkqoUIgvZeC9NkjGU8YcV5bF5ZTeJpTlJ7l28W8fY_lkjOs4LBsxoJDdnrdGR-FsfFMQJajL4LEuwXGlpBHjfiLpqflRYhf8poDRU';
    localStorage.setItem('rafterToken', tkn);
    //expect(isValid).toBe(false);
    //tkn = {exp: 999999999999};
    let cep = function() {};
    let rlo = function() {localStorage.removeItem('rafterToken');};
    let sli = true;
    rd.checkIfLoggedIn(cep, rlo, sli);
    expect(localStorage.getItem('rafterToken')).toBe(null);
    //expect(sli).toBe(false);
    //expect(isValid).toBe(true);
    done();
  });
  it('checks if the user has logged during a set interval and detects a valid token', (done) => {
    let tkn = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6W10sImZpcnN0X25hbWUiOiJuZHNzbCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv' +
      '-i9vRVuzPJEWxPHhXZTSzLXiwPlLB5P9VOlzgDPhmVuPwx2n0q-T9hbV6vGt1E0EL-oKex1dpVE10iM0BWujXvQRC8gPJXhIBNR6zUDXX5ziO_8Y48CNWvKBDKhTjcrGEuj7CEMSt9kZBlgt-E_DnkibnFfHl763k_vPWqJ4okWkhELXtpCj7ObKrjNGRjYzKrMRyjJkIHLOc6ZEsTKkWt4ATzOXN_jVYFqN5tzRpMqiqC-G0oS-aSOiML6HZpqiEu26oLoQ4a6RDAXPp6Me9SXwkhw7K-JNDvW68LRyXIMnz7HisLWhc6-1XykgQ6MLcu4uvsOBD11VQpVmO-5Dkdf2vAlr7jbQ8tvKZaJi4W2PEiVIfR6lNhGPLyU4Zx4bg084tzi6n3jSipKcavfPY' +
      '-iNAbZOYDXlB8GKdDIEFpRQmO11Yyr1_B9OjRYFWrf1scdlLhdXcRQT33FHQo_sakhZMI36s50ksj6B4ghrEHhdvgE1TFBgMg6uyRiNiZiRVgd08kMok_JmlJrjGkqoUIgvZeC9NkjGU8YcV5bF5ZTeJpTlJ7l28W8fY_lkjOs4LBsxoJDdnrdGR-FsfFMQJajL4LEuwXGlpBHjfiLpqflRYhf8poDRU';
    localStorage.setItem('rafterToken', tkn);
    //expect(isValid).toBe(false);
    //tkn = {exp: 999999999999};
    let cep = function() {return true;};
    let rlo = function() {localStorage.removeItem('rafterToken');};
    let sli = true;
    rd.checkIfLoggedIn(cep, rlo, sli);
    expect(localStorage.getItem('rafterToken')).not.toBe(null);
    //expect(sli).toBe(false);
    //expect(isValid).toBe(true);
    done();
  });
  it('checks if the user has logged during a set interval and detects an invalid token', (done) => {
    let tkn = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv';
    localStorage.setItem('rafterToken', tkn);
    //expect(isValid).toBe(false);
    //tkn = {exp: 999999999999};
    let cep = function() {return false;};
    let rlo = function() {localStorage.removeItem('rafterToken');};
    let sli = true;
    rd.checkIfLoggedIn(cep, rlo, sli);
    expect(localStorage.getItem('rafterToken')).toBe(null);
    //expect(sli).toBe(false);
    //expect(isValid).toBe(true);
    done();
  });
  it('continues to check for expired token when there is a user defined', (done) => {
    jasmine.clock().install();
    let ruserObj = {name: 'howdy'};
    localStorage.setItem('rafterUser', JSON.stringify(ruserObj));
    rd.attached();
    jasmine.clock().tick(5500);
    //setTimeout(() => {
    done();
    jasmine.clock().uninstall();
  // }, 5500);
  });
  it('continues to check for expired token when there is not a user defined', (done) => {
    localStorage.removeItem('rafterUser');
    rd.attached();
  //   setTimeout(() => {
    done();
  //   }, 5400);
  // }, 5400);
  });
});
