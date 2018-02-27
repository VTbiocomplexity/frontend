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
    document.body.innerHTML = '<div class="homeDirContent"></div><div class="userServiceError"></div>';
    await rd.rafterVolumeService('ls');
  }));
  it('tries to retrieves the home directory, but gets an error', testAsync(async function() {
    document.body.innerHTML = '<div class="homeDirContent"></div><div class="userServiceError"></div>';
    rd.app.httpClient = new HttpMock('rafterError');
    await rd.rafterVolumeService('ls');
  }));
  it('tries to retrieves the home directory, but receives a message of error', testAsync(async function() {
    document.body.innerHTML = '<div class="homeDirContent"></div><div class="userServiceError"></div>';
    rd.app.httpClient = new HttpMock('rafterMessage');
    await rd.rafterVolumeService('create');
  }));
  it('retrieves the sub directory', testAsync(async function() {
    document.body.innerHTML = '<div class="homeDirContent"></div><div class="userServiceError"></div><div class="subDirContent"></div>';
    rd.makeTreeWithSub = function() {};
    rd.rafterFile = {path: '/myFolder'};
    //rd.rafterUserID = 'tester';
    await rd.rafterVolumeService('ls', rd.app, 'tester', rd.rafterFile, rd.makeTreeWithSub);
  }));
  it('creates a new file', testAsync(async function() {
    document.body.innerHTML = '<div class="homeDirContent"></div><div class="userServiceError"></div>';
    rd.app.httpClient = new HttpMock();
    await rd.rafterVolumeService('create');
  }));
  it('catches error on create a new file', testAsync(async function() {
    document.body.innerHTML = '<div class="homeDirContent"></div><div class="userServiceError"></div>';
    rd.app.httpClient = new HttpMock('rafterCreateError');
    await rd.rafterVolumeService('create');
    //expect(document.getElementsByClassName('userServiceError')[0].innerHTML).not.toBe('&nbsp;');
  }));
  it('sets the create to be a new folder', testAsync(async function() {
    rd.rafterFile = {};
    document.body.innerHTML = '<div class="homeDirContent"></div><div class="userServiceError"></div><input id="fileType1" type="radio"><input id="fileType2" type="radio" checked>';
    rd.rafterFile.createType = '';
    await rd.radioClicked();
    expect(rd.rafterFile.createType).toBe('folder');
  }));
  it('sets the create to be a new file', testAsync(async function() {
    rd.rafterFile = {};
    document.body.innerHTML = '<div class="homeDirContent"></div><div class="userServiceError"></div><input id="fileType1" type="radio" checked><input id="fileType2" type="radio">';
    rd.rafterFile.createType = '';
    await rd.radioClicked();
    expect(rd.rafterFile.createType).toBe('file');
  }));
  it('tries to init volume service but catches an error', testAsync(async function() {
    //document.body.innerHTML = '<div class="homeDirContent"></div>';
    rd.app.httpClient = new HttpMock('rafterError');
    await rd.initVol('yoyo');
  }));
  it('displays a tree menu without a folder', (done) => {
    rd.app.httpClient = new HttpMock();
    rd.showFileDetails = function() {};
    document.body.innerHTML = '<div id="divId"></div><div class="homeDirContent"></div><div id="treeView"></div>';
    const nameArr = [{name: 'filename', id: '123', type: 'unspecified', isContainer: false, children: []}];
    rd.displayTree(rd.tv, nameArr, 'treeView', rd.showFileDetails, rd.homeDirJson, rd.rafterFile, rd.rafterVolumeService, rd.app, rd.rafterUserID, rd.makeTreeWithSub, rd.displayTree);
    document.getElementsByClassName('tree-leaf-text')[0].click();
    expect(document.getElementsByClassName('tlfolder')[0]).toBe(undefined);
    done();
  });
  it('displays a tree menu with a folder', (done) => {
    rd.app.httpClient = new HttpMock();
    rd.showFileDetails = function() {};
    document.body.innerHTML = '<div id="divId"></div><div class="homeDirContent"></div><div id="treeView"></div>';
    const nameArr = [{name: 'filename', id: '123', type: 'folder', isContainer: true, children: []}];
    rd.displayTree(rd.tv, nameArr, 'treeView', rd.showFileDetails, rd.homeDirJson, rd.rafterFile, rd.rafterVolumeService, rd.app, rd.rafterUserID, rd.makeTreeWithSub, rd.displayTree);
    document.getElementsByClassName('tree-leaf-text')[0].click();
    expect(document.getElementsByClassName('tlfolder')[0]).not.toBe(undefined);
    done();
  });
  it('shows the file details from a tree menu click', (done) => {
    rd.app.httpClient = new HttpMock();
    //rd.showFileDetails = function() {};
    document.body.innerHTML = '<div id="divId"></div><div class="homeDirContent"></div><div id="treeView"></div>';
    const nameArr = [{name: 'filename', id: '123', type: 'unspecified', isContainer: false, children: []}];
    rd.showFileDetails('123', nameArr, null, null, null, null, null, null, null, null);
    //document.getElementsByClassName('tree-leaf-text')[0].click();
    expect(document.getElementsByClassName('homeDirContent')[0].innerHTML).not.toBe('');
    done();
  });
  it('shows the folder name from a tree menu click', (done) => {
    rd.app.httpClient = new HttpMock();
    rd.rafterVolumeService = function() {};
    document.body.innerHTML = '<div id="divId"><p class="folderName"></p></div><div class="homeDirContent"></div><div id="treeView"></div>';
    const nameArr = [{name: 'myFolder', id: '123', type: 'folder', isContainer: true, children: []}];
    rd.showFileDetails('123', nameArr, rd.rafterFile, rd.rafterVolumeService, null, null, null, null, null, null);
    //document.getElementsByClassName('tree-leaf-text')[0].click();
    expect(document.getElementsByClassName('folderName')[0].innerHTML).toBe('myFolder');
    done();
  });
  it('does not show the file details when the id is missing', (done) => {
    rd.app.httpClient = new HttpMock();
    rd.rafterVolumeService = function() {};
    document.body.innerHTML = '<div id="divId"><p class="folderName"></p></div><div class="homeDirContent"></div><div id="treeView"></div>';
    const nameArr = [{name: 'myFolder', id: '123', type: 'file', isContainer: false, children: []}];
    rd.showFileDetails('1234', nameArr, rd.rafterFile, rd.rafterVolumeService, null, null, null, null, null, null);
    //document.getElementsByClassName('tree-leaf-text')[0].click();
    expect(document.getElementsByClassName('homeDirContent')[0].innerHTML).toBe('');
    done();
  });
  it('makes a tree menu without a folder', testAsync(async function() {
    document.body.innerHTML = '<div id="divId"></div><div class="homeDirContent"></div><div id="treeView"></div>';
    await rd.makeTree([{name: 'unknown', id: '8675309', isContainer: false, children: []}, {name: 'yoyo', id: '123'}]);
  }));
  it('makes a tree menu with a folder open', testAsync(async function() {
    rd.displayTree = function() {};
    rd.tv = {expandAll: function() {}, data: [{name: 'myFolder', id: '456', type: 'folder', isContainer: false, children: []}, {name: 'myFolder2', id: '4562', type: 'folder', isContainer: false, children: []}]};
    document.body.innerHTML = '<div id="divId"></div><div class="homeDirContent"></div><div id="treeView"></div>';
    const data = [{name: 'myFile', id: '123', type: 'file', isContainer: false, children: []}];
    const hdj = [{name: 'myFolder', id: '456', type: 'folder', isContainer: true, children: []}];
    await rd.makeTreeWithSub(data, '456', hdj, rd.tv, rd.showFileDetails, rd.rafterFile, null, null, null, rd.makeTreeWithSub, rd.displayTree);
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
