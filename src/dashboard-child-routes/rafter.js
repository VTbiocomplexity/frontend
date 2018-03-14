import {inject} from 'aurelia-framework';
import {App} from '../app';
import { saveAs } from 'file-saver';
import { RafterUser } from '../classes/RafterUser';
const jwtDecode = require('jwt-decode');
const TreeView = require('js-treeview');
@inject(App, FileReader)
export class Rafter {
  constructor(app, reader) {
    this.showLogin = true;
    this.reader = reader;
    this.app = app;
    this.rafterUserID = '';
    this.rafter = {
      id: '',
      password: ''
    };
    this.rafterFile = {name: '', createType: 'file', path: ''};
    this.tv = null;
    this.homeDirJson = null;
    this.subDirJson = [];
    this.rafterFileID = '';
    //this.createType = 'file';
    //   this.vs = new VolumeService('http://rafter.bi.vt.edu/volumesvc/', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6W10sImZpcnN0X25hbWUiOiJuZHNzbCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv' +
    //   '-i9vRVuzPJEWxPHhXZTSzLXiwPlLB5P9VOlzgDPhmVuPwx2n0q-T9hbV6vGt1E0EL-oKex1dpVE10iM0BWujXvQRC8gPJXhIBNR6zUDXX5ziO_8Y48CNWvKBDKhTjcrGEuj7CEMSt9kZBlgt-E_DnkibnFfHl763k_vPWqJ4okWkhELXtpCj7ObKrjNGRjYzKrMRyjJkIHLOc6ZEsTKkWt4ATzOXN_jVYFqN5tzRpMqiqC-G0oS-aSOiML6HZpqiEu26oLoQ4a6RDAXPp6Me9SXwkhw7K-JNDvW68LRyXIMnz7HisLWhc6-1XykgQ6MLcu4uvsOBD11VQpVmO-5Dkdf2vAlr7jbQ8tvKZaJi4W2PEiVIfR6lNhGPLyU4Zx4bg084tzi6n3jSipKcavfPY' +
    //   '-iNAbZOYDXlB8GKdDIEFpRQmO11Yyr1_B9OjRYFWrf1scdlLhdXcRQT33FHQo_sakhZMI36s50ksj6B4ghrEHhdvgE1TFBgMg6uyRiNiZiRVgd08kMok_JmlJrjGkqoUIgvZeC9NkjGU8YcV5bF5ZTeJpTlJ7l28W8fY_lkjOs4LBsxoJDdnrdGR-FsfFMQJajL4LEuwXGlpBHjfiLpqflRYhf8poDRU');
    // //   this.auth = auth;
    // //
  }

  async activate() {
    this.uid = this.app.auth.getTokenPayload().sub;
    this.user = await this.app.appState.getUser(this.uid);
    this.rafterUser = new RafterUser();
    this.checkIfLoggedIn();
  }

  navHomeDir() {
    console.log('you clicked me');
    let hdc = JSON.stringify(this.homeDirJson);
    this.rafterFile.path = '';
    document.getElementsByClassName('folderName')[0].innerHTML = 'home/' + this.rafterUserID;
    document.getElementsByClassName('insideFolderDetails')[0].style.display = 'block';
    document.getElementsByClassName('subDirContent')[0].innerHTML = hdc;
    document.getElementsByClassName('fileDetailsTitle')[0].style.display = 'none';
    document.getElementsByClassName('fileDetailsTitle')[1].style.display = 'none';
    document.getElementsByClassName('homeDirContent')[0].innerHTML = '';
    document.getElementsByClassName('createNew')[0].style.display = 'block';
    document.getElementsByClassName('isHomeDir')[0].style.display = 'block';
    document.getElementsByClassName('isHomeDir')[1].style.display = 'block';
    this.rafterVolumeService('ls');
  }

  radioClicked() {
    if (document.getElementById('fileType2').checked) {
      this.rafterFile.createType = 'folder';
    } else {
      this.rafterFile.createType = 'file';
    }
  }

