import { Rafter } from '../../src/dashboard-child-routes/rafter';
import { App } from '../../src/app';
import { RafterUser } from '../../src/classes/RafterUser';
import { RafterFileActions } from '../../src/classes/RafterFileActions';
import {
  AuthStub,
  HttpMock,
  AppStateStub,
  RouterStub
} from './commons';

function testAsync(runAsync) {
  return (done) => {
    runAsync().then(done, (e) => {
      fail(e);
      done();
    });
  };
}

describe('The Rafter Dashboard', () => {
  let app5, rd5, rd4, app4, app2, app, auth, rd, rd2;
  beforeEach(() => {
    auth = new AuthStub();
    auth.setToken({
      sub: '3456'
    });
    app = new App(auth, new HttpMock());
    app.router = new RouterStub();
    app.activate();
    rd = new Rafter(app);
    rd.app.appState = new AppStateStub();
    rd.activate();
    rd.rafterFileActions = new RafterFileActions(rd.app.httpClient);
    app2 = new App(auth, new HttpMock('rafterError'));
    app2.router = new RouterStub();
    app2.activate();
    rd2 = new Rafter(app2);
    rd2.app.appState = new AppStateStub();
    rd2.activate();
    rd2.rafterFileActions = new RafterFileActions(rd2.app.httpClient);
    app4 = new App(auth, new HttpMock('rafterInitError'));
    app4.router = new RouterStub();
    app4.activate();
    rd4 = new Rafter(app4);
    rd4.app.appState = new AppStateStub();
    rd4.activate();
    app5 = new App(auth, new HttpMock({
      name: 'billy',
      rafterApps: [{
        r_app_name: 'yo'
      }]
    }));
    app5.router = new RouterStub();
    app5.activate();
    rd5 = new Rafter(app5);
    rd5.app.appState = new AppStateStub();
    rd5.activate();
    document.body.innerHTML = '<div class="home-header-image"></div><div class="rafterCheckHome"></div>' +
      '<div class="rafterLogin aurelia-hide" show.bind="">' +
      '</div><input id="appName"></input><input id="appName2"></input><div class="rafterAddApp"></div><div class="appSelector">' +
      '</div><div class="appSelector"></div><div class="displayFileContent"></div>' +
      '<div class="homeDirContent">{"state":"analyzing","type":"unspecified","isContainer":false,' +
      '"readACL":[],"writeACL":[],"computeACL":[],"autometa":{},"usermeta":{},"id":"a185e810-af88-11e7-ab0c-717499928918",' +
      '"creation_date":"2017-10-12T20:05:01.841Z","name":"someName"}</div>' +
      '<button class="dnldButton"></button><button class="displayButton"></button><button class="deleteButton"></button>' +
      '<button class="dnldButton"></button><div class="fileDetailsTitle"></div><div class="rafterLogout"></div>' +
      '<div class="fileDld"></div><div class="userServiceError"></div><button class="rafterCheckHome"></button>' +
      '<div class="createNew"></div><div class="isHomeDir"></div><div class="isHomeDir"></div><div id="divId"><p class="folderName"></p></div>' +
      '<p class="fileDetailsTitle"><div class="fileActions"></div></p><div class="homeDirContent">' +
      '</div><div class="showHideHD" style="display:none"><div class="homeDirLink"></div>' +
      '</div><div id="treeView"></div><div class="insideFolderDetails"></div><div class="subDirContent">' +
      '</div><div class="rafterLogout" style="display:block">' +
      '</div><div class="showHideHD" style="display:block"></div>' +
      '<div class="fileTypeSelector"></div><button class="displayButton"></button><div class="displayFileContent">' +
      '</div><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div class="userServiceError">' +
      '</div><input id="fileType1" type="radio"><input id="fileType2" type="radio" checked><button class="rafterMakeFileButton"></button>';
  });

  it('should activate', testAsync(async () => {
    await rd.activate();
    expect(rd.uid).toBe('3456');
  }));

  it('does not auto init rafter when there is already a rafter token', testAsync(async () => {
    // let store;
    spyOn(window.sessionStorage, 'getItem').and.callFake(() => '123');
    // window.sessionStorage = mockstorage;
    //   getItem: function() {return '123';}
    // };
    spyOn(rd, 'handleRafterLogin').and.callThrough();
    await rd.activate();
    // console.log(sessionStorage.getItem('rafterToken'));
    expect(rd.handleRafterLogin).not.toHaveBeenCalled();
  }));

  it('automatically inits rafter if user has credentials and there is no token', testAsync(async () => {
    rd.user = {
      rafterApps: [{
        r_app_secret: 'wow',
        r_app_id: 'yo',
        r_app_name: 'cool'
      }]
    };
    rd.rafterUser = new RafterUser(rd.app.httpClient);
    await rd.handleRafterLogin('autoInitRafter');
    // expect(rd.uid).toBe('3456');
  }));

  it('changes the app', testAsync(async () => {
    rd.user = {
      rafterApps: [{
        r_app_secret: 'wow',
        r_app_id: 'yo',
        r_app_name: 'cool'
      }, {
        r_app_secret: 'how',
        r_app_id: 'numba2',
        r_app_name: 'baby'
      }]
    };
    rd.rafterUser = new RafterUser(rd.app.httpClient);
    rd.appNames = ['cool', 'numba2'];
    document.getElementById('appName').value = 'numba2';
    await rd.handleRafterLogin('changeApp');
    // expect(rd.uid).toBe('3456');
  }));

  it('removes the app', testAsync(async () => {
    rd.user = {
      rafterApps: [{
        r_app_secret: 'wow',
        r_app_id: 'yo',
        r_app_name: 'cool'
      }, {
        r_app_secret: 'how',
        r_app_id: 'numba2',
        r_app_name: 'baby'
      }]
    };
    rd.rafterUser = new RafterUser(rd.app.httpClient);
    rd.appNames = ['cool', 'numba2'];
    document.getElementById('appName2').value = 'numba2';
    await rd.removeApp();
    // expect(rd.user.rafterApps.length).toBe(1);
    // expect(rd.uid).toBe('3456');
  }));

  it('displays the login form to add an additional app', testAsync(async () => {
    rd.showLogin = false;
    await rd.rafterAddApp();
    expect(rd.showLogin).toBe(true);
  }));

  it('cancels request to add additional app', testAsync(async () => {
    // rd.showLogin = true;
    await rd.rafterFileActions.nevermind();
    // expect(handlers.locationReload).toHaveBeenCalled();
  }));

  it('builds a drop down to change app', testAsync(async () => {
    rd.user = {
      rafterApps: [{
        r_app_name: 'yo'
      }, {
        r_app_name: 'slow'
      }]
    };
    document.getElementsByClassName('appSelector')[0].style.display = 'none';
    /* eslint-disable */
    const tkn = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6W10sImZpcnN0X25hbWUiOiJuZHNzbCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv' +
      '-i9vRVuzPJEWxPHhXZTSzLXiwPlLB5P9VOlzgDPhmVuPwx2n0q-T9hbV6vGt1E0EL-oKex1dpVE10iM0BWujXvQRC8gPJXhIBNR6zUDXX5ziO_8Y48CNWvKBDKhTjcrGEuj7CEMSt9kZBlgt-E_DnkibnFfHl763k_vPWqJ4okWkhELXtpCj7ObKrjNGRjYzKrMRyjJkIHLOc6ZEsTKkWt4ATzOXN_jVYFqN5tzRpMqiqC-G0oS-aSOiML6HZpqiEu26oLoQ4a6RDAXPp6Me9SXwkhw7K-JNDvW68LRyXIMnz7HisLWhc6-1XykgQ6MLcu4uvsOBD11VQpVmO-5Dkdf2vAlr7jbQ8tvKZaJi4W2PEiVIfR6lNhGPLyU4Zx4bg084tzi6n3jSipKcavfPY' +
      '-iNAbZOYDXlB8GKdDIEFpRQmO11Yyr1_B9OjRYFWrf1scdlLhdXcRQT33FHQo_sakhZMI36s50ksj6B4ghrEHhdvgE1TFBgMg6uyRiNiZiRVgd08kMok_JmlJrjGkqoUIgvZeC9NkjGU8YcV5bF5ZTeJpTlJ7l28W8fY_lkjOs4LBsxoJDdnrdGR-FsfFMQJajL4LEuwXGlpBHjfiLpqflRYhf8poDRU';
    /* eslint-enable */
    sessionStorage.setItem('rafterToken', tkn);
    rd.rafterUser = new RafterUser(rd.app.httpClient);
    // rd.isVolInit = false;
    await rd.attached();
    expect(document.getElementsByClassName('appSelector')[0].style.display).toBe('block');
  }));

  it('does not builds a drop down to change app if there is only app', testAsync(async () => {
    rd5.user = {
      rafterApps: [{
        r_app_name: 'yo'
      }]
    };
    document.getElementsByClassName('appSelector')[0].style.display = 'none';
    /* eslint-disable */
    const tkn = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6W10sImZpcnN0X25hbWUiOiJuZHNzbCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv' +
      '-i9vRVuzPJEWxPHhXZTSzLXiwPlLB5P9VOlzgDPhmVuPwx2n0q-T9hbV6vGt1E0EL-oKex1dpVE10iM0BWujXvQRC8gPJXhIBNR6zUDXX5ziO_8Y48CNWvKBDKhTjcrGEuj7CEMSt9kZBlgt-E_DnkibnFfHl763k_vPWqJ4okWkhELXtpCj7ObKrjNGRjYzKrMRyjJkIHLOc6ZEsTKkWt4ATzOXN_jVYFqN5tzRpMqiqC-G0oS-aSOiML6HZpqiEu26oLoQ4a6RDAXPp6Me9SXwkhw7K-JNDvW68LRyXIMnz7HisLWhc6-1XykgQ6MLcu4uvsOBD11VQpVmO-5Dkdf2vAlr7jbQ8tvKZaJi4W2PEiVIfR6lNhGPLyU4Zx4bg084tzi6n3jSipKcavfPY' +
      '-iNAbZOYDXlB8GKdDIEFpRQmO11Yyr1_B9OjRYFWrf1scdlLhdXcRQT33FHQo_sakhZMI36s50ksj6B4ghrEHhdvgE1TFBgMg6uyRiNiZiRVgd08kMok_JmlJrjGkqoUIgvZeC9NkjGU8YcV5bF5ZTeJpTlJ7l28W8fY_lkjOs4LBsxoJDdnrdGR-FsfFMQJajL4LEuwXGlpBHjfiLpqflRYhf8poDRU';
    /* eslint-enable */
    sessionStorage.setItem('rafterToken', tkn);
    rd5.rafterUser = new RafterUser(rd.app.httpClient);
    console.log('this is the user');
    console.log(rd5.user);
    await rd5.attached();
    // expect(document.getElementsByClassName('appSelector')[0].style.display).toBe('none');
  }));

  it('does not inits vs if rafter token is in sessionStorage and it has already been initialized', testAsync(async () => {
    rd.user = {
      r_app_secret: 'wow',
      r_app_id: 'yo'
    };
    /* eslint-disable */
    const tkn = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6W10sImZpcnN0X25hbWUiOiJuZHNzbCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv' +
      '-i9vRVuzPJEWxPHhXZTSzLXiwPlLB5P9VOlzgDPhmVuPwx2n0q-T9hbV6vGt1E0EL-oKex1dpVE10iM0BWujXvQRC8gPJXhIBNR6zUDXX5ziO_8Y48CNWvKBDKhTjcrGEuj7CEMSt9kZBlgt-E_DnkibnFfHl763k_vPWqJ4okWkhELXtpCj7ObKrjNGRjYzKrMRyjJkIHLOc6ZEsTKkWt4ATzOXN_jVYFqN5tzRpMqiqC-G0oS-aSOiML6HZpqiEu26oLoQ4a6RDAXPp6Me9SXwkhw7K-JNDvW68LRyXIMnz7HisLWhc6-1XykgQ6MLcu4uvsOBD11VQpVmO-5Dkdf2vAlr7jbQ8tvKZaJi4W2PEiVIfR6lNhGPLyU4Zx4bg084tzi6n3jSipKcavfPY' +
      '-iNAbZOYDXlB8GKdDIEFpRQmO11Yyr1_B9OjRYFWrf1scdlLhdXcRQT33FHQo_sakhZMI36s50ksj6B4ghrEHhdvgE1TFBgMg6uyRiNiZiRVgd08kMok_JmlJrjGkqoUIgvZeC9NkjGU8YcV5bF5ZTeJpTlJ7l28W8fY_lkjOs4LBsxoJDdnrdGR-FsfFMQJajL4LEuwXGlpBHjfiLpqflRYhf8poDRU';
    /* eslint-enable */
    sessionStorage.setItem('rafterToken', tkn);
    rd.rafterUser = new RafterUser(rd.app.httpClient);
    rd.isVolInit = true;
    await rd.attached();
    // expect(rd.uid).toBe('3456');
  }));

  it('does not set the rafterUser when there is no token', testAsync(async () => {
    // rd.user = {r_app_secret: 'wow', r_app_id: 'yo'};
    sessionStorage.removeItem('rafterToken');
    rd.rafterUser = new RafterUser(rd.app.httpClient);
    rd.isVolInit = false;
    await rd.attached();
    // expect(rd.uid).toBe('3456');
  }));

  it('does not set the rafter user id when there is no token', testAsync(async () => {
    // rd.user = {r_app_secret: 'wow', r_app_id: 'yo'};
    // sessionStorage.removeItem('rafterToken');
    // rd.rafterUser = new RafterUser(rd.app.httpClient);
    sessionStorage.removeItem('rafterToken');
    rd.rafterUserID = '';
    await rd.setRafterUserId();
    expect(rd.rafterUserID).toBe('');
    // expect(rd.uid).toBe('3456');
  }));

  it('downloads a file', testAsync(async () => {
    const httpmock = {
      fetch() {
        return Promise.resolve({
          blob() {
            return Promise.resolve({
              blobby: 'blob'
            });
          }
        });
      }
    };
    const app3 = new App(auth, httpmock);
    app3.router = new RouterStub();
    app3.activate();
    const rd3 = new Rafter(app3);
    rd3.app.appState = new AppStateStub();
    rd3.activate();
    rd3.rafterFileActions = new RafterFileActions(rd3.app.httpClient);
    document.body.innerHTML += '<div class="homeDirContent">{"state":"analyzing","type":"unspecified","isContainer":' +
    'false,"readACL":[],"writeACL":[],"computeACL":[],"autometa":{},"usermeta":{},"id":"a185e810-af88-11e7-ab0c-717499928918",' +
    '"creation_date":"2017-10-12T20:05:01.841Z","name":"someName"}</div>';
    rd3.rafterUserID = 'Tester';
    sessionStorage.setItem('rafterToken', JSON.stringify({
      token: '123'
    }));
    await rd3.rafterFileActions.fileDownload();
    // expect(rd.uid).toBe('3456');
  }));

  it('displays the content of a file on the webpage', testAsync(async () => {
    const httpmock = {
      fetch() {
        const debug = {
          hello: 'world'
        };
        const blob = new Blob([JSON.stringify(debug, null, 2)], {
          type: 'application/json'
        });
        return Promise.resolve({
          blob() {
            return Promise.resolve(blob);
          }
        });
      }
    };
    const app3 = new App(auth, httpmock);
    app3.router = new RouterStub();
    app3.activate();
    const rd3 = new Rafter(app3);
    rd3.app.appState = new AppStateStub();
    rd3.activate();
    rd3.rafterFileActions = new RafterFileActions(rd3.app.httpClient);
    rd3.rafterUserID = 'Tester';
    sessionStorage.setItem('rafterToken', JSON.stringify({
      token: '123'
    }));
    // console.log('do I have a file reader?');
    rd3.rafterFileActions.reader = new FileReader();
    // console.log(rd3.reader);
    await rd3.rafterFileActions.fileDisplay();
    expect(document.getElementsByClassName('displayFileContent')[0].innerHTML.includes('<img')).toBe(false);
    rd3.rafterFileActions.reader = new FileReader();
    let fjson = { type: 'jpg' };
    fjson = JSON.stringify(fjson);
    document.getElementsByClassName('homeDirContent')[0].innerHTML = fjson;
    await rd3.rafterFileActions.fileDisplay();
    // console.log('what to expect?');
    // console.log(document.getElementsByClassName('displayFileContent')[0].innerHTML);
    // expect(document.getElementsByClassName('displayFileContent')[0].innerHTML.includes('<img')).toBe(true);
  }));

  it('catches error on attempt to display the content of a file on the webpage', testAsync(async () => {
    const httpmock = {
      fetch() {
        // let debug = {hello: 'world'};
        // let blob = new Blob([JSON.stringify(debug, null, 2)], {type: 'application/json'});
        return Promise.resolve({
          blob() {
            return Promise.resolve(new Error({
              message: 'you fail',
              status: 500
            }));
          }
        });
      }
    };
    const app3 = new App(auth, httpmock);
    app3.router = new RouterStub();
    app3.activate();
    const rd3 = new Rafter(app3);
    rd3.app.appState = new AppStateStub();
    rd3.activate();
    rd3.rafterFileActions = new RafterFileActions(rd3.app.httpClient);
    document.body.innerHTML += '<div class="displayFileContent"></div><div class="homeDirContent">' +
    '{"state":"analyzing","type":"unspecified","isContainer":false,"readACL":[],"writeACL":[],"computeACL":[],"autometa":{},' +
    '"usermeta":{},"id":"a185e810-af88-11e7-ab0c-717499928918","creation_date":"2017-10-12T20:05:01.841Z","name":"someName"}</div>';
    rd3.rafterUserID = 'Tester';
    sessionStorage.setItem('rafterToken', JSON.stringify({
      token: '123'
    }));
    // console.log('do I have a file reader?');
    rd3.rafterFileActions.reader = new FileReader();
    // console.log(rd3.reader);
    await rd3.rafterFileActions.fileDisplay();
    // expect(rd.uid).toBe('3456');
  }));
  it('sets the file type for jpg and png', testAsync(async () => {
    spyOn(rd.rafterFileActions.httpClient, 'fetch').and.callThrough();
    rd.rafterFileActions.ulrf(null, null, rd.rafterFileActions.httpClient, null, null, 'image/jpeg');
    expect(rd.rafterFileActions.httpClient.fetch).toHaveBeenCalled();
    rd.rafterFileActions.ulrf(null, null, null, null, null, 'image/png');
    expect(rd.rafterFileActions.httpClient.fetch).toHaveBeenCalled();
  }));
  it('Validates the file type to be uploaded', testAsync(async () => {
    document.body.innerHTML = '<div><input id="rafterFilePath" type="file" accept=""/><button style="display:none" id="uploadButton"></button></div>';
    window.rafterFilePath = {
      files: [new Blob()]
    };
    expect(rd.rafterFileActions.fileTypeValidate()).toBe(false);
    window.rafterFilePath = {
      files: []
    };
    expect(rd.rafterFileActions.fileTypeValidate()).toBe(false);
  }));

  it('appears to uploads a rafter file', testAsync(async () => {
    document.body.innerHTML += '<div><input id="rafterFilePath" type="file" accept=""/>' +
      '<button style="display:none" id="uploadButton"></button></div>';
    window.rafterFilePath = {
      files: [new Blob()]
    };
    window.rafterFilePath.files[0].name = 'howdy.txt';
    console.log('do I have a file reader?');
    rd.rafterFileActions.reader = new FileReader();
    console.log(rd.reader);
    rd.rafterFileActions.reader.readAsText = function () {};
    rd.rafterFileActions.reader.dispatchEvent = function () {};
    rd.rafterFileActions.uploadRafterFile(rd.rafterUserID, rd.rafterFile);
    const evt = {
      target: {
        result: 'howdy'
      }
    };
    rd.rafterFileActions.reader.onload(evt);
    const debug = {
      hello: 'world'
    };
    window.rafterFilePath = {
      files: [new Blob([JSON.stringify(debug, null, 2)], {
        type: 'text/plain'
      })]
    };
    window.rafterFilePath.files[0].name = 'yo';
    rd.rafterFileActions.uploadRafterFile(rd.rafterUserID, rd.rafterFile);
    rd.rafterFileActions.reader.onload(evt);
    window.rafterFilePath = {
      files: [new Blob([JSON.stringify(debug, null, 2)], {
        type: 'application/json'
      })]
    };
    window.rafterFilePath.files[0].name = 'yo';
    rd.rafterFileActions.uploadRafterFile(rd.rafterUserID, rd.rafterFile);
    rd.rafterFileActions.reader.onload(evt);
    window.rafterFilePath = {
      files: [new Blob([JSON.stringify(debug, null, 2)], {
        type: 'text/xml'
      })]
    };
    window.rafterFilePath.files[0].name = 'yo';
    rd.rafterFileActions.uploadRafterFile(rd.rafterUserID, rd.rafterFile);
    rd.rafterFileActions.reader.onload(evt);
    spyOn(rd.rafterFileActions.reader, 'readAsDataURL').and.callThrough();
    window.rafterFilePath = {
      files: [new Blob([JSON.stringify(debug, null, 2)], {
        type: 'image/jpeg'
      })]
    };
    window.rafterFilePath.files[0].name = 'yo';
    rd.rafterFileActions.uploadRafterFile(rd.rafterUserID, rd.rafterFile);
    expect(rd.rafterFileActions.reader.readAsDataURL).toHaveBeenCalled();
    // rd.rafterFileActions.reader.onload(evt);
    rd.rafterFileActions.reader.onerror();
  }));

  it('cathes error on vs upload a rafter file', testAsync(async () => {
    document.body.innerHTML += '<div><input id="rafterFilePath" type="file" accept=""/>' +
    '<button style="display:none" id="uploadButton"></button></div>';
    const debug = {
      hello: 'world'
    };
    window.rafterFilePath = {
      files: [new Blob([JSON.stringify(debug, null, 2)], {
        type: 'text/xml'
      })]
    };
    window.rafterFilePath.files[0].name = 'howdy.txt';
    // console.log('do I have a file reader?');
    rd2.rafterFileActions.reader = new FileReader();
    // console.log(rd.reader);
    rd2.rafterFileActions.reader.readAsText = function () {};
    rd2.rafterFileActions.reader.dispatchEvent = function () {};
    rd2.rafterFileActions.uploadRafterFile(rd.rafterUserID, rd.rafterFile);
    const evt = {
      target: {
        result: 'howdy'
      }
    };
    rd2.rafterFileActions.reader.onload(evt);
    // rd.reader.onerror();
  }));

  it('Validates the login form', testAsync(async () => {
    document.body.innerHTML = '<div><button disabled class="rafterLoginButton"></button></div>';
    rd.rafter = {
      id: 'yo',
      password: 'yo'
    };
    await rd.rafterFileActions.validateLogin(rd.rafter);
    let buttonDisabled = document.getElementsByClassName('rafterLoginButton')[0].getAttribute('disabled');
    console.log(buttonDisabled);
    expect(buttonDisabled).toBe(null);
    rd.rafter = {
      id: '',
      password: 'yo'
    };
    await rd.rafterFileActions.validateLogin(rd.rafter);
    buttonDisabled = document.getElementsByClassName('rafterLoginButton')[0].getAttribute('disabled');
    console.log(buttonDisabled);
    expect(buttonDisabled).toBe('');
  }));

  it('Logs in a rafter user', testAsync(async () => {
    document.body.innerHTML += '<div class="userServiceError">error</div>';
    rd.rafterUser = new RafterUser(rd.app.httpClient);
    await rd.rafterUser.initRafter(rd.rafterUserID, rd.rafter);
    // expect(document.getElementsByClassName('userServiceError')[0].innerHTML).toBe('');
    window.sessionStorage.removeItem('rafterToken');
    await rd2.rafterUser.initRafter(rd2.rafterUserID, rd2.rafter);
    expect(document.getElementsByClassName('userServiceError')[0].innerHTML).toBe('Wrong app id or app secret');
    document.body.innerHTML = '';
    await rd.rafterUser.initRafter(rd.rafterUserID, rd.rafter);
    await rd2.rafterUser.initRafter(rd2.rafterUserID, rd2.rafter);
  }));

  it('receives an error message from rafter init', testAsync(async () => {
    document.body.innerHTML += '<div class="userServiceError">error</div>';
    rd4.rafterUser = new RafterUser(rd4.app.httpClient);
    await rd4.rafterUser.initRafter(rd4.rafterUserID, rd4.rafter);
    expect(document.getElementsByClassName('userServiceError')[0].innerHTML).toBe('Wrong app id or app secret');
    document.body.innerHTML = '';
    await rd4.rafterUser.initRafter(rd4.rafterUserID, rd4.rafter);
  }));

  it('disables/enables the create button when file name is blank/not blank', testAsync(async () => {
    document.body.innerHTML += '<button class="rafterMakeFileButton"></button><div class="userServiceError">error</div>';
    rd.rafterFile.name = '';
    await rd.rafterFileActions.valFileName(rd.rafterFile);
    expect(document.getElementsByClassName('rafterMakeFileButton')[0].disabled).toBe(true);
    rd.rafterFile.name = 'howdy';
    await rd.rafterFileActions.valFileName(rd.rafterFile);
    expect(document.getElementsByClassName('rafterMakeFileButton')[0].getAttribute('disabled')).toBe(null);
  }));

  it('requests the contents of a subfolder but not a sub sub folder', testAsync(async () => {
    spyOn(rd, 'vsFetch').and.callThrough();
    rd.rafterFile.rfid = '';
    await rd.rafterVolumeService('ls', null, null, rd.rafterFile, null, null, null, null, null, null, null, null, null, null, rd.vsFetch);
    expect(rd.vsFetch).toHaveBeenCalled();
  }));

  it('hangles a login to rafter button click', testAsync(async () => {
    document.body.innerHTML = '<div class="userServiceError">error</div><button class="rafterCheckHome">' +
    '</button><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div class="userServiceError"></div>';
    rd.rafterUser = new RafterUser(rd.app.httpClient);
    rd.user = {
      _id: 'yo'
    };
    await rd.handleRafterLogin();
  }));
  it('deletes a file', testAsync(async () => {
    document.body.innerHTML = '<button class="rafterCheckHome"></button><div class="homeDirContent">{"id":"123"}</div>' +
    '<div class="showHideHD" style="display:none"></div><div class="userServiceError"></div>';
    rd.app.httpClient = new HttpMock();
    rd.rafterFileActions = new RafterFileActions(rd.app.httpClient);
    await rd.rafterFileActions.fileDelete();
    rd.app.httpClient = new HttpMock('failDelete');
    rd.rafterFileActions = new RafterFileActions(rd.app.httpClient);
    await rd.rafterFileActions.fileDelete();
    rd.app.httpClient = new HttpMock('rafterError');
    rd.rafterFileActions = new RafterFileActions(rd.app.httpClient);
    await rd.rafterFileActions.fileDelete();
  }));
  it('sets the create to be a new folder', testAsync(async () => {
    rd.rafterFile = {};
    rd.rafterFile.createType = '';
    await rd.radioClicked();
    expect(rd.rafterFile.createType).toBe('folder');
  }));
  it('sets the create to be a new file', testAsync(async () => {
    rd.rafterFile = {};
    document.body.innerHTML = '<div class="fileTypeSelector"></div><button class="displayButton"></button>' +
    '<div class="displayFileContent"></div><div class="homeDirContent"></div><div class="showHideHD" style="display:none">' +
    '</div><div class="userServiceError"></div><input id="fileType1" type="radio" checked><input id="fileType2" type="radio">';
    rd.rafterFile.createType = '';
    await rd.radioClicked();
    expect(rd.rafterFile.createType).toBe('file');
  }));
  it('tries to init volume service but catches an error', testAsync(async () => {
    rd.app.httpClient = new HttpMock('rafterError');
    rd.rafterUser = new RafterUser(rd.app.httpClient);
    await rd.rafterUser.initVol('yoyo');
  }));
  it('hides the details (file or folder metadata)', testAsync(async () => {
    document.body.innerHTML = '<div class="content"></div><div class="ic1"></div><div class="ic2"></div>';
    await rd.rafterFileActions.hideDetail('ic1', 'ic2', 'content');
    expect(document.getElementsByClassName('ic2')[0].style.display).toBe('block');
  }));
  it('shows the details (file or folder metadata)', testAsync(async () => {
    document.body.innerHTML = '<div class="content"></div><div class="ic1"></div><div class="ic2"></div>';
    await rd.rafterFileActions.showDetail('ic1', 'ic2', 'content');
    expect(document.getElementsByClassName('ic1')[0].style.display).toBe('block');
  }));
  it('displays a tree menu without a folder', (done) => {
    rd.app.httpClient = new HttpMock();
    rd.showFileDetails = function () {};
    document.body.innerHTML = '<div id="divId"></div><div class="homeDirContent"></div><div class="showHideHD" style="display:none">' +
    '</div><div id="treeView"></div><div class="subDirContent"></div>';
    const nameArr = [{
      name: 'filename',
      id: '123',
      type: 'unspecified',
      isContainer: false,
      children: []
    }];
    rd.displayTree(
      rd.tv, nameArr, 'treeView', rd.showFileDetails, rd.homeDirJson, rd.rafterFile, rd.rafterVolumeService,
      rd.app, rd.rafterUserID, rd.makeTreeWithSub, rd.displayTree, null, null, () => {}, () => {}, () => {}, null, null
    );
    document.getElementsByClassName('tree-leaf-text')[0].click();
    expect(document.getElementsByClassName('tlfolder')[0]).toBe(undefined);
    done();
  });
  it('displays a tree menu with a folder', (done) => {
    rd.app.httpClient = new HttpMock();
    rd.showFileDetails = function () {};
    document.body.innerHTML = '<div id="divId"></div><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div>' +
    '<div id="treeView"></div><div class="subDirContent"></div>';
    const nameArr = [{
      name: 'filename',
      id: '123',
      type: 'folder',
      isContainer: true,
      children: []
    }];
    rd.displayTree(
      rd.tv, nameArr, 'treeView', rd.showFileDetails, rd.homeDirJson, rd.rafterFile, rd.rafterVolumeService,
      rd.app, rd.rafterUserID, rd.makeTreeWithSub, rd.displayTree, null, null, () => {}, () => {}, () => {}, null, null
    );
    document.getElementsByClassName('tree-leaf-text')[0].click();
    expect(document.getElementsByClassName('tlfolder')[0]).not.toBe(undefined);
    done();
  });
  it('displays a tree menu with a folder and files inside of folder', (done) => {
    rd.app.httpClient = new HttpMock();
    rd.showFileDetails = function () {};
    rd.makeFilesClickable = function () {};
    document.body.innerHTML = '<div id="divId"></div><div class="homeDirContent"></div><div class="showHideHD" style="display:none">' +
    '</div><div id="treeView"></div><div class="subDirContent"></div>';
    const nameArr = [{
      name: 'folderName',
      id: '123',
      type: 'folder',
      isContainer: true,
      children: [{
        name: 'fileInside',
        id: '1234',
        type: 'file',
        isContainer: false,
        children: []
      }]
    }];
    /* eslint-disable */
    document.getElementsByClassName('subDirContent')[0].innerHTML = '[{"state":"empty","type":"unspecified","isContainer":false,"readACL":[],"writeACL":[],"computeACL":[],"autometa":{},"usermeta":{},"id":"6f1ff340-18cc-11e8-95c2-717499928918","creation_date":"2018-02-23T19:04:55.156Z","name":"file2","owner_id":"JoshuaVSherman","container_id":"a320cc40-17e7-11e8-95c2-717499928918","update_date":"2018-02-23T19:04:55.156Z"},{"state":"empty","type":"unspecified","isContainer":false,"readACL":[],"writeACL":[],"computeACL":[],"autometa":{},"usermeta":{},"id":"fb05c9b0-18c3-11e8-95c2-717499928918","creation_date":"2018-02-23T18:04:24.396Z","name":"insideSubFolder1.txt","owner_id":"JoshuaVSherman","container_id":"a320cc40-17e7-11e8-95c2-717499928918","update_date":"2018-02-23T18:04:24.396Z"}]';
        /* eslint-enable */
    rd.displayTree(
      rd.tv, nameArr, 'treeView', rd.showFileDetails, rd.homeDirJson, rd.rafterFile, rd.rafterVolumeService,
      rd.app, rd.rafterUserID, rd.makeTreeWithSub, rd.displayTree, null, null, rd.makeFilesClickable
    );
    console.log(document.getElementsByClassName('tree-leaf-text'));
    document.getElementsByClassName('tree-leaf-text')[1].click();
    // expect(document.getElementsByClassName('tlfolder')[0]).not.toBe(undefined);
    done();
  });
  it('makes clickable files inside subfolder of a tree menu', (done) => {
    const myObj = {
      hi: 'howdy',
      low: 'loud',
      id: '123'
    };
    const filesInFolder = {
      getElementsByClassName() {
        return [{
          addEventListener(type, func) {
            func();
          },
          getElementsByClassName() {
            return [{
              getAttribute() {
                return JSON.stringify(myObj);
              }
            }];
          }
        }, {
          addEventListener(type, func) {
            func();
          },
          getElementsByClassName() {
            return [{
              getAttribute() {
                return JSON.stringify(myObj);
              }
            }];
          }
        }];
      }
    };
    rd.app.httpClient = new HttpMock();
    rd.showFileDetails = function () {};
    spyOn(rd, 'showFileDetails').and.callThrough();
    document.body.innerHTML = '<div class="fileActions"></div><div id="divId"></div><div class="homeDirContent"></div>' +
    '<div class="showHideHD" style="display:none"></div><div id="treeView"></div><div class="subDirContent"></div>';
    /* eslint-disable */
    document.getElementsByClassName('subDirContent')[0].innerHTML = '[{"state":"empty","type":"unspecified","isContainer":false,"readACL":[],"writeACL":[],"computeACL":[],"autometa":{},"usermeta":{},"id":"6f1ff340-18cc-11e8-95c2-717499928918","creation_date":"2018-02-23T19:04:55.156Z","name":"file2","owner_id":"JoshuaVSherman","container_id":"a320cc40-17e7-11e8-95c2-717499928918","update_date":"2018-02-23T19:04:55.156Z"},{"state":"empty","type":"unspecified","isContainer":false,"readACL":[],"writeACL":[],"computeACL":[],"autometa":{},"usermeta":{},"id":"fb05c9b0-18c3-11e8-95c2-717499928918","creation_date":"2018-02-23T18:04:24.396Z","name":"insideSubFolder1.txt","owner_id":"JoshuaVSherman","container_id":"a320cc40-17e7-11e8-95c2-717499928918","update_date":"2018-02-23T18:04:24.396Z"}]';
        /* eslint-enable */
    rd.makeFilesClickable(
      filesInFolder, rd.showFileDetails, null, null, null, null, null, null, null, null,
      null, null, null, null, rd.rafterFileActions
    );
    expect(rd.showFileDetails).toHaveBeenCalled();
    done();
  });
  it('detects a sub sub folder click event', testAsync(async () => {
    const myObj = {
      hi: 'howdy',
      low: 'loud',
      id: '123',
      isContainer: true
    };
    const filesInFolder = {
      getElementsByClassName() {
        return [{
          addEventListener(type, func) {
            func();
          },
          getElementsByClassName() {
            return [{
              getAttribute() {
                return JSON.stringify(myObj);
              }
            }];
          }
        }, {
          addEventListener(type, func) {
            func();
          },
          getElementsByClassName() {
            return [{
              getAttribute() {
                return JSON.stringify(myObj);
              }
            }];
          }
        }];
      }
    };
    rd.app.httpClient = new HttpMock();
    let subSubDirFiles = [{
      id: '123'
    }];
    document.body.innerHTML += '<div class="displayFileContent"></div><div class="createNew"></div><div class="folderName">' +
    '</div><div class="fileActions"></div><div id="divId"></div><div class="homeDirContent"></div>' +
    '<div class="showHideHD" style="display:none"></div><div id="treeView"></div><div class="subDirContent"></div>';
    /* eslint-disable */
    document.getElementsByClassName('subDirContent')[0].innerHTML = '[{"state":"empty","type":"unspecified","isContainer":false,"readACL":[],"writeACL":[],"computeACL":[],"autometa":{},"usermeta":{},"id":"6f1ff340-18cc-11e8-95c2-717499928918","creation_date":"2018-02-23T19:04:55.156Z","name":"file2","owner_id":"JoshuaVSherman","container_id":"a320cc40-17e7-11e8-95c2-717499928918","update_date":"2018-02-23T19:04:55.156Z"},{"state":"empty","type":"unspecified","isContainer":false,"readACL":[],"writeACL":[],"computeACL":[],"autometa":{},"usermeta":{},"id":"fb05c9b0-18c3-11e8-95c2-717499928918","creation_date":"2018-02-23T18:04:24.396Z","name":"insideSubFolder1.txt","owner_id":"JoshuaVSherman","container_id":"a320cc40-17e7-11e8-95c2-717499928918","update_date":"2018-02-23T18:04:24.396Z"}]';
        /* eslint-enable */
    await rd.makeFilesClickable(
      filesInFolder, rd.showFileDetails, rd.rafterFile, rd.rafterVolumeService, rd.app,
      null, [], null, null, null, null, null, () => {}, () => {}, rd.rafterFileActions, subSubDirFiles, null
    );
    expect(document.getElementsByClassName('deleteButton')[0].style.display).toBe('none');
    subSubDirFiles = [{
      id: '456'
    }];
    await rd.makeFilesClickable(filesInFolder, rd.showFileDetails, {
      rfid: '123'
    }, rd.rafterVolumeService, rd.app, null, [{
      id: '123'
    }], null, null, null, null, null, () => {}, () => {}, rd.rafterFileActions, subSubDirFiles, null);
    expect(document.getElementsByClassName('homeDirContent')[0].innerHTML).toBe(JSON.stringify({
      id: '123'
    }));
  }));
  it('displays the metadata of an empty file after a tree menu click', (done) => {
    rd.app.httpClient = new HttpMock();
    document.body.innerHTML = '<div class="fileActions"></div><button class="displayButton"></button>' +
    '<div class="displayFileContent"></div><button class="deleteButton"></button><button class="dnldButton">' +
    '</button><div class="fileDetailsTitle"></div><div class="rafterLogout"></div><div class="fileDld"></div>' +
    '<button class="rafterCheckHome"></button><div class="createNew"></div><div id="divId"></div><p class="fileDetailsTitle">' +
    '</p><div class="isHomeDir"></div><div class="isHomeDir"></div><div class="homeDirContent"></div>' +
    '<div class="showHideHD" style="display:none"></div><div id="treeView"></div><div class="insideFolderDetails"></div>';
    const nameArr = [{
      state: 'empty',
      name: 'filename',
      id: '123',
      type: 'unspecified',
      isContainer: false,
      children: []
    }];
    spyOn(rd, 'rafterFileActions').and.callThrough();
    rd.showFileDetails(
      '123', nameArr, null, null, null, null, null, null, null, nameArr,
      null, null, null, null, null, rd.rafterFileActions, null, null
    );
    expect(rd.rafterFileActions).not.toHaveBeenCalled();
    rd.showFileDetails(
      '123', nameArr, null, null, null, null, null, null, null, nameArr, null, null,
      null, null, null, rd.rafterFileActions, null, nameArr
    );
    expect(document.getElementsByClassName('homeDirContent')[0].innerHTML).not.toBe('');
    expect(document.getElementsByClassName('displayButton')[0].style.display).toBe('none');
    done();
  });
  it('shows the inside of folder details from a tree menu click', (done) => {
    rd.app.httpClient = new HttpMock();
    document.body.innerHTML = '<div class="fileActions"></div><button class="displayButton"></button>' +
    '<div class="displayFileContent"></div><button class="deleteButton"></button><button class="dnldButton">' +
    '</button><div class="fileDetailsTitle"></div><div class="rafterLogout"></div><div class="fileDld"></div>' +
    '<button class="rafterCheckHome"></button><div class="createNew"></div><div class="isHomeDir"></div>' +
    '<div class="isHomeDir"></div><div id="divId"></div><p class="fileDetailsTitle"></p><div class="homeDirContent">' +
    '</div><div class="showHideHD" style="display:none"></div><div id="treeView"></div><div class="insideFolderDetails"></div>';
    const nameArr = [{
      name: 'filename',
      id: '123',
      type: 'unspecified',
      isContainer: false,
      children: []
    }];
    rd.showFileDetails(
      '123', nameArr, null, null, null, null, () => {}, null, null, null,
      null, null, null, null, null, rd.rafterFileActions, null, nameArr
    );
    expect(document.getElementsByClassName('homeDirContent')[0].innerHTML).not.toBe('');
    done();
  });
  it('shows the folder name from a tree menu click', (done) => {
    rd.app.httpClient = new HttpMock();
    rd.rafterVolumeService = function () {};
    document.body.innerHTML = '<div class="fileActions"></div><button class="dnldButton"></button><button class="deleteButton">' +
    '</button><button class="displayButton"></button><div class="displayFileContent"></div><div class="fileDetailsTitle">' +
    '</div><div class="rafterLogout"></div><div class="fileDld"></div><div class="createNew"></div><div class="isHomeDir">' +
    '</div><div class="isHomeDir"></div><div id="divId"><p class="folderName"></p></div><p class="fileDetailsTitle"></p>' +
    '<div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div id="treeView">' +
    '</div><div class="insideFolderDetails"></div>';
    const nameArr = [{
      name: 'myFolder',
      id: '123',
      type: 'folder',
      isContainer: true,
      children: []
    }];
    rd.showFileDetails(
      '123', nameArr, rd.rafterFile, rd.rafterVolumeService, null, null, null, null, null,
      null, null, null, null, null, null, rd.rafterFileActions, null, nameArr
    );
    expect(document.getElementsByClassName('folderName')[0].innerHTML).toBe('myFolder');
    done();
  });
  it('shows file details for a sub sub folder', testAsync(async () => {
    rd.app.httpClient = new HttpMock();
    rd.rafterVolumeService = function () {};
    document.body.innerHTML += '<div class="fileActions"></div><button class="dnldButton"></button>' +
    '<button class="deleteButton"></button><button class="displayButton"></button><div class="displayFileContent">' +
    '</div><div class="fileDetailsTitle"></div><div class="rafterLogout"></div><div class="fileDld"></div>' +
    '<div class="createNew"></div><div class="isHomeDir"></div><div class="isHomeDir"></div><div id="divId">' +
    '<p class="folderName"></p></div><p class="fileDetailsTitle"></p><div class="homeDirContent"></div>' +
    '<div class="showHideHD" style="display:none"></div><div id="treeView"></div><div class="insideFolderDetails"></div>';
    const nameArr = [{
      name: 'myFolder',
      id: '123',
      type: 'folder',
      isContainer: true,
      children: []
    }];
    await rd.showFileDetails(
      '123', nameArr, rd.rafterFile, rd.rafterVolumeService, null, null, null, null,
      null, null, null, null, null, null, null, rd.rafterFileActions, nameArr, null
    );
    document.getElementsByClassName('deleteButton')[0].style.display = 'block';
    await rd.showFileDetails(
      '456789', nameArr, rd.rafterFile, rd.rafterVolumeService, null, null, null, null, null,
      null, null, null, null, null, null, rd.rafterFileActions, nameArr, null
    );
    expect(document.getElementsByClassName('deleteButton')[0].style.display).toBe('block');
    // id, subDirFiles, dnldbt, dfcbt, raf, subSubDirFiles, matchFile, rvs, myApp,
    // rui, mtws, hdj, tv, showFile, displayTree, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions
    await rd.rafterFileActions.setFileActions(
      '123', [{
        isContainer: true,
        id: '123'
      }], null, null, rd.rafterFile, null, null, () => {}, null, null, null, null, null, null, null,
      null, null, null, null, rd.rafterFileActions
    );
    expect(document.getElementsByClassName('homeDirContent')[0].innerHTML).toBe(JSON.stringify({
      isContainer: true,
      id: '123'
    }));
    await rd.rafterFileActions.setFileActions(
      '123', [{
        isContainer: false,
        id: '123',
        type: 'jpg'
      }], null, null, rd.rafterFile, null, null, () => {}, null, null, null, null, null, null, null,
      null, null, null, null, rd.rafterFileActions
    );
    expect(document.getElementsByClassName('homeDirContent')[0].innerHTML).toBe(JSON.stringify({
      isContainer: false,
      id: '123',
      type: 'jpg'
    }));
    expect(document.getElementsByClassName('dnldButton')[0].style.display).toBe('none');
    await rd.rafterFileActions.setSubSubFiles([{
      isContainer: false,
      id: '123',
      state: 'cool'
    }], '123');
    expect(document.getElementsByClassName('dnldButton')[0].style.display).toBe('block');
    document.getElementsByClassName('dnldButton')[0].style.display = 'block';
    await rd.rafterFileActions.setSubSubFiles([{
      isContainer: false,
      id: '123',
      state: 'cool',
      type: 'jpg'
    }], '123');
    expect(document.getElementsByClassName('dnldButton')[0].style.display).toBe('none');
    await rd.rafterFileActions.setSubSubFiles([{
      isContainer: false,
      id: '123',
      state: 'empty'
    }], '123');
    // expect(document.getElementsByClassName('dnldButton')[0].style.display).not.toBe('block');
    // done();
  }));
  it('displays the file details that are inside of the home directory', (done) => {
    rd.homeDirJson = {
      name: 'howdy'
    };
    rd.navHomeDir();
    expect(document.getElementsByClassName('subDirContent')[0].innerHTML).toBe(JSON.stringify(rd.homeDirJson));
    done();
  });
  it('does not have a download button for graphic files inside the home directory', (done) => {
    rd.rafterFileActions.fileNameState(
      { type: 'jpg' }, document.getElementsByClassName('dnldButton')[0],
      document.getElementsByClassName('displayButton')[0]
    );
    // = {
    //   name: 'howdy'
    // };
    // rd.navHomeDir();
    expect(document.getElementsByClassName('dnldButton')[0].style.display).toBe('none');
    done();
  });
  it('does not default to create file when folder was selected and set the file name to unspecified when blank', (done) => {
    rd.rafterFile.createType = 'folder';
    rd.rafterFile.name = '';
    rd.fetchVS('create');
    expect(rd.rafterFile.createType).toBe('folder');
    expect(rd.rafterFile.name).toBe('unspecified');
    done();
  });
  it('does not append the path with sub sub folder', (done) => {
    rd.rafterFile.createType = 'file';
    rd.rafterFile.name = 'testFile';
    rd.rafterFile.path = '/subFolder';
    document.getElementsByClassName('folderName')[0].innerHTML = 'subFolder';
    rd.fetchVS('create');
    expect(rd.rafterFile.path).toBe('/subFolder');
    // expect(rd.rafterFile.name).toBe('unspecified');
    done();
  });
  it('displays error messages from volume service commands', testAsync(async () => {
    const data = {
      message: 'failed'
    };
    const myFetch = function () {
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve(data)
      });
    };
    const myApp = {
      httpClient: {
        fetch: myFetch
      }
    };
    await rd.vsFetch(null, myApp, null, 'create');
    expect(document.getElementsByClassName('userServiceError')[0].innerHTML).not.toBe('');
  }));
  it('retrieves the contents of a sub directory', testAsync(async () => {
    const data = {
      files: ['howdy']
    };
    const myFetch = function () {
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve(data)
      });
    };
    const myApp = {
      httpClient: {
        fetch: myFetch
      }
    };
    // spyOn(rd, 'vsFetchSuccess').and.callThrough();
    await rd.vsFetch(rd.vsFetchSuccess, myApp, null, 'ls', null, true);
    // expect(rd.vsFetchSuccess).toHaveBeenCalled();
  }));
  it('makes a tree with subdirectories after receiving the contents of the folder', testAsync(async () => {
    const data = {
      files: ['howdy']
    };
    spyOn(rd, 'makeTreeWithSub').and.callThrough();
    await rd.vsFetchSuccess(
      data, rd.vsFetchSuccess, null, null, null, rd.rafterFile, null,
      rd.makeTreeWithSub, null, null, null, null, null, null, []
    );
    expect(rd.makeTreeWithSub).toHaveBeenCalled();
  }));
  it('allows delete of folders if they are empty', testAsync(async () => {
    const fa = document.getElementsByClassName('fileActions')[0];
    fa.style.display = 'none';
    const data = [];
    spyOn(rd, 'makeTreeWithSub').and.callThrough();
    await rd.vsFetchSuccess(
      data, rd.vsFetchSuccess, null, null, null, rd.rafterFile, null,
      rd.makeTreeWithSub, null, null, null, null, null, null, []
    );
    expect(fa.style.display).toBe('block');
  }));
  it('makes a tree with subdirectories after receiving the contents of the sub sub directory', testAsync(async () => {
    const data = ['howdy'];
    const subSubDirFiles = [];
    spyOn(rd, 'makeTreeWithSub').and.callThrough();
    await rd.vsFetchSuccess(data, rd.vsFetchSuccess, null, null, null, {
      rfid: '123'
    }, null, rd.makeTreeWithSub, null, null, null, null, null, null, [], null, null, null, null, subSubDirFiles);
    expect(rd.makeTreeWithSub).toHaveBeenCalled();
  }));
  it('catches error on create a new file', testAsync(async () => {
    let serverStatus = 500;
    const myFetch = function () {
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.reject(new Error({
          error: 'fail',
          status: serverStatus
        }))
      });
    };
    const myApp = {
      httpClient: {
        fetch: myFetch
      }
    };
    await rd.vsFetch(null, myApp, null, 'create', null, false);
    serverStatus = 400;
    await rd.vsFetch(null, myApp, null, 'create', null, false);
    // console.log('did I catch an error?');
    // console.log(catchErr);
    // expect(document.getElementsByClassName('userServiceError')[0].innerHTML).not.toBe('&nbsp;');
  }));
  it('displays the metadata of an empty file that is inside a sub folder', (done) => {
    rd.homeDirJson = {
      name: 'howdy'
    };
    rd.subDirJson = [{
      state: 'empty',
      name: 'howdy',
      id: '123'
    }];
    document.body.innerHTML = '<div class="fileActions"></div><button class="dnldButton"></button>' +
    '<button class="deleteButton"></button><button class="displayButton"></button><div class="displayFileContent">' +
    '</div><button class="deleteButton"></button><button class="dnldButton"></button><div class="fileDetailsTitle">' +
    '</div><div class="rafterLogout"></div><div class="fileDld"></div><div class="userServiceError"></div>' +
    '<button class="rafterCheckHome"></button><div class="createNew"></div><div class="isHomeDir"></div>' +
    '<div class="isHomeDir"></div><div id="divId"><p class="folderName"></p></div><p class="fileDetailsTitle">' +
    '</p><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div id="treeView">' +
    '</div><div class="insideFolderDetails"></div><div class="subDirContent"></div>';
    rd.showFileDetails(
      '123', [], null, null, null, null, null, null, null, null, rd.subDirJson,
      null, null, null, null, rd.rafterFileActions, null, []
    );
    expect(document.getElementsByClassName('homeDirContent')[0].innerHTML).toBe(JSON.stringify(rd.subDirJson[0]));
    document.getElementsByClassName('homeDirContent')[0].innerHTML = '';
    rd.showFileDetails(
      '1234', [], null, null, null, null, null, null, null, null, rd.subDirJson,
      null, null, null, null, rd.rafterFileActions, null, []
    );
    expect(document.getElementsByClassName('homeDirContent')[0].innerHTML).toBe('');
    expect(document.getElementsByClassName('displayButton')[0].style.display).toBe('none');
    done();
  });
  it('displays the metadata of a not empty file that is inside a sub folder', (done) => {
    rd.homeDirJson = {
      name: 'howdy'
    };
    rd.subDirJson = [{
      state: 'ready',
      name: 'howdy',
      id: '123'
    }];
    document.body.innerHTML = '<div class="fileActions"></div><button class="dnldButton"></button>' +
    '<button class="deleteButton"></button><button class="displayButton"></button><div class="displayFileContent">' +
    '</div><button class="deleteButton"></button><button class="dnldButton"></button><div class="fileDetailsTitle">' +
    '</div><div class="rafterLogout"></div><div class="fileDld"></div><div class="userServiceError"></div>' +
    '<button class="rafterCheckHome"></button><div class="createNew"></div><div class="isHomeDir"></div>' +
    '<div class="isHomeDir"></div><div id="divId"><p class="folderName"></p></div><p class="fileDetailsTitle">' +
    '</p><div class="homeDirContent"></div><div class="showHideHD" style="display:none"></div><div id="treeView">' +
    '</div><div class="insideFolderDetails"></div>' +
    '<div class="subDirContent"></div>';
    rd.showFileDetails(
      '123', [], null, null, null, null, null, null, null, null, rd.subDirJson,
      null, null, null, null, rd.rafterFileActions, null, []
    );
    expect(document.getElementsByClassName('homeDirContent')[0].innerHTML).toBe(JSON.stringify(rd.subDirJson[0]));
    expect(document.getElementsByClassName('displayButton')[0].style.display).toBe('block');
    document.getElementsByClassName('homeDirContent')[0].innerHTML = '';
    rd.showFileDetails(
      '1234', [], null, null, null, null, null, null, null, null, rd.subDirJson, null,
      null, null, null, rd.rafterFileActions, null, []
    );
    expect(document.getElementsByClassName('homeDirContent')[0].innerHTML).toBe('');
    done();
  });
  it('does not show the file details when the id is missing', (done) => {
    rd.app.httpClient = new HttpMock();
    rd.rafterVolumeService = function () {};
    document.body.innerHTML = '<div class="fileActions"></div><button class="dnldButton"></button>' +
    '<button class="deleteButton"></button><button class="displayButton"></button><div class="displayFileContent">' +
    '</div><div class="fileDetailsTitle"></div><div class="rafterLogout"></div><div class="fileDld"></div>' +
    '<div class="createNew"></div><div class="isHomeDir"></div><div class="isHomeDir"></div><div id="divId">' +
    '<p class="folderName"><p class="fileDetailsTitle"></p></p></div><div class="homeDirContent"></div>' +
    '<div class="showHideHD" style="display:none"></div><div id="treeView"></div><div class="insideFolderDetails"></div>';
    const nameArr = [{
      name: 'myFolder',
      id: '123',
      type: 'file',
      isContainer: false,
      children: []
    }];
    rd.showFileDetails(
      '1234', nameArr, rd.rafterFile, rd.rafterVolumeService, null, null, null, null, null,
      null, null, null, null, null, null, rd.rafterFileActions, null, nameArr
    );
    // document.getElementsByClassName('tree-leaf-text')[0].click();
    expect(document.getElementsByClassName('homeDirContent')[0].innerHTML).toBe('');
    done();
  });
  it('makes a tree menu without a folder', testAsync(async () => {
    rd.displayTree = function () {};
    document.body.innerHTML = '<div id="divId"></div><div class="homeDirContent"></div><div class="showHideHD" style="display:none">' +
    '</div><div id="treeView"></div><div class="subDirContent"></div>';
    await rd.makeTree([{
      name: 'unknown',
      id: '8675309',
      isContainer: false,
      children: []
    }, {
      name: 'yoyo',
      id: '123'
    }]);
  }));
  it('makes a tree menu with a folder open including sub sub folders', testAsync(async () => {
    rd.displayTree = function () {};
    rd.tv = {
      expandAll() {},
      data: [{
        name: 'myFolder',
        id: '456',
        type: 'folder',
        isContainer: false,
        children: []
      }, {
        name: 'myFolder2',
        id: '4562',
        type: 'folder',
        isContainer: false,
        children: []
      }]
    };
    document.body.innerHTML = '<div id="divId"></div><div class="homeDirContent"></div><div class="showHideHD" style="display:none">' +
    '</div><div id="treeView"></div><div class="subDirContent"></div>';
    let data = [{
      name: 'myFile',
      id: '123',
      type: 'file',
      isContainer: false,
      children: []
    }];
    const hdj = [{
      name: 'myFolder',
      id: '456',
      type: 'folder',
      isContainer: true,
      children: []
    }];
    spyOn(window.sessionStorage, 'setItem').and.callThrough();
    spyOn(window.sessionStorage, 'removeItem').and.callThrough();
    await rd.makeTreeWithSub(
      data, null, hdj, rd.tv, rd.showFileDetails, rd.rafterFile, null, null, null,
      rd.makeTreeWithSub, rd.displayTree, rd.subDirJson, rd.makeNewJson, null, null, null, rd.rafterFileActions
    );
    expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
    await rd.makeTreeWithSub(
      data, '456', hdj, rd.tv, rd.showFileDetails, rd.rafterFile, null, null, null,
      rd.makeTreeWithSub, rd.displayTree, rd.subDirJson, rd.makeNewJson, null, null, null, rd.rafterFileActions
    );
    expect(window.sessionStorage.setItem).toHaveBeenCalled();
    await rd.makeTreeWithSub(data, '456', hdj, rd.tv, rd.showFileDetails, {
      rfid: '123'
    }, null, null, null, rd.makeTreeWithSub, rd.displayTree, rd.subDirJson, rd.makeNewJson, null, null, null, rd.rafterFileActions);
    expect(window.sessionStorage.removeItem).toHaveBeenCalled();
    await rd.makeTreeWithSub(data, '456', hdj, rd.tv, rd.showFileDetails, {
      rfid: '999999'
    }, null, null, null, rd.makeTreeWithSub, rd.displayTree, rd.subDirJson, rd.makeNewJson, null, null, null, rd.rafterFileActions);
    expect(window.sessionStorage.removeItem).toHaveBeenCalled();
    data = [{
      name: 'myFile',
      id: '123',
      type: 'file',
      isContainer: false,
      children: [{
        id: '1234'
      }]
    }, {
      name: 'myFile',
      id: '123',
      type: 'file',
      isContainer: false,
      children: [{
        id: '333'
      }]
    }];
    spyOn(window.sessionStorage, 'getItem').and.callFake(() => '333');
    // let newData = await rd.rafterFileActions.makeSubSubTree(data, rd.rafterFile, []);
    // expect(newData[0].children[0].children).toBe(undefined);
    data = [{
      name: 'myFile',
      id: '123',
      type: 'file',
      isContainer: false,
      children: [{
        id: '1234',
        children: [{
          id: 'howdy'
        }]
      }]
    }, {
      name: 'myFile',
      id: '123',
      type: 'file',
      isContainer: false,
      children: [{
        id: '333'
      }]
    }];
    let newData = await rd.rafterFileActions.makeSubSubTree(data, rd.rafterFile, []); //eslint-disable-line
    expect(newData[0].children[0].children.length).toBe(0);
    data = [{
      name: 'myFile',
      id: '123',
      type: 'file',
      isContainer: false,
      children: [{
        id: '1234',
        children: []
      }]
    }, {
      name: 'myFile',
      id: '123',
      type: 'file',
      isContainer: false,
      children: [{
        id: '333'
      }]
    }];
    newData = await rd.rafterFileActions.makeSubSubTree(data, rd.rafterFile, []);
    expect(newData[0].children[0].children.length).toBe(0);
  }));
  it('detects an expired token', (done) => {
    let isValid, tkn = { exp: 123 };
    rd.rafterUser = new RafterUser();
    isValid = rd.rafterUser.checkExpired(tkn);
    expect(isValid).toBe(false);
    tkn = { exp: 999999999999 };
    isValid = rd.rafterUser.checkExpired(tkn);
    expect(isValid).toBe(true);
    done();
  });
  it('checks if the user has logged in on initial page load and detects a valid token', (done) => {
    document.body.innerHTML = '<div class="rafterLogout" style="display:block"></div>';
    /* eslint-disable */
    const tkn = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6W10sImZpcnN0X25hbWUiOiJuZHNzbCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv' +
      '-i9vRVuzPJEWxPHhXZTSzLXiwPlLB5P9VOlzgDPhmVuPwx2n0q-T9hbV6vGt1E0EL-oKex1dpVE10iM0BWujXvQRC8gPJXhIBNR6zUDXX5ziO_8Y48CNWvKBDKhTjcrGEuj7CEMSt9kZBlgt-E_DnkibnFfHl763k_vPWqJ4okWkhELXtpCj7ObKrjNGRjYzKrMRyjJkIHLOc6ZEsTKkWt4ATzOXN_jVYFqN5tzRpMqiqC-G0oS-aSOiML6HZpqiEu26oLoQ4a6RDAXPp6Me9SXwkhw7K-JNDvW68LRyXIMnz7HisLWhc6-1XykgQ6MLcu4uvsOBD11VQpVmO-5Dkdf2vAlr7jbQ8tvKZaJi4W2PEiVIfR6lNhGPLyU4Zx4bg084tzi6n3jSipKcavfPY' +
      '-iNAbZOYDXlB8GKdDIEFpRQmO11Yyr1_B9OjRYFWrf1scdlLhdXcRQT33FHQo_sakhZMI36s50ksj6B4ghrEHhdvgE1TFBgMg6uyRiNiZiRVgd08kMok_JmlJrjGkqoUIgvZeC9NkjGU8YcV5bF5ZTeJpTlJ7l28W8fY_lkjOs4LBsxoJDdnrdGR-FsfFMQJajL4LEuwXGlpBHjfiLpqflRYhf8poDRU';
        /* eslint-enable */
    sessionStorage.setItem('rafterToken', tkn);
    rd.rafterUser = new RafterUser(rd.app.httpClient);
    rd.rafterUser.checkExpired = function () {
      return true;
    };
    const rlo = rd.rafterUser.rafterLogout;
    const cipr = rd.rafterUser.checkIfPageReload;
    rd.showLogin = rd.checkIfLoggedIn(rd.rafterUser.checkExpired, rlo, this.showLogin, cipr);
    expect(sessionStorage.getItem('rafterToken')).not.toBe(null);
    expect(rd.showLogin).toBe(false);
    done();
  });
  it('checks if the user has logged during a set interval and removes the token if is has expired', (done) => {
    document.body.innerHTML = '<div class="rafterLogout" style="display:block"></div>';
    /* eslint-disable */
    const tkn = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6W10sImZpcnN0X25hbWUiOiJuZHNzbCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv' +
      '-i9vRVuzPJEWxPHhXZTSzLXiwPlLB5P9VOlzgDPhmVuPwx2n0q-T9hbV6vGt1E0EL-oKex1dpVE10iM0BWujXvQRC8gPJXhIBNR6zUDXX5ziO_8Y48CNWvKBDKhTjcrGEuj7CEMSt9kZBlgt-E_DnkibnFfHl763k_vPWqJ4okWkhELXtpCj7ObKrjNGRjYzKrMRyjJkIHLOc6ZEsTKkWt4ATzOXN_jVYFqN5tzRpMqiqC-G0oS-aSOiML6HZpqiEu26oLoQ4a6RDAXPp6Me9SXwkhw7K-JNDvW68LRyXIMnz7HisLWhc6-1XykgQ6MLcu4uvsOBD11VQpVmO-5Dkdf2vAlr7jbQ8tvKZaJi4W2PEiVIfR6lNhGPLyU4Zx4bg084tzi6n3jSipKcavfPY' +
      '-iNAbZOYDXlB8GKdDIEFpRQmO11Yyr1_B9OjRYFWrf1scdlLhdXcRQT33FHQo_sakhZMI36s50ksj6B4ghrEHhdvgE1TFBgMg6uyRiNiZiRVgd08kMok_JmlJrjGkqoUIgvZeC9NkjGU8YcV5bF5ZTeJpTlJ7l28W8fY_lkjOs4LBsxoJDdnrdGR-FsfFMQJajL4LEuwXGlpBHjfiLpqflRYhf8poDRU';
        /* eslint-enable */
    sessionStorage.setItem('rafterToken', tkn);
    // expect(isValid).toBe(false);
    // tkn = {exp: 999999999999};
    const cep = function () {
      return false;
    };
    const rlo = function () {
      sessionStorage.removeItem('rafterToken');
    };
    const sli = true;
    rd.checkIfLoggedIn(cep, rlo, sli);
    expect(sessionStorage.getItem('rafterToken')).toBe(null);
    // expect(sli).toBe(false);
    // expect(isValid).toBe(true);
    done();
  });
  it('checks if the user has logged during a set interval and detects a valid token', (done) => {
    document.body.innerHTML = '<div class="rafterLogout" style="display:block"></div>';
    /* eslint-disable */
    const tkn = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6W10sImZpcnN0X25hbWUiOiJuZHNzbCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv' +
      '-i9vRVuzPJEWxPHhXZTSzLXiwPlLB5P9VOlzgDPhmVuPwx2n0q-T9hbV6vGt1E0EL-oKex1dpVE10iM0BWujXvQRC8gPJXhIBNR6zUDXX5ziO_8Y48CNWvKBDKhTjcrGEuj7CEMSt9kZBlgt-E_DnkibnFfHl763k_vPWqJ4okWkhELXtpCj7ObKrjNGRjYzKrMRyjJkIHLOc6ZEsTKkWt4ATzOXN_jVYFqN5tzRpMqiqC-G0oS-aSOiML6HZpqiEu26oLoQ4a6RDAXPp6Me9SXwkhw7K-JNDvW68LRyXIMnz7HisLWhc6-1XykgQ6MLcu4uvsOBD11VQpVmO-5Dkdf2vAlr7jbQ8tvKZaJi4W2PEiVIfR6lNhGPLyU4Zx4bg084tzi6n3jSipKcavfPY' +
      '-iNAbZOYDXlB8GKdDIEFpRQmO11Yyr1_B9OjRYFWrf1scdlLhdXcRQT33FHQo_sakhZMI36s50ksj6B4ghrEHhdvgE1TFBgMg6uyRiNiZiRVgd08kMok_JmlJrjGkqoUIgvZeC9NkjGU8YcV5bF5ZTeJpTlJ7l28W8fY_lkjOs4LBsxoJDdnrdGR-FsfFMQJajL4LEuwXGlpBHjfiLpqflRYhf8poDRU';
        /* eslint-enable */
    sessionStorage.setItem('rafterToken', tkn);
    // expect(isValid).toBe(false);
    // tkn = {exp: 999999999999};
    const cep = function () {
      return true;
    };
    const rlo = function () {
      sessionStorage.removeItem('rafterToken');
    };
    const sli = true;
    rd.checkIfLoggedIn(cep, rlo, sli);
    expect(sessionStorage.getItem('rafterToken')).not.toBe(null);
    // expect(sli).toBe(false);
    // expect(isValid).toBe(true);
    done();
  });
  it('checks if the user has logged during a set interval and detects an invalid token', (done) => {
    document.body.innerHTML = '<div class="rafterLogout" style="display:block"></div>';
    /* eslint-disable */
    const tkn = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv';
        /* eslint-enable */
    sessionStorage.setItem('rafterToken', tkn);
    // expect(isValid).toBe(false);
    // tkn = {exp: 999999999999};
    const cep = function () {
      return false;
    };
    const rlo = function () {
      sessionStorage.removeItem('rafterToken');
    };
    const sli = true;
    rd.checkIfLoggedIn(cep, rlo, sli);
    expect(sessionStorage.getItem('rafterToken')).toBe(null);
    // expect(sli).toBe(false);
    // expect(isValid).toBe(true);
    done();
  });
  it('reloads the page if sessionStorage was deleted', testAsync(async () => {
    // document.body.innerHTML += '<div class="rafterLogout" style="display:block"></div>';
    document.getElementsByClassName('rafterLogout')[0].style.display = 'block';
    rd.rafterUser = new RafterUser(rd.app.httpClient);
    const cep = function () {
      return false;
    };
    const rlo = function () {
      sessionStorage.removeItem('rafterToken');
    };
    const sli = true;
    await rd.checkIfLoggedIn(cep, rlo, sli, rd.rafterUser.checkIfPageReload);
    document.getElementsByClassName('rafterLogout')[0].style.display = 'none';
    // document.body.innerHTML = '<div class="rafterLogout" style="display:none"></div>';
    await rd.checkIfLoggedIn(cep, rlo, sli, rd.rafterUser.checkIfPageReload);
    // document.body.innerHTML = '';
    await rd.checkIfLoggedIn(cep, rlo, sli, rd.rafterUser.checkIfPageReload);
    document.getElementsByClassName('showHideHD')[0].style.display = 'block';
    await rd.rafterUser.checkIfPageReload();
    // expect(document.getElementsByClassName('showHideHD')[0].style.display).toBe('none');
  }));

  it('continues to check for expired token when there is a user defined', (done) => {
    jasmine.clock().install();
    /* eslint-disable */
    const tkn = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6W10sImZpcnN0X25hbWUiOiJuZHNzbCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv' +
      '-i9vRVuzPJEWxPHhXZTSzLXiwPlLB5P9VOlzgDPhmVuPwx2n0q-T9hbV6vGt1E0EL-oKex1dpVE10iM0BWujXvQRC8gPJXhIBNR6zUDXX5ziO_8Y48CNWvKBDKhTjcrGEuj7CEMSt9kZBlgt-E_DnkibnFfHl763k_vPWqJ4okWkhELXtpCj7ObKrjNGRjYzKrMRyjJkIHLOc6ZEsTKkWt4ATzOXN_jVYFqN5tzRpMqiqC-G0oS-aSOiML6HZpqiEu26oLoQ4a6RDAXPp6Me9SXwkhw7K-JNDvW68LRyXIMnz7HisLWhc6-1XykgQ6MLcu4uvsOBD11VQpVmO-5Dkdf2vAlr7jbQ8tvKZaJi4W2PEiVIfR6lNhGPLyU4Zx4bg084tzi6n3jSipKcavfPY' +
      '-iNAbZOYDXlB8GKdDIEFpRQmO11Yyr1_B9OjRYFWrf1scdlLhdXcRQT33FHQo_sakhZMI36s50ksj6B4ghrEHhdvgE1TFBgMg6uyRiNiZiRVgd08kMok_JmlJrjGkqoUIgvZeC9NkjGU8YcV5bF5ZTeJpTlJ7l28W8fY_lkjOs4LBsxoJDdnrdGR-FsfFMQJajL4LEuwXGlpBHjfiLpqflRYhf8poDRU';
    /* eslint-enable */
    sessionStorage.setItem('rafterToken', tkn);
    document.body.innerHTML = '<div class="rafterLogout" style="display:block"></div>';
    rd.rafterUser = {
      rafterLogout() {},
      checkIfPageReload() {}
    };
    rd.attached();
    jasmine.clock().tick(5500);
    // setTimeout(() => {
    done();
    jasmine.clock().uninstall();
    // }, 5500);
  });
  it('continues to check for expired token when there is not a user defined', (done) => {
    document.body.innerHTML = '<div class="rafterLogout" style="display:block"></div>';
    sessionStorage.removeItem('rafterUser');
    rd.rafterUser = {
      rafterLogout() {}
    };
    rd.attached();
    done();
  });
});
