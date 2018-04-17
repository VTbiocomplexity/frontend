import {inject} from 'aurelia-framework';
import {App} from '../app';
import { RafterUser } from '../classes/RafterUser';
import { RafterFileActions } from '../classes/RafterFileActions';
const jwtDecode = require('jwt-decode');
const TreeView = require('js-treeview');
//const FileSaver = require('file-saver');
@inject(App, FileReader)
export class Rafter {
  constructor(app, reader) {
    this.showLogin = true;
    this.reader = reader;
    this.app = app;
    this.rafterUserID = '';
    this.rafter = {id: '', secret: '', appName: ''};
    this.rafterFile = {name: '', createType: 'file', path: '', fileType: 'unspecified', rfid: ''};
    this.tv = null;
    this.homeDirJson = null;
    this.subDirJson = [];
    this.rafterFileID = '';
    this.appNames = [];
  }
  fileTypes = ['intersim-im-11-1_runoutput', 'intersim-im-11-1_runlog', 'GraphABM_rank', 'json', 'text', 'jsonh+fasta', 'png', 'jpg', 'pdf', 'xml', 'fasta'];

  async activate() {
    this.uid = this.app.auth.getTokenPayload().sub;
    this.user = await this.app.appState.getUser(this.uid);
    this.rafterUser = new RafterUser(this.app.httpClient);
    this.rafterFileActions = new RafterFileActions(this.app.httpClient);
    const cep = this.rafterUser.checkExpired;
    const rlo = this.rafterUser.rafterLogout;
    const cipr = this.rafterUser.checkIfPageReload;
    this.showLogin = this.checkIfLoggedIn(cep, rlo, this.showLogin, cipr);
    this.fileTypes.sort();
    this.fileTypes.splice(0, 0, 'unspecified');
    if (this.user.rafterApps !== undefined && this.user.rafterApps.length > 0 && sessionStorage.getItem('rafterToken') === null) {
      await this.handleRafterLogin('autoInitRafter');
    }
  }

  rafterAddApp() {
    this.showLogin = true;
  }