  displayTree(tv, nameArr, divId, showFile, hdj, raf, rvs, myApp, rui, mtws, displayTree, subDirFiles, mnj) {
    let filesInFolder;
    let insideFolderDetails;
    let allData = [];
    tv = new TreeView(nameArr, divId);
    let getTreeLeaves = document.getElementsByClassName('tree-leaf-content');
    //console.log(getTreeLeaves);
    //console.log(getTreeLeaves.length);
    let treeNodeObj;
    let foldersArr = [];
    for (let i = 0; i < getTreeLeaves.length; i++) {
      //console.log('am I iterating?');
      //console.log(getTreeLeaves[i].getAttribute('data-item'));
      treeNodeObj = JSON.parse(getTreeLeaves[i].getAttribute('data-item'));
      //console.log(treeNodeObj.type);
      if (treeNodeObj.isContainer) {
        getTreeLeaves[i].innerHTML = '<div class="tlfolder fa fa-folder"></div>' + getTreeLeaves[i].innerHTML;
        foldersArr.push({id: treeNodeObj.id, domDiv: getTreeLeaves[i]});
      }
    }
    //console.log(foldersArr);
    // make folders clickable
    for (let j = 0; j < foldersArr.length; j++) {
      //console.log(foldersArr[j]);
      filesInFolder = foldersArr[j].domDiv.nextElementSibling;
      //console.log(filesInFolder);
      //console.log(filesInFolder.getElementByClassName('tree-leaf'));
      foldersArr[j].domDiv.addEventListener('click', function(evt) {
        //console.log(evt);
        showFile(foldersArr[j].id, hdj, raf, rvs, myApp, rui, mtws, tv, showFile, displayTree, subDirFiles, mnj);
        //mtws();
      });
    }
    // tv.on('select', function(evt) {
    //   console.log(evt.data);
    //   showFile(evt.data.id, allData, raf, rvs, myApp, rui, null, null, null, null);
    // });
    //tv.expandAll();
    //console.log(filesInFolder.innerHTML);
    let fif = [];
    if (filesInFolder !== null && filesInFolder !== undefined) {
      fif = filesInFolder.getElementsByClassName('tree-leaf');
      //console.log(fif);
    }
    insideFolderDetails = document.getElementsByClassName('subDirContent')[0].innerHTML;
    //console.log(insideFolderDetails);
    if (insideFolderDetails !== '' && fif.length !== 0) {
      let ifd = JSON.parse(insideFolderDetails);
      //console.log(ifd);
      allData = ifd;
    } else {
      //console.log('else line 94');
      allData = hdj;
    }
    //console.log(allData);
    //hdj = idf;
    for (let k = 0; k < fif.length; k++) {
      let fileID = fif[k].getElementsByClassName('tree-leaf-content')[0];
      let fileIDsJson = fileID.getAttribute('data-item');
      let fileIDJson = JSON.parse(fileIDsJson);
      fif[k].addEventListener('click', function(evt) {
        console.log('I clicked the file inside sub folder');
        showFile(fileIDJson.id, allData, raf, rvs, myApp, rui, null, null, null, null, subDirFiles, mnj);
        //mtws();
      });
    }
    tv.on('select', function(evt) {
      console.log('i clicked the select event from tv');
      console.log(evt.data.id);
      showFile(evt.data.id, hdj, raf, rvs, myApp, rui, null, null, null, null, subDirFiles, mnj);
    });
    // let treeViewDiv = document.getElementById('treeView');
    // treeViewDiv.innerHTML = '<div class="homeDirLink"><a id="homeDirClicker">home/JoshuaVSherman</a></div>' + treeViewDiv.innerHTML;
  }

