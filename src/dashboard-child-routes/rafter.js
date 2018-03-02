import {inject} from 'aurelia-framework';
import {App} from '../app';
const jwtDecode = require('jwt-decode');
const TreeView = require('js-treeview');
//import {json} from 'aurelia-fetch-client';
//import {VolumeService} from 'rafter';
@inject(App)
export class Rafter {
  constructor(app) {
    this.showLogin = true;
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
    this.checkIfLoggedIn();
  }

  radioClicked() {
    if (document.getElementById('fileType2').checked) {
      this.rafterFile.createType = 'folder';
    } else {
      this.rafterFile.createType = 'file';
    }
    //console.log(this.rafterFile.createType);
  }

  displayTree(tv, nameArr, divId, showFile, hdj, raf, rvs, myApp, rui, mtws, displayTree, subDirFiles) {
    //console.log('display tree');
    let filesInFolder;
    let insideFolderDetails;
    let allData = [];
    tv = new TreeView(nameArr, divId);
    //console.log('do i have sub dir files here?');
    //console.log(subDirFiles);
    //console.log('this is the tree view object');
    //console.log(tv);
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
        showFile(foldersArr[j].id, hdj, raf, rvs, myApp, rui, mtws, tv, showFile, displayTree, subDirFiles);
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
        //console.log(fif[k].innerHTML);
        //console.log(fileIDJson);
        //console.log(subDirFiles);
        showFile(fileIDJson.id, allData, raf, rvs, myApp, rui, null, null, null, null, subDirFiles);
        //mtws();
      });
    }
    tv.on('select', function(evt) {
      console.log('i clicked the select event from tv');
      console.log(evt.data.id);
      showFile(evt.data.id, hdj, raf, rvs, myApp, rui, null, null, null, null, subDirFiles);
    });
    // let treeViewDiv = document.getElementById('treeView');
    // treeViewDiv.innerHTML = '<div class="homeDirLink"><a id="homeDirClicker">home/JoshuaVSherman</a></div>' + treeViewDiv.innerHTML;
  }

  navHomeDir() {
    console.log('you clicked me');
    let hdc = JSON.stringify(this.homeDirJson);
    this.rafterFile.path = '';
    document.getElementsByClassName('folderName')[0].innerHTML = 'home/' + this.rafterUserID;
    document.getElementsByClassName('insideFolderDetails')[0].style.display = 'block';
    document.getElementsByClassName('subDirContent')[0].innerHTML = hdc;
    document.getElementsByClassName('fileDetailsTitle')[0].style.display = 'none';
    document.getElementsByClassName('homeDirContent')[0].innerHTML = '';
    document.getElementsByClassName('createNew')[0].style.display = 'block';
    document.getElementsByClassName('isHomeDir')[0].style.display = 'block';
    document.getElementsByClassName('isHomeDir')[1].style.display = 'block';
    this.rafterVolumeService('ls');
    //display the file details for the home/JoshuaVSherman folder
  }

  showFileDetails(id, hdj, raf, rvs, myApp, rui, mtws = null, tv, showFile, displayTree, subDirFiles) {
    console.log('going to display the file details now');
    console.log(id);
    console.log('is this a sub directory?');
    //console.log(subDirFiles);
    document.getElementsByClassName('fileDetailsTitle')[0].style.display = 'block';
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
    // if (subDirFiles === null || subDirFiles === undefined) {
    console.log('line 160');
    for (let i = 0; i < hdj.length; i++) {
      if (id === hdj[i].id) {
        //console.log(hdj[i].isContainer);
        if (hdj[i].isContainer) {
          //console.log('I found a folder');
          document.getElementsByClassName('folderName')[0].innerHTML = hdj[i].name;
          raf.path = '/' + hdj[i].name;
          //console.log('line 86?');
          rvs('ls', myApp, rui, raf, mtws, hdj[i].id, hdj, tv, showFile, rvs, displayTree, subDirFiles);
        }
        return document.getElementsByClassName('homeDirContent')[0].innerHTML = JSON.stringify(hdj[i]);
      }
    }
    // }
    console.log('line 175');
    if (subDirFiles !== null && subDirFiles !== undefined) {
      console.log('line 177');
      for (let j = 0; j < subDirFiles.length; j++) {
        //console.log(subDirFiles[0]);
        if (id === subDirFiles[j].id) {
          console.log('i found a match!');
          return document.getElementsByClassName('homeDirContent')[0].innerHTML = JSON.stringify(subDirFiles[j]);
        }
      }
    }
  }

  makeTree(data) {
    console.log('make tree');
    //console.log('this is the data for tree');
    //console.log(data);
    let nameArr = [];
    let nameObj = {};
    for (let i = 0; i < data.length; i++) {
      nameObj = {name: data[i].name, id: data[i].id, type: data[i].type, isContainer: data[i].isContainer, children: []};
      nameArr.push(nameObj);
    }
    console.log(nameArr);
    this.displayTree(this.tv, nameArr, 'treeView', this.showFileDetails, this.homeDirJson, this.rafterFile, this.rafterVolumeService, this.app, this.rafterUserID, this.makeTreeWithSub, this.displayTree, this.subDirJson);
  }

  async makeTreeWithSub(data, hdjId, hdj, tv, showFile, raf, rvs, myApp, rui, mtws, displayTree, subDirFiles) {
    //console.log(subDirFiles);
    let childObj = {};
    let childArr = [];
    for (let c = 0; c < data.length; c++) {
      childObj = {name: data[c].name, id: data[c].id, type: data[c].type, isContainer: data[c].isContainer, children: []};
      childArr.push(childObj);
    }
    for (let i = 0; i < tv.data.length; i++) {
      if (hdjId === tv.data[i].id) {
        //console.log(tv.data[i]);
        tv.data[i].children = childArr;
      }
    }
    //tv.data[2].children = [{name: 'yoo', id: '243', type: 'unspecified', isContainer: false, children: []}];
    let newData = tv.data;
    await displayTree(tv, newData, 'treeView', showFile, hdj, raf, rvs, myApp, rui, mtws, displayTree, subDirFiles);
    tv.expandAll();
    //tv = new TreeView(newData, 'treeView');
  }

  rafterVolumeService(cmd, myApp = null, rui = null, raf = null, mtws = null, hdjId = null, hdj = null, tv = null, showFile = null, rvs = null, displayTree = null, subDirFiles = null) {
    document.getElementsByClassName('userServiceError')[0].innerHTML = '';
    document.getElementsByClassName('showHideHD')[0].style.display = 'block';
    document.getElementsByClassName('rafterCheckHome')[0].style.display = 'none';
    //console.log('i am in rafterVolumeService function');
    // if (subDirFiles === null) {
    //   subDirFiles = this.subDirJson;
    // }
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
    myApp.httpClient.fetch('/rafter/vs', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({token: localStorage.getItem('rafterToken'), userName: rui, command: cmd, rafterFile: raf})
    })
    .then((response) => response.json())
    .then((data) => {
      //console.log(data);
      if (cmd === 'ls') {
        if (raf.path === '') {
          //document.getElementsByClassName('homeDirContent')[0].innerHTML = JSON.stringify(data);
          this.homeDirJson = data;
          //console.log(this.homeDirJson);
          return this.makeTree(data);
        }
        //console.log('I want to display the contents of a subdirectory now');
        //console.log(data);
        document.getElementsByClassName('subDirContent')[0].innerHTML = JSON.stringify(data);
        /* istanbul ignore else */
        if (subDirFiles.indexOf(data) === -1) {
          subDirFiles.push.apply(subDirFiles, data);
          console.log(subDirFiles);
        }
        //console.log(mtws);
        return mtws(data, hdjId, hdj, tv, showFile, raf, rvs, myApp, rui, mtws, displayTree, subDirFiles);
        //return mtws(data, hdjId, hdj, tv);
      } else if (data.message !== null && data.message !== '' && data.message !== undefined) {
        //let errorMessage = JSON.parse(data.message);
        //console.log(data.message);
        return document.getElementsByClassName('userServiceError')[0].innerHTML = data.message;
      } else if (cmd === 'create') {
        console.log('did I create a new file?');
        this.rafterFile = {name: '', createType: '', path: ''};
        this.rafterVolumeService('ls');
        this.navHomeDir();
      }
    }).catch(function (err) {
      if (cmd !== 'ls') {
        return console.log(err);
      }
    }).then((message) => {
      //console.log(message);
      /* istanbul ignore if */
      if (message !== null && message !== undefined) {
        document.getElementsByClassName('userServiceError')[0].innerHTML = message.error;
      }
    });
    //console.log(err);
    //document.getElementsByClassName('userServiceError')[0].innerHTML = 'Wrong userid or password';
    // });
  }

  rafterLogout() {
    //console.log('going to log you out');
    localStorage.removeItem('rafterToken');
    localStorage.removeItem('rafterUser');
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'test') {
      //console.log('is this a test?');
      window.location.reload();
    }
  }

  checkIfLoggedIn(cep, rlo, sli) {
    if (window.localStorage.getItem('rafterToken') !== null && window.localStorage.getItem('rafterToken') !== undefined) {
      //console.log('howdy rafter user');
      let rtok = window.localStorage.getItem('rafterToken');
      //this.rafterUserID = JSON.parse(localStorage.getItem('rafterUser')).id;
      //this.rafterUserID = localStorage.getItem('rafterUser')
      //console.log(rtok);
      try {
        let decoded = jwtDecode(rtok);
        //console.log(decoded);
        let validToken;
        if (cep !== null && cep !== undefined) {
          validToken = cep(decoded);
          //console.log(validToken);
        } else {
          validToken = this.checkExpired(decoded);
        }
        if (!validToken) {
          console.log('your token is bad, logging you out!');
          if (rlo !== null && rlo !== undefined) {
            rlo();
          } else {
            this.rafterLogout();
          }
        } else {
          if (sli !== null && sli !== undefined) {
            sli = false;
          } else {
            this.showLogin = false;
          }
        }
      } catch (err) {
        // The token is invalid
        //console.log(err);
        //console.log('your token is bad, logging you out!');
        if (rlo !== null && rlo !== undefined) {
          rlo();
        } else {
          this.rafterLogout();
        }
      }
    } else {
      //console.log('you our not logged in');
      if (sli !== null && sli !== undefined) {
        sli = true;
      } else {
        this.showLogin = true;
      }
    }
  }

  checkExpired(decoded) {
    let d = new Date();
    let checkd = d.valueOf() / 1000;
    //console.log(checkd);
    if (checkd > decoded.exp) {
      //console.log('expired');
      return false;
    } return true;
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
      this.initVol(token);
      this.activate();
    }).catch((err) => {
      //console.log(err);
      document.getElementsByClassName('userServiceError')[0].innerHTML = 'Wrong userid or password';
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
      //console.log(data);
    }).catch((err) => {
      //console.log(err);
    });
  }

  attached() {
    const cili = this.checkIfLoggedIn;
    const cep = this.checkExpired;
    const sli = this.showLogin;
    const rlo = this.rafterLogout;
    setInterval(function() {
      cili(cep, rlo, sli);
    }
    , 5400);

    let ruser = JSON.parse(localStorage.getItem('rafterUser'));
    //console.log(ruser.id);
    if (ruser !== null && ruser !== undefined) {
      this.rafterUserID = ruser.id;
    }
  }

}
