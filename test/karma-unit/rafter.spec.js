import {Rafter} from '../../src/dashboard-child-routes/rafter';
import {App} from '../../src/app';
import {RafterUser} from '../../src/classes/RafterUser';
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

  it('downloads a file', testAsync(async function() {
    let httpmock = {fetch: function() {
      return Promise.resolve({
        blob: function() {
          return Promise.resolve({
            blobby: 'blob'
          });
        }
      });
    }
    };
    let app3 = new App(auth, httpmock);
    app3.router = new RouterStub();
    app3.activate();
    let rd3 = new Rafter(app3);
    rd3.app.appState = new AppStateStub();
    rd3.activate();
    document.body.innerHTML = '<div class="homeDirContent">{"state":"analyzing","type":"unspecified","isContainer":false,"readACL":[],"writeACL":[],"computeACL":[],"autometa":{},"usermeta":{},"id":"a185e810-af88-11e7-ab0c-717499928918","creation_date":"2017-10-12T20:05:01.841Z","name":"someName"}</div>';
    rd3.rafterUserID = 'Tester';
    localStorage.setItem('rafterToken', JSON.stringify({token: '123'}));
    await rd3.fileDownload();
    //expect(rd.uid).toBe('3456');
  }));

  it('Validates the file type to be uploaded', testAsync(async function() {
    document.body.innerHTML = '<div><input id="rafterFilePath" type="file" accept=""/><button style="display:none" id="uploadButton"></button></div>';
    window.rafterFilePath = {files: [new Blob()]};
    expect(rd.rafterFileValidate()).toBe(false);
    window.rafterFilePath = {files: []};
    expect(rd.rafterFileValidate()).toBe(false);
  }));

  it('appears to uploads a rafter file', testAsync(async function() {
    document.body.innerHTML = '<div><input id="rafterFilePath" type="file" accept=""/><button style="display:none" id="uploadButton"></button></div>';
    window.rafterFilePath = {files: [new Blob()]};
    window.rafterFilePath.files[0].name = 'howdy.txt';
    console.log('do I have a file reader?');
    rd.reader = FileReader;
    console.log(rd.reader);
    rd.reader.readAsText = function() {};
    rd.reader.dispatchEvent = function() {};
    rd.uploadRafterFile();
    let evt = {target: {result: 'howdy'}};
    rd.reader.onload(evt);
    rd.reader.onerror();
  }));

  it('cathes error on vs upload a rafter file', testAsync(async function() {
    document.body.innerHTML = '<div><input id="rafterFilePath" type="file" accept=""/><button style="display:none" id="uploadButton"></button></div>';
    window.rafterFilePath = {files: [new Blob()]};
    window.rafterFilePath.files[0].name = 'howdy.txt';
    //console.log('do I have a file reader?');
    rd2.reader = FileReader;
    //console.log(rd.reader);
    rd2.reader.readAsText = function() {};
    rd2.reader.dispatchEvent = function() {};
    rd2.uploadRafterFile();
    let evt = {target: {result: 'howdy'}};
    rd2.reader.onload(evt);
    //rd.reader.onerror();
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
    document.body.innerHTML += '<div class="userServiceError">error</div>';
    await rd.postUSV();
    expect(document.getElementsByClassName('userServiceError')).innerHTML = '';
    //expect(window.localStorage.getItem('rafterToken')).not.toBe(null);
    //expect(window.localStorage.getItem('rafterUser')).not.toBe(null);

    window.localStorage.removeItem('rafterToken');
    window.localStorage.removeItem('rafterUser');
    await rd2.postUSV();
    expect(document.getElementsByClassName('userServiceError')).innerHTML = '<br>Wrong userid or password';
    //expect(window.localStorage.getItem('rafterToken')).toBe(null);
    //expect(window.localStorage.getItem('rafterUser')).toBe(null);
  }));
  it('retrieves the home directory', testAsync(async function() {
    document.body.innerHTML = '<button class="rafterCheckHome"></button><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div class="userServiceError"></div>';
    await rd.rafterVolumeService('ls');
  }));
  it('tries to retrieves the home directory, but gets an error', testAsync(async function() {
    document.body.innerHTML = '<button class="rafterCheckHome"></button><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div class="userServiceError"></div>';
    rd.app.httpClient = new HttpMock('rafterError');
    await rd.rafterVolumeService('ls');
  }));
  it('tries to retrieves the home directory, but receives a message of error', testAsync(async function() {
    document.body.innerHTML = '<button class="rafterCheckHome"></button><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div class="userServiceError"></div>';
    rd.app.httpClient = new HttpMock('rafterMessage');
    await rd.rafterVolumeService('create');
  }));
  it('retrieves the sub directory', testAsync(async function() {
    rd.app.httpClient = new HttpMock();
    document.body.innerHTML = '<button class="rafterCheckHome"></button><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div class="userServiceError"></div><div class="subDirContent"></div>';
    rd.makeTreeWithSub = function() {};
    rd.rafterFile = {path: '/myFolder', name: ' spacey S'};
    rd.subDirJson = [];
    await rd.rafterVolumeService('ls', rd.app, 'tester', rd.rafterFile, rd.makeTreeWithSub, null, null, null, null, null, null, rd.subDirJson);
  }));
  it('creates a new file', testAsync(async function() {
    document.body.innerHTML = '<button class="rafterCheckHome"></button><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div class="userServiceError"></div>';
    rd.app.httpClient = new HttpMock();
    await rd.rafterVolumeService('create');
    rd.rafterFile = {name: 'yo', createType: 'folder', path: ''};
    await rd.rafterVolumeService('create');
  }));
  it('deletes a new file', testAsync(async function() {
    document.body.innerHTML = '<button class="rafterCheckHome"></button><div class="homeDirContent">{"id":"123"}</div><div class="showHideHD" style="display:none"></div><div class="userServiceError"></div>';
    rd.app.httpClient = new HttpMock();
    await rd.fileDelete();
    rd.app.httpClient = new HttpMock('failDelete');
    await rd.fileDelete();
    rd.app.httpClient = new HttpMock('rafterError');
    await rd.fileDelete();
    // rd.rafterFile = {name: 'yo', createType: 'folder', path: ''};
    // await rd.rafterVolumeService('create');
  }));
  it('does not accept a bogus command', testAsync(async function() {
    document.body.innerHTML = '<button class="rafterCheckHome"></button><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div class="userServiceError"></div>';
    rd.app.httpClient = new HttpMock();
    await rd.rafterVolumeService('bogas');
  }));
  it('catches error on create a new file', testAsync(async function() {
    document.body.innerHTML = '<button class="rafterCheckHome"></button><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div class="userServiceError"></div>';
    rd.app.httpClient = new HttpMock('rafterCreateError');
    await rd.rafterVolumeService('create');
    //expect(document.getElementsByClassName('userServiceError')[0].innerHTML).not.toBe('&nbsp;');
  }));
  it('sets the create to be a new folder', testAsync(async function() {
    rd.rafterFile = {};
    document.body.innerHTML = '<div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div class="userServiceError"></div><input id="fileType1" type="radio"><input id="fileType2" type="radio" checked>';
    rd.rafterFile.createType = '';
    await rd.radioClicked();
    expect(rd.rafterFile.createType).toBe('folder');
  }));
  it('sets the create to be a new file', testAsync(async function() {
    rd.rafterFile = {};
    document.body.innerHTML = '<div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div class="userServiceError"></div><input id="fileType1" type="radio" checked><input id="fileType2" type="radio">';
    rd.rafterFile.createType = '';
    await rd.radioClicked();
    expect(rd.rafterFile.createType).toBe('file');
  }));
  it('tries to init volume service but catches an error', testAsync(async function() {
    //document.body.innerHTML = '<div class="homeDirContent"></div>';
    rd.app.httpClient = new HttpMock('rafterError');
    rd.rafterUser = new RafterUser(rd.app.httpClient);
    await rd.rafterUser.initVol('yoyo');
  }));
  it('hides the details', testAsync(async function() {
    document.body.innerHTML = '<div class="content"></div><div class="ic1"></div><div class="ic2"></div>';
    await rd.hideDetail('ic1', 'ic2', 'content');
    expect(document.getElementsByClassName('ic2')[0].style.display).toBe('block');
  }));
  it('shows the details', testAsync(async function() {
    document.body.innerHTML = '<div class="content"></div><div class="ic1"></div><div class="ic2"></div>';
    await rd.showDetail('ic1', 'ic2', 'content');
    expect(document.getElementsByClassName('ic1')[0].style.display).toBe('block');
  }));
  it('displays a tree menu without a folder', (done) => {
    rd.app.httpClient = new HttpMock();
    rd.showFileDetails = function() {};
    document.body.innerHTML = '<div id="divId"></div><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div id="treeView"></div><div class="subDirContent"></div>';
    const nameArr = [{name: 'filename', id: '123', type: 'unspecified', isContainer: false, children: []}];
    rd.displayTree(rd.tv, nameArr, 'treeView', rd.showFileDetails, rd.homeDirJson, rd.rafterFile, rd.rafterVolumeService, rd.app, rd.rafterUserID, rd.makeTreeWithSub, rd.displayTree);
    document.getElementsByClassName('tree-leaf-text')[0].click();
    expect(document.getElementsByClassName('tlfolder')[0]).toBe(undefined);
    done();
  });
  it('displays a tree menu with a folder', (done) => {
    rd.app.httpClient = new HttpMock();
    rd.showFileDetails = function() {};
    document.body.innerHTML = '<div id="divId"></div><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div id="treeView"></div><div class="subDirContent"></div>';
    const nameArr = [{name: 'filename', id: '123', type: 'folder', isContainer: true, children: []}];
    rd.displayTree(rd.tv, nameArr, 'treeView', rd.showFileDetails, rd.homeDirJson, rd.rafterFile, rd.rafterVolumeService, rd.app, rd.rafterUserID, rd.makeTreeWithSub, rd.displayTree);
    document.getElementsByClassName('tree-leaf-text')[0].click();
    expect(document.getElementsByClassName('tlfolder')[0]).not.toBe(undefined);
    done();
  });
  it('displays a tree menu with a folder and files inside of folder', (done) => {
    rd.app.httpClient = new HttpMock();
    rd.showFileDetails = function() {};
    document.body.innerHTML = '<div id="divId"></div><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div id="treeView"></div><div class="subDirContent"></div>';
    const nameArr = [{name: 'folderName', id: '123', type: 'folder', isContainer: true, children: [{name: 'fileInside', id: '1234', type: 'file', isContainer: false, children: []}]}];
    document.getElementsByClassName('subDirContent')[0].innerHTML = '[{"state":"empty","type":"unspecified","isContainer":false,"readACL":[],"writeACL":[],"computeACL":[],"autometa":{},"usermeta":{},"id":"6f1ff340-18cc-11e8-95c2-717499928918","creation_date":"2018-02-23T19:04:55.156Z","name":"file2","owner_id":"JoshuaVSherman","container_id":"a320cc40-17e7-11e8-95c2-717499928918","update_date":"2018-02-23T19:04:55.156Z"},{"state":"empty","type":"unspecified","isContainer":false,"readACL":[],"writeACL":[],"computeACL":[],"autometa":{},"usermeta":{},"id":"fb05c9b0-18c3-11e8-95c2-717499928918","creation_date":"2018-02-23T18:04:24.396Z","name":"insideSubFolder1.txt","owner_id":"JoshuaVSherman","container_id":"a320cc40-17e7-11e8-95c2-717499928918","update_date":"2018-02-23T18:04:24.396Z"}]';
    rd.displayTree(rd.tv, nameArr, 'treeView', rd.showFileDetails, rd.homeDirJson, rd.rafterFile, rd.rafterVolumeService, rd.app, rd.rafterUserID, rd.makeTreeWithSub, rd.displayTree);
    console.log(document.getElementsByClassName('tree-leaf-text'));
    document.getElementsByClassName('tree-leaf-text')[1].click();
    //expect(document.getElementsByClassName('tlfolder')[0]).not.toBe(undefined);
    done();
  });
  it('shows the file details from a tree menu click', (done) => {
    rd.app.httpClient = new HttpMock();
    //rd.showFileDetails = function() {};
    document.body.innerHTML = '<button class="deleteButton"></button><button class="dnldButton"></button><div class="fileDetailsTitle"></div><div class="rafterLogout"></div><div class="fileDld"></div><button class="rafterCheckHome"></button><div class="createNew"></div><div id="divId"></div><p class="fileDetailsTitle"></p><div class="isHomeDir"></div><div class="isHomeDir"></div><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div id="treeView"></div><div class="insideFolderDetails"></div>';
    const nameArr = [{name: 'filename', id: '123', type: 'unspecified', isContainer: false, children: []}];
    rd.showFileDetails('123', nameArr, null, null, null, null, null, null, null, nameArr, null);
    //document.getElementsByClassName('tree-leaf-text')[0].click();
    expect(document.getElementsByClassName('homeDirContent')[0].innerHTML).not.toBe('');
    done();
  });
  it('shows the inside of folder details from a tree menu click', (done) => {
    rd.app.httpClient = new HttpMock();
    //rd.showFileDetails = function() {};
    document.body.innerHTML = '<button class="deleteButton"></button><button class="dnldButton"></button><div class="fileDetailsTitle"></div><div class="rafterLogout"></div><div class="fileDld"></div><button class="rafterCheckHome"></button><div class="createNew"></div><div class="isHomeDir"></div><div class="isHomeDir"></div><div id="divId"></div><p class="fileDetailsTitle"></p><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div id="treeView"></div><div class="insideFolderDetails"></div>';
    const nameArr = [{name: 'filename', id: '123', type: 'unspecified', isContainer: false, children: []}];
    rd.showFileDetails('123', nameArr, null, null, null, null, function() {}, null, null, null);
    //document.getElementsByClassName('tree-leaf-text')[0].click();
    expect(document.getElementsByClassName('homeDirContent')[0].innerHTML).not.toBe('');
    done();
  });
  it('shows the folder name from a tree menu click', (done) => {
    rd.app.httpClient = new HttpMock();
    rd.rafterVolumeService = function() {};
    document.body.innerHTML = '<div class="fileDetailsTitle"></div><div class="rafterLogout"></div><div class="fileDld"></div><div class="createNew"></div><div class="isHomeDir"></div><div class="isHomeDir"></div><div id="divId"><p class="folderName"></p></div><p class="fileDetailsTitle"></p><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div id="treeView"></div><div class="insideFolderDetails"></div>';
    const nameArr = [{name: 'myFolder', id: '123', type: 'folder', isContainer: true, children: []}];
    rd.showFileDetails('123', nameArr, rd.rafterFile, rd.rafterVolumeService, null, null, null, null, null, null);
    //document.getElementsByClassName('tree-leaf-text')[0].click();
    expect(document.getElementsByClassName('folderName')[0].innerHTML).toBe('myFolder');
    done();
  });
  it('displays the file details that are inside of the home directory', (done) => {
    rd.homeDirJson = {name: 'howdy'};
    document.body.innerHTML = '<button class="deleteButton"></button><button class="dnldButton"></button><div class="fileDetailsTitle"></div><div class="rafterLogout"></div><div class="fileDld"></div><div class="userServiceError"></div><button class="rafterCheckHome"></button><div class="createNew"></div><div class="isHomeDir"></div><div class="isHomeDir"></div><div id="divId"><p class="folderName"></p></div><p class="fileDetailsTitle"></p><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div id="treeView"></div><div class="insideFolderDetails"></div><div class="subDirContent"></div>';
    rd.navHomeDir();
    expect(document.getElementsByClassName('subDirContent')[0].innerHTML).toBe(JSON.stringify(rd.homeDirJson));
    done();
  });
  it('displays the file details of a file that is inside a sub folder', (done) => {
    rd.homeDirJson = {name: 'howdy'};
    rd.subDirJson = [{name: 'howdy', id: '123'}];
    document.body.innerHTML = '<button class="deleteButton"></button><button class="dnldButton"></button><div class="fileDetailsTitle"></div><div class="rafterLogout"></div><div class="fileDld"></div><div class="userServiceError"></div><button class="rafterCheckHome"></button><div class="createNew"></div><div class="isHomeDir"></div><div class="isHomeDir"></div><div id="divId"><p class="folderName"></p></div><p class="fileDetailsTitle"></p><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div id="treeView"></div><div class="insideFolderDetails"></div><div class="subDirContent"></div>';
    rd.showFileDetails('123', [], null, null, null, null, null, null, null, null, rd.subDirJson );
    expect(document.getElementsByClassName('homeDirContent')[0].innerHTML).toBe(JSON.stringify(rd.subDirJson[0]));
    document.getElementsByClassName('homeDirContent')[0].innerHTML = '';
    rd.showFileDetails('1234', [], null, null, null, null, null, null, null, null, rd.subDirJson );
    expect(document.getElementsByClassName('homeDirContent')[0].innerHTML).toBe('');
    done();
  });
  it('does not show the file details when the id is missing', (done) => {
    rd.app.httpClient = new HttpMock();
    rd.rafterVolumeService = function() {};
    document.body.innerHTML = '<div class="fileDetailsTitle"></div><div class="rafterLogout"></div><div class="fileDld"></div><div class="createNew"></div><div class="isHomeDir"></div><div class="isHomeDir"></div><div id="divId"><p class="folderName"><p class="fileDetailsTitle"></p></p></div><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div id="treeView"></div><div class="insideFolderDetails"></div>';
    const nameArr = [{name: 'myFolder', id: '123', type: 'file', isContainer: false, children: []}];
    rd.showFileDetails('1234', nameArr, rd.rafterFile, rd.rafterVolumeService, null, null, null, null, null, null);
    //document.getElementsByClassName('tree-leaf-text')[0].click();
    expect(document.getElementsByClassName('homeDirContent')[0].innerHTML).toBe('');
    done();
  });
  it('makes a tree menu without a folder', testAsync(async function() {
    rd.displayTree = function() {};
    document.body.innerHTML = '<div id="divId"></div><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div id="treeView"></div><div class="subDirContent"></div>';
    await rd.makeTree([{name: 'unknown', id: '8675309', isContainer: false, children: []}, {name: 'yoyo', id: '123'}]);
  }));
  it('makes a tree menu with a folder open', testAsync(async function() {
    rd.displayTree = function() {};
    rd.tv = {expandAll: function() {}, data: [{name: 'myFolder', id: '456', type: 'folder', isContainer: false, children: []}, {name: 'myFolder2', id: '4562', type: 'folder', isContainer: false, children: []}]};
    document.body.innerHTML = '<div id="divId"></div><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div id="treeView"></div><div class="subDirContent"></div>';
    const data = [{name: 'myFile', id: '123', type: 'file', isContainer: false, children: []}];
    const hdj = [{name: 'myFolder', id: '456', type: 'folder', isContainer: true, children: []}];
    await rd.makeTreeWithSub(data, '456', hdj, rd.tv, rd.showFileDetails, rd.rafterFile, null, null, null, rd.makeTreeWithSub, rd.displayTree, rd.subDirJson, rd.makeNewJson);
  }));
  it('detects an expired token', (done) => {
    let tkn = {exp: 123};
    rd.rafterUser = new RafterUser();
    let isValid = rd.rafterUser.checkExpired(tkn);
    expect(isValid).toBe(false);
    tkn = {exp: 999999999999};
    isValid = rd.rafterUser.checkExpired(tkn);
    expect(isValid).toBe(true);
    done();
  });
  it('checks if the user has logged in on initial page load and detects a valid token', (done) => {
    document.body.innerHTML = '<div class="rafterLogout" style="display:block"></div>';
    let tkn = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6W10sImZpcnN0X25hbWUiOiJuZHNzbCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv' +
    '-i9vRVuzPJEWxPHhXZTSzLXiwPlLB5P9VOlzgDPhmVuPwx2n0q-T9hbV6vGt1E0EL-oKex1dpVE10iM0BWujXvQRC8gPJXhIBNR6zUDXX5ziO_8Y48CNWvKBDKhTjcrGEuj7CEMSt9kZBlgt-E_DnkibnFfHl763k_vPWqJ4okWkhELXtpCj7ObKrjNGRjYzKrMRyjJkIHLOc6ZEsTKkWt4ATzOXN_jVYFqN5tzRpMqiqC-G0oS-aSOiML6HZpqiEu26oLoQ4a6RDAXPp6Me9SXwkhw7K-JNDvW68LRyXIMnz7HisLWhc6-1XykgQ6MLcu4uvsOBD11VQpVmO-5Dkdf2vAlr7jbQ8tvKZaJi4W2PEiVIfR6lNhGPLyU4Zx4bg084tzi6n3jSipKcavfPY' +
    '-iNAbZOYDXlB8GKdDIEFpRQmO11Yyr1_B9OjRYFWrf1scdlLhdXcRQT33FHQo_sakhZMI36s50ksj6B4ghrEHhdvgE1TFBgMg6uyRiNiZiRVgd08kMok_JmlJrjGkqoUIgvZeC9NkjGU8YcV5bF5ZTeJpTlJ7l28W8fY_lkjOs4LBsxoJDdnrdGR-FsfFMQJajL4LEuwXGlpBHjfiLpqflRYhf8poDRU';
    localStorage.setItem('rafterToken', tkn);
    rd.rafterUser = new RafterUser(rd.app.httpClient);
    rd.rafterUser.checkExpired = function() {return true;};
    const rlo = rd.rafterUser.rafterLogout;
    const cipr = rd.rafterUser.checkIfPageReload;
    rd.showLogin = rd.checkIfLoggedIn(rd.rafterUser.checkExpired, rlo, this.showLogin, cipr);
    expect(localStorage.getItem('rafterToken')).not.toBe(null);
    expect(rd.showLogin).toBe(false);
    done();
  });
  it('checks if the user has logged during a set interval and removes the token if is has expired', (done) => {
    document.body.innerHTML = '<div class="rafterLogout" style="display:block"></div>';
    let tkn = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6W10sImZpcnN0X25hbWUiOiJuZHNzbCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv' +
    '-i9vRVuzPJEWxPHhXZTSzLXiwPlLB5P9VOlzgDPhmVuPwx2n0q-T9hbV6vGt1E0EL-oKex1dpVE10iM0BWujXvQRC8gPJXhIBNR6zUDXX5ziO_8Y48CNWvKBDKhTjcrGEuj7CEMSt9kZBlgt-E_DnkibnFfHl763k_vPWqJ4okWkhELXtpCj7ObKrjNGRjYzKrMRyjJkIHLOc6ZEsTKkWt4ATzOXN_jVYFqN5tzRpMqiqC-G0oS-aSOiML6HZpqiEu26oLoQ4a6RDAXPp6Me9SXwkhw7K-JNDvW68LRyXIMnz7HisLWhc6-1XykgQ6MLcu4uvsOBD11VQpVmO-5Dkdf2vAlr7jbQ8tvKZaJi4W2PEiVIfR6lNhGPLyU4Zx4bg084tzi6n3jSipKcavfPY' +
    '-iNAbZOYDXlB8GKdDIEFpRQmO11Yyr1_B9OjRYFWrf1scdlLhdXcRQT33FHQo_sakhZMI36s50ksj6B4ghrEHhdvgE1TFBgMg6uyRiNiZiRVgd08kMok_JmlJrjGkqoUIgvZeC9NkjGU8YcV5bF5ZTeJpTlJ7l28W8fY_lkjOs4LBsxoJDdnrdGR-FsfFMQJajL4LEuwXGlpBHjfiLpqflRYhf8poDRU';
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
  it('checks if the user has logged during a set interval and detects a valid token', (done) => {
    document.body.innerHTML = '<div class="rafterLogout" style="display:block"></div>';
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
    document.body.innerHTML = '<div class="rafterLogout" style="display:block"></div>';
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
  it('reloads the page if localstorage was deleted', testAsync(async function() {
    document.body.innerHTML = '<div class="rafterLogout" style="display:block"></div>';
    rd.rafterUser = new RafterUser();
    let cep = function() {return false;};
    let rlo = function() {localStorage.removeItem('rafterToken');};
    let sli = true;
    await rd.checkIfLoggedIn(cep, rlo, sli, rd.rafterUser.checkIfPageReload);
    document.body.innerHTML = '<div class="rafterLogout" style="display:none"></div>';
    await rd.checkIfLoggedIn(cep, rlo, sli, rd.rafterUser.checkIfPageReload);
    document.body.innerHTML = '';
    await rd.checkIfLoggedIn(cep, rlo, sli, rd.rafterUser.checkIfPageReload);
    //expect(document.getElementsByClassName('rafterLogout')[0].style.display).toBe('none');
  }));

  it('continues to check for expired token when there is a user defined', (done) => {
    jasmine.clock().install();
    let ruserObj = {name: 'howdy'};
    localStorage.setItem('rafterUser', JSON.stringify(ruserObj));
    document.body.innerHTML = '<div class="rafterLogout" style="display:block"></div>';
    rd.rafterUser = {rafterLogout: function() {}, checkIfPageReload: function() {}};
    rd.attached();
    jasmine.clock().tick(5500);
    //setTimeout(() => {
    done();
    jasmine.clock().uninstall();
    // }, 5500);
  });
  it('continues to check for expired token when there is not a user defined', (done) => {
    document.body.innerHTML = '<div class="rafterLogout" style="display:block"></div>';
    localStorage.removeItem('rafterUser');
    rd.rafterUser = {rafterLogout: function() {}};
    rd.attached();
    //   setTimeout(() => {
    done();
    //   }, 5400);
    // }, 5400);
  });
});