  showFileDetails(id, hdj, raf, rvs, myApp, rui, mtws = null, tv, showFile, displayTree, subDirFiles, mnj) {
    console.log('going to display the file details now');
    console.log(id);
    console.log('is this a sub directory?');
    document.getElementsByClassName('fileDetailsTitle')[0].style.display = 'block';
    document.getElementsByClassName('fileDetailsTitle')[1].style.display = 'block';
    let ifd = document.getElementsByClassName('insideFolderDetails')[0];
    if (mtws === null) {
      ifd.style.display = 'none';
      document.getElementsByClassName('createNew')[0].style.display = 'none';
    } else {
      ifd.style.display = 'block';
      document.getElementsByClassName('isHomeDir')[0].style.display = 'none';
      document.getElementsByClassName('isHomeDir')[1].style.display = 'none';
      document.getElementsByClassName('createNew')[0].style.display = 'block';
    }
    for (let i = 0; i < hdj.length; i++) {
      if (id === hdj[i].id) {
        document.getElementsByClassName('homeDirContent')[0].innerHTML = JSON.stringify(hdj[i]);
        //console.log(hdj[i].isContainer);
        if (hdj[i].isContainer) {
          console.log('I found a folder');
          document.getElementsByClassName('fileDld')[0].style.display = 'none';
          document.getElementsByClassName('fileDetailsTitle')[0].style.display = 'none';
          document.getElementsByClassName('folderName')[0].innerHTML = hdj[i].name;
          raf.path = '/' + hdj[i].name;
          //document.getElementsByClassName('uploadForm')[0].style.display = 'block';
          //console.log('line 86?');
          return rvs('ls', myApp, rui, raf, mtws, hdj[i].id, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj);
        }
        //set Filename
        //console.log(hdj[i].name);
        document.getElementsByClassName('dnldButton')[0].innerHTML = ('Download<br>' + hdj[i].name);
        document.getElementsByClassName('deleteButton')[0].innerHTML = ('Delete<br>' + hdj[i].name);
        return;
      }
    }
    //console.log('line 175');
    if (subDirFiles !== null && subDirFiles !== undefined) {
      //console.log('line 177');
      for (let j = 0; j < subDirFiles.length; j++) {
        if (id === subDirFiles[j].id) {
          console.log('i found a match!');
          document.getElementsByClassName('dnldButton')[0].innerHTML = ('Download<br>' + subDirFiles[j].name);
          document.getElementsByClassName('deleteButton')[0].innerHTML = ('Delete<br>' + subDirFiles[j].name);
          return document.getElementsByClassName('homeDirContent')[0].innerHTML = JSON.stringify(subDirFiles[j]);
        }
      }
    }
  }

  makeNewJson(data) {
    let nameArr = [];
    let nameObj = {};
    for (let i = 0; i < data.length; i++) {
      nameObj = {name: data[i].name, id: data[i].id, type: data[i].type, isContainer: data[i].isContainer, children: []};
      nameArr.push(nameObj);
    }
    return nameArr;
  }

  makeTree(data) {
    let nameArr = this.makeNewJson(data);
    this.displayTree(this.tv, nameArr, 'treeView', this.showFileDetails, this.homeDirJson, this.rafterFile, this.rafterVolumeService, this.app, this.rafterUserID, this.makeTreeWithSub, this.displayTree, this.subDirJson, this.makeNewJson);
  }

  async makeTreeWithSub(data, hdjId, hdj, tv, showFile, raf, rvs, myApp, rui, mtws, displayTree, subDirFiles, mnj) {
    let childArr = mnj(data);
    for (let i = 0; i < tv.data.length; i++) {
      if (hdjId === tv.data[i].id) {
        tv.data[i].children = childArr;
      }
    }
    let newData = tv.data;
    await displayTree(tv, newData, 'treeView', showFile, hdj, raf, rvs, myApp, rui, mtws, displayTree, subDirFiles, mnj);
    tv.expandAll();
  }