  async removeApp() {
    let appName = document.getElementById('appName2').value;
    console.log('going to remove: ' + appName);
    let myIndex = this.appNames.indexOf(appName);
    console.log(this.user.rafterApps[myIndex]);
    this.user.rafterApps.splice(myIndex, 1);
    console.log(this.user.rafterApps);
    await this.app.updateById('/user/', this.uid, this.user);
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'test') {
      window.location.reload();
    }
  }

  nevermind() {
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'test') {
      window.location.reload();
    }
  }

  setRafterUserId() {
    let rT = (sessionStorage.getItem('rafterToken'));
    if (rT !== null && rT !== undefined) {
      let rU = jwtDecode(rT);
      this.rafterUserID = rU.sub;
    }
  }

  async handleRafterLogin(option) {
    if (option === 'changeApp') {
      let selection = document.getElementById('appName').value;
      // console.log(selection);
      let myIndex = this.appNames.indexOf(selection);
      // console.log(myIndex);
      // console.log(this.user.rafterApps[myIndex]);
      this.rafter = {id: this.user.rafterApps[myIndex].r_app_id, secret: this.user.rafterApps[myIndex].r_app_secret, appName: this.user.rafterApps[myIndex].r_app_name};
    }
    if (option === 'autoInitRafter') {
      this.rafter = {id: this.user.rafterApps[0].r_app_id, secret: this.user.rafterApps[0].r_app_secret, appName: this.user.rafterApps[0].r_app_name};
    }
    await this.rafterUser.initRafter(this.rafterUserID, this.rafter, this.user._id, this.interval, this.showLogin);
    this.setRafterUserId();
  }

  hideDetail(ic1, ic2, content) {
    document.getElementsByClassName(content)[0].style.display = 'none';
    document.getElementsByClassName(ic1)[0].style.display = 'none';
    document.getElementsByClassName(ic2)[0].style.display = 'block';
  }

  showDetail(ic1, ic2, content) {
    document.getElementsByClassName(content)[0].style.display = 'block';
    document.getElementsByClassName(ic1)[0].style.display = 'block';
    document.getElementsByClassName(ic2)[0].style.display = 'none';
  }

  radioClicked() {
    if (document.getElementById('fileType2').checked) {
      this.rafterFile.createType = 'folder';
      document.getElementsByClassName('fileTypeSelector')[0].style.display = 'none';
    } else {
      this.rafterFile.createType = 'file';
      document.getElementsByClassName('fileTypeSelector')[0].style.display = 'block';
    }
  }

  displayTree(tv, nameArr, divId, showFile, hdj, raf, rvs, myApp, rui, mtws, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess) {
    let filesInFolder = null; //these are the files that are inside of a subfolder of the home dir
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
      if (foldersArr[j].domDiv.nextElementSibling !== null) {
        filesInFolder = foldersArr[j].domDiv.nextElementSibling;
      }
      //console.log(filesInFolder);
      //console.log(filesInFolder.getElementByClassName('tree-leaf'));
      foldersArr[j].domDiv.addEventListener('click', function(evt) {
        //console.log(evt);
        showFile(foldersArr[j].id, hdj, raf, rvs, myApp, rui, mtws, tv, showFile, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess);
      });
    }
    tv.on('select', function(evt) {
      console.log('i clicked the select event from tv');
      console.log(evt.data.id);
      showFile(evt.data.id, hdj, raf, rvs, myApp, rui, null, null, null, null, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess);
    });
    if (filesInFolder === null) {
      return console.log('no files inside this subfolder');
    }
    makeFilesClickable(filesInFolder, showFile, raf, rvs, myApp, rui, subDirFiles, mnj, makeFilesClickable, mtws, tv, displayTree, vsFetch, vsFetchSuccess);
  }

  makeFilesClickable(filesInFolder, showFile, raf, rvs, myApp, rui, subDirFiles, mnj, makeFilesClickable, mtws, tv, displayTree, vsFetch, vsFetchSuccess) {
    console.log('refactoring here');
    let fif = filesInFolder.getElementsByClassName('tree-leaf');
    let insideFolderDetails = document.getElementsByClassName('subDirContent')[0].innerHTML;
    let allData = JSON.parse(insideFolderDetails);
    let fileID, fileIDsJson;
    console.log('find a folder');
    //console.log(fif);
    for (let k = 0; k < fif.length; k++) {
      fileID = fif[k].getElementsByClassName('tree-leaf-content')[0];
      fileIDsJson = fileID.getAttribute('data-item');
      let fileIDJson = JSON.parse(fileIDsJson);
      //console.log(fileIDJson.isContainer);
      fif[k].addEventListener('click', function(evt) {
        //console.log('I clicked the file inside sub folder');
        if (!fileIDJson.isContainer) {
          showFile(fileIDJson.id, allData, raf, rvs, myApp, rui, mtws, tv, showFile, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess);
        } else {
          console.log('got me a sub sub folder');
          document.getElementsByClassName('fileActions')[0].style.display = 'none';
          console.log(fileIDJson);
          document.getElementsByClassName('folderName')[0].innerHTML = fileIDJson.name;
          document.getElementsByClassName('createNew')[0].style.display = 'none';
          raf.rfid = fileIDJson.id;
          //refresh the inside Folder Details
          //hide the file actions (display, download, delete)
          //tree view opens with sub sub folder content
          document.getElementsByClassName('displayFileContent')[0].innerHTML = ''; //this is incase someone clicked view button on a file
          document.getElementsByClassName('subDirContent')[0].innerHTML = '';
          rvs('ls', myApp, rui, raf, mtws, null, null, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess);
          // const dnldbt = document.getElementsByClassName('dnldButton')[0];
          // const dfcbt = document.getElementsByClassName('displayButton')[0];
          // dnldbt.style.display = 'none';
          // dfcbt.style.display = 'none';
        }
      });
    }
  }

  showFileDetails(id, hdj, raf, rvs, myApp, rui, mtws = null, tv, showFile, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess) {
    document.getElementsByClassName('displayFileContent')[0].innerHTML = '';
    const dnldbt = document.getElementsByClassName('dnldButton')[0];
    const dfcbt = document.getElementsByClassName('displayButton')[0];
    dnldbt.style.display = 'none';
    dfcbt.style.display = 'none';
    //console.log('going to display the file details now');
    //console.log(id);
    //console.log('is this a sub directory?');
    document.getElementsByClassName('fileActions')[0].style.display = 'block';
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
    for (let i = 0; i < hdj.length; i++) {
      if (id === hdj[i].id) {
        document.getElementsByClassName('homeDirContent')[0].innerHTML = JSON.stringify(hdj[i]);
        //console.log(hdj[i].isContainer);
        if (hdj[i].isContainer) {
          //console.log('I found a folder');
          document.getElementsByClassName('fileActions')[0].style.display = 'none';
          document.getElementsByClassName('folderName')[0].innerHTML = hdj[i].name;
          raf.path = '/' + hdj[i].name;
          //console.log('line 86?');
          return rvs('ls', myApp, rui, raf, mtws, hdj[i].id, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess);
        }
        //set Filename
        //console.log(hdj[i].state);
        document.getElementsByClassName('dnldButton')[0].innerHTML = ('Download<br>' + hdj[i].name);
        document.getElementsByClassName('deleteButton')[0].innerHTML = ('Delete<br>' + hdj[i].name);
        document.getElementsByClassName('displayButton')[0].innerHTML = ('Display<br>' + hdj[i].name);
        if (hdj[i].state !== 'empty') {
          dnldbt.style.display = 'block';
          dfcbt.style.display = 'block';
        }
        return;
      }
    }
    if (subDirFiles !== null && subDirFiles !== undefined) {
      for (let j = 0; j < subDirFiles.length; j++) {
        if (id === subDirFiles[j].id) {
          //console.log('i found a match!');
          document.getElementsByClassName('dnldButton')[0].innerHTML = ('Download<br>' + subDirFiles[j].name);
          document.getElementsByClassName('deleteButton')[0].innerHTML = ('Delete<br>' + subDirFiles[j].name);
          document.getElementsByClassName('displayButton')[0].innerHTML = ('Display<br>' + subDirFiles[j].name);
          if (subDirFiles[j].state !== 'empty') {
            dnldbt.style.display = 'block';
            dfcbt.style.display = 'block';
          }
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
    this.displayTree(this.tv, nameArr, 'treeView', this.showFileDetails, this.homeDirJson, this.rafterFile, this.rafterVolumeService, this.app, this.rafterUserID, this.makeTreeWithSub, this.displayTree, this.subDirJson, this.makeNewJson, this.makeFilesClickable, this.vsFetch, this.vsFetchSuccess);
  }

  async makeTreeWithSub(data, hdjId, hdj, tv, showFile, raf, rvs, myApp, rui, mtws, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess) {
    let childArr = mnj(data);
    for (let i = 0; i < tv.data.length; i++) {
      if (hdjId === tv.data[i].id) {
        tv.data[i].children = childArr;
      }
    }
    let newData = tv.data;
    await displayTree(tv, newData, 'treeView', showFile, hdj, raf, rvs, myApp, rui, mtws, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess);
    tv.expandAll();
  }

  async navHomeDir() {
    let hdc = JSON.stringify(this.homeDirJson);
    this.rafterFile.path = '';
    document.getElementsByClassName('folderName')[0].innerHTML = 'home/' + this.rafterUserID;
    document.getElementsByClassName('insideFolderDetails')[0].style.display = 'block';
    document.getElementsByClassName('subDirContent')[0].innerHTML = hdc;
    document.getElementsByClassName('fileActions')[0].style.display = 'none';
    document.getElementsByClassName('fileDetailsTitle')[0].style.display = 'none';
    document.getElementsByClassName('homeDirContent')[0].innerHTML = '';
    document.getElementsByClassName('createNew')[0].style.display = 'block';
    document.getElementsByClassName('isHomeDir')[0].style.display = 'block';
    document.getElementsByClassName('isHomeDir')[1].style.display = 'block';
    await this.fetchVS('ls');
  }

  async fetchVS(cmd) {
    if (this.rafterFile.createType !== 'folder') {
      this.rafterFile.createType = 'file';
    }
    this.rafterFile.name = this.rafterFile.name.replace(/\s/g, '');
    this.rafterFile.name = this.rafterFile.name.replace(/!/g, '');
    if (this.rafterFile.name === '' && cmd === 'create') {
      this.rafterFile.name = 'unspecified';
    }
    await this.vsFetch(this.vsFetchSuccess, this.app, this.rafterUserID, cmd, this.rafterFile, false);
  }

  async vsFetch(vsFetchSuccess, myApp, rafterUserID, cmd, myRafterFile, fromSubDir, mtws, hdjId, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch) {
    return await myApp.httpClient.fetch('/rafter/vs', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({token: sessionStorage.getItem('rafterToken'), userName: rafterUserID, command: cmd, rafterFile: myRafterFile})
    })
  .then(function(response) { return response.json();}).then((data) => {
    if (data.message !== null && data.message !== '' && data.message !== undefined) {
      return document.getElementsByClassName('userServiceError')[0].innerHTML = data.message;
    }
    document.getElementsByClassName('userServiceError')[0].innerHTML = '';
    document.getElementsByClassName('showHideHD')[0].style.display = 'block';
    document.getElementsByClassName('rafterCheckHome')[0].style.display = 'none';
    if (fromSubDir) {
      return vsFetchSuccess(data, vsFetchSuccess, myApp, rafterUserID, cmd, myRafterFile, fromSubDir, mtws, hdjId, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch);
    }
    if (cmd === 'ls') {
      this.homeDirJson = data;
      this.makeTree(data);
    } else {
      myRafterFile = {name: '', createType: 'file', path: '', fileType: 'unspecified', rfid: ''};
      this.navHomeDir();
    }
  }).catch(function (err) {
    console.log('this is the error');
    console.log(err);
    if (err.status === 500) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'test') {
        window.location.reload();
      }
    }
  });
  }

  vsFetchSuccess(data, vsFetchSuccess, myApp, rafterUserID, cmd, myRafterFile, fromSubDir, mtws, hdjId, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch) {
    document.getElementsByClassName('subDirContent')[0].innerHTML = JSON.stringify(data);
    subDirFiles.push.apply(subDirFiles, data);
    mtws(data, hdjId, hdj, tv, showFile, myRafterFile, rvs, myApp, rafterUserID, mtws, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess);
  }

  rafterVolumeService(cmd, myApp, rafterUserID, myRafterFile, mtws, hdjId, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess) {
    if (myRafterFile.rfid !== '') {
      console.log('new request by id detected');
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'test') {
        return window.location.reload();
      }
    }
    vsFetch(vsFetchSuccess, myApp, rafterUserID, cmd, myRafterFile, true, mtws, hdjId, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch);
  }

  // fileDelete() {
  //   let fileDetails = document.getElementsByClassName('homeDirContent')[0].innerHTML;
  //   let fdJson = JSON.parse(fileDetails);
  //   this.rafterFileID = fdJson.id;
  //   this.app.httpClient.fetch('/rafter/vs', { method: 'post', headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({command: 'remove', fileID: this.rafterFileID})
  //   }).then((response) => response.json()).then((data) => {
  //     if (data) {
  //     /* istanbul ignore if */
  //       if (process.env.NODE_ENV !== 'test') {
  //         window.location.reload();
  //       }
  //     }
  //   }).catch(function (err) {
  //     console.log(err);
  //   });
  // }

  // fileDownload() {
  //   let fileDetails = document.getElementsByClassName('homeDirContent')[0].innerHTML;
  //   console.log(fileDetails);
  //   let fdJson = JSON.parse(fileDetails);
  //   this.rafterFileID = fdJson.id;
  //   this.app.httpClient.fetch('/rafter/vs', { method: 'post', headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ command: 'get', fileID: this.rafterFileID})
  //   }).then((response) => response.blob()).then((blob) => {
  //     console.log(blob);
  //     FileSaver.saveAs(blob, fdJson.name);
  //   }).catch(function (err) {
  //     console.log(err);
  //   });
  // }

  // fileDisplay() {
  //   let fileDetails = document.getElementsByClassName('homeDirContent')[0].innerHTML;
  //   let fdJson = JSON.parse(fileDetails);
  //   this.rafterFileID = fdJson.id;
  //   this.app.httpClient.fetch('/rafter/vs', { method: 'post', headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ command: 'get', fileID: this.rafterFileID})
  //   }).then((response) => response.blob()).then((blob) => {
  //     console.log(blob);
  //     async function loaded (evt) {
  //       console.log('in function loaded');
  //       console.log(evt.target);
  //       const fileString = evt.target.result;
  //       console.log(fileString);
  //       document.getElementsByClassName('displayFileContent')[0].innerHTML = fileString;
  //     }
  // /* istanbul ignore next */
  //     function errorHandler(evt) {
  //       alert('The file could not be read');
  //     }
  //     this.reader.onload = loaded;
  //     this.reader.onerror = errorHandler;
  //     this.reader.readAsText(blob);
  // //console.log(fileContents);
  //   }).catch(function (err) {
  //     console.log(err);
  //   });
  // }

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
        body: JSON.stringify({token: sessionStorage.getItem('rafterToken'), userName: rui, command: 'create', rafterFile: {name: cleanFileName, path: filePath, content: fileString, createType: 'file'}})
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
    if (window.sessionStorage.getItem('rafterToken') !== null && window.sessionStorage.getItem('rafterToken') !== undefined) {
      let rtok = window.sessionStorage.getItem('rafterToken');
      try {
        let decoded = jwtDecode(rtok);
        let validToken;
        validToken = cep(decoded);
        if (!validToken) {
          rlo();
          return true;
        }  return false;
      } catch (err) {
        rlo();
        return true;
      }
    } else {
      cipr(sli);
      return true;
    }
  }

  validate() {
    let submitButton = document.getElementsByClassName('rafterLoginButton')[0];
    if (this.rafter.id !== '' && this.rafter.secret !== '' && this.rafter.appName !== '') {
      submitButton.removeAttribute('disabled');
    } else {
      submitButton.setAttribute('disabled', '');
    }
  }

  async attached() {
    const cili = this.checkIfLoggedIn;
    const cep = this.rafterUser.checkExpired;
    const sli = this.showLogin;
    const rlo = this.rafterUser.rafterLogout;
    const cipr = this.rafterUser.checkIfPageReload;
    this.interval = setInterval(function() {
      cili(cep, rlo, sli, cipr);
    }
  , 3400);
    let rT = (sessionStorage.getItem('rafterToken'));
    if (rT !== null && rT !== undefined) {
      this.setRafterUserId();
      document.getElementsByClassName('rafterAddApp')[0].style.display = 'block';
      document.getElementsByClassName('rafterCheckHome')[0].style.display = 'block';
    // console.log('this is the rafterApps');
    // console.log(this.user.rafterApps);
      if (this.user.rafterApps !== undefined && this.user.rafterApps.length > 1) {
        for (let i = 0; i < this.user.rafterApps.length; i++) {
          this.appNames.push(this.user.rafterApps[i].r_app_name);
        }
        document.getElementsByClassName('appSelector')[0].style.display = 'block';
        document.getElementsByClassName('appSelector')[1].style.display = 'block';
      }
      await this.rafterUser.initVol(rT);
    }
  }

}