  rafterVolumeService(cmd, myApp = null, rui = null, raf = null, mtws = null, hdjId = null, hdj = null, tv = null, showFile = null, rvs = null, displayTree = null, subDirFiles = null, mnj) {
    document.getElementsByClassName('userServiceError')[0].innerHTML = '';
    document.getElementsByClassName('showHideHD')[0].style.display = 'block';
    document.getElementsByClassName('rafterCheckHome')[0].style.display = 'none';
    if (myApp === null) {
      myApp = this.app;
    }
    if (rui === null) {
      rui = this.rafterUserID;
    }
    if (raf === null) {
      raf = this.rafterFile;
    }
    if (raf.createType !== 'folder') {
      raf.createType = 'file';
    }
    raf.name = raf.name.replace(/\s/g, '');
    raf.name = raf.name.replace(/!/g, '');
    myApp.httpClient.fetch('/rafter/vs', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({token: localStorage.getItem('rafterToken'), userName: rui, command: cmd, rafterFile: raf})
    })
    .then((response) => response.json())
    .then((data) => {
      if (cmd === 'ls') {
        if (raf.path === '') {
          this.homeDirJson = data;
          return this.makeTree(data);
        }
        document.getElementsByClassName('subDirContent')[0].innerHTML = JSON.stringify(data);
        subDirFiles.push.apply(subDirFiles, data);
        return mtws(data, hdjId, hdj, tv, showFile, raf, rvs, myApp, rui, mtws, displayTree, subDirFiles, mnj);
      } else if (data.message !== null && data.message !== '' && data.message !== undefined) {
        return document.getElementsByClassName('userServiceError')[0].innerHTML = data.message;
      } else if (cmd === 'create') {
        this.rafterFile = {name: '', createType: '', path: ''};
        this.rafterVolumeService('ls');
        this.navHomeDir();
      }
    }).catch(function (err) {
      // if (cmd !== 'ls') {
      console.log(err);
      // }
    });
  }

  fileDelete() {
    let fileDetails = document.getElementsByClassName('homeDirContent')[0].innerHTML;
    let fdJson = JSON.parse(fileDetails);
    this.rafterFileID = fdJson.id;
    this.app.httpClient.fetch('/rafter/vs', { method: 'post', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({command: 'remove', fileID: this.rafterFileID})
    }).then((response) => response.json()).then((data) => {
      if (data) {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'test') {
          window.location.reload();
        }
      }
      //saveAs(blob, fdJson.name);
    }).catch(function (err) {
      console.log(err);
    });
  }

  fileDownload() {
    let fileDetails = document.getElementsByClassName('homeDirContent')[0].innerHTML;
    let fdJson = JSON.parse(fileDetails);
    this.rafterFileID = fdJson.id;
    this.app.httpClient.fetch('/rafter/vs', { method: 'post', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'get', fileID: this.rafterFileID})
    }).then((response) => response.blob()).then((blob) => {
      saveAs(blob, fdJson.name);
    }).catch(function (err) {
      console.log(err);
    });
  }

  rafterFileValidate() {
    let nub = document.getElementById('uploadButton');
    nub.style.display = 'none';
    console.log('i am validating');
    console.log(rafterFilePath.files);
    if (rafterFilePath.files.length === 0) {
      alert('no file was selected');
      return false;
    }
    for (let i = 0; i < rafterFilePath.files.length; i++) {
      let oInput = rafterFilePath.files[i];
      console.log(oInput.type);
    // the type is determined automatically during the creation of the Blob.
    // this value cannot be controlled by developer, hence cannot test it.
    /* istanbul ignore if*/
      if (oInput.type === 'text/plain' || oInput.type === 'text/html' || oInput.type === 'application/json') {
        //console.log('type is a plain text file');
        nub.style.display = 'block';
        return true;
      }
      alert('Sorry, ' + oInput.type + ' is an invalid file type.');
      return false;
    }
  }

  uploadRafterFile() {
    const httpClient = this.app.httpClient;
    const rui = this.rafterUserID;
    const fileName = rafterFilePath.files[0].name;
    const filePath = this.rafterFile.path;
    console.log(fileName);
    let cleanFileName = fileName.replace(/\s/g, '');
    cleanFileName = cleanFileName.replace(/!/g, '');
    async function loaded (evt) {
      console.log('in function loaded');
      console.log(evt.target);
      const fileString = evt.target.result;
      ulrf(fileString);
    }

    function errorHandler(evt) {
      alert('The file could not be read');
    }

    async function ulrf (fileString) {
      console.log('this is the file?');
      console.log(fileString);
      httpClient.fetch('/rafter/vs', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({token: localStorage.getItem('rafterToken'), userName: rui, command: 'create', rafterFile: {name: cleanFileName, path: filePath, content: fileString, createType: 'file'}})
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'test') {
            window.location.reload();
          }
        }).catch((err) => {
          console.log(err);
        });
    }

    this.reader.onload = loaded;
    this.reader.onerror = errorHandler;
    this.reader.readAsText(rafterFilePath.files[0]);
  }

  checkIfLoggedIn(cep, rlo, sli, cipr) {
    if (window.localStorage.getItem('rafterToken') !== null && window.localStorage.getItem('rafterToken') !== undefined) {
      let rtok = window.localStorage.getItem('rafterToken');
      try {
        let decoded = jwtDecode(rtok);
        let validToken;
        if (cep !== null && cep !== undefined) {
          validToken = cep(decoded);
        } else {
          validToken = this.rafterUser.checkExpired(decoded);
        }
        if (!validToken) {
          if (rlo !== null && rlo !== undefined) {
            rlo();
          } else {
            this.rafterUser.rafterLogout();
          }
        } else {
          if (sli !== null && sli !== undefined) {
            sli = false;
          } else {
            this.showLogin = false;
          }
        }
      } catch (err) {
        if (rlo !== null && rlo !== undefined) {
          rlo();
        } else {
          this.rafterUser.rafterLogout();
        }
      }
    } else {
      if (sli === null || sli === undefined) {
        sli = this.showLogin;
      }
      if (cipr !== null && cipr !== undefined) {
        cipr(sli);
      }
    }
  }

  validate() {
    let submitButton = document.getElementsByClassName('rafterLoginButton')[0];
    if (this.rafter.id !== '' && this.rafter.password !== '') {
      //console.log('enable the button!');
      //console.log(submitButton);
      submitButton.removeAttribute('disabled');
    } else {
      submitButton.setAttribute('disabled', '');
    }
  }

  postUSV() {
    this.app.httpClient.fetch('/rafter/rlogin', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.rafter)
    })
    .then((response) => response.json())
    .then((data) => {
      let data1 = data.replace(/&#34;/g, '');
      let token = data1.split('authorization_token: ')[1];
      token = token.split('}')[0];
      token = token.replace(/\r?\n|\r/g, '');
      //console.log(token);
      window.localStorage.setItem('rafterToken', token);
      //console.log(data);
      let rafterUser = data.split('&#34;user&#34;:')[1];
      rafterUser = rafterUser.split('}')[0];
      rafterUser = rafterUser + '}';
      rafterUser = rafterUser.replace(/&#34;/g, '"');
      //console.log(rafterUser);
      //console.log(JSON.parse(rafterUser));
      window.localStorage.setItem('rafterUser', rafterUser);
      this.rafterUserID = JSON.parse(rafterUser).id;
      document.getElementsByClassName('userServiceError')[0].innerHTML = '';
      this.initVol(token);
      this.activate();
    }).catch((err) => {
      //console.log(err);
      document.getElementsByClassName('userServiceError')[0].innerHTML = '<br>Wrong userid or password';
    });
  }

  initVol(mToken) {
    this.app.httpClient.fetch('/rafter/vsinit', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({token: mToken})
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      document.getElementsByClassName('rafterLogout')[0].style.display = 'block';
    }).catch((err) => {
      console.log(err);
    });
  }

  attached() {
    const cili = this.checkIfLoggedIn;
    const cep = this.rafterUser.checkExpired;
    const sli = this.showLogin;
    const rlo = this.rafterUser.rafterLogout;
    const cipr = this.rafterUser.checkIfPageReload;
    setInterval(function() {
      cili(cep, rlo, sli, cipr);
    }
    , 3400);

    let ruser = JSON.parse(localStorage.getItem('rafterUser'));
    //console.log(ruser.id);
    if (ruser !== null && ruser !== undefined) {
      this.rafterUserID = ruser.id;
      document.getElementsByClassName('rafterLogout')[0].style.display = 'block';
    }
  }

}
