import {inject} from 'aurelia-framework';
import {App} from '../app';
import { RafterUser } from '../classes/RafterUser';
import { RafterFileActions } from '../classes/RafterFileActions';
const jwtDecode = require('jwt-decode');
const TreeView = require('js-treeview');
@inject(App)
export class Rafter {
  constructor(app) {
    this.showLogin = true;
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

  radioClicked() {
    if (document.getElementById('fileType2').checked) {
      this.rafterFile.createType = 'folder';
      document.getElementsByClassName('fileTypeSelector')[0].style.display = 'none';
    } else {
      this.rafterFile.createType = 'file';
      document.getElementsByClassName('fileTypeSelector')[0].style.display = 'block';
    }
  }

  displayTree(tv, nameArr, divId, showFile, hdj, raf, rvs, myApp, rui, mtws, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions) {
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
        showFile(foldersArr[j].id, hdj, raf, rvs, myApp, rui, mtws, tv, showFile, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions);
      });
    }
    tv.on('select', function(evt) {
      console.log('i clicked the select event from tv');
      console.log(evt.data.id);
      showFile(evt.data.id, hdj, raf, rvs, myApp, rui, null, null, null, null, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions);
    });
    if (filesInFolder === null) {
      return console.log('no files inside this subfolder');
    }
    makeFilesClickable(filesInFolder, showFile, raf, rvs, myApp, rui, subDirFiles, mnj, makeFilesClickable, mtws, tv, displayTree, vsFetch, vsFetchSuccess, rafterFileActions);
  }

  makeFilesClickable(filesInFolder, showFile, raf, rvs, myApp, rui, subDirFiles, mnj, makeFilesClickable, mtws, tv, displayTree, vsFetch, vsFetchSuccess, rafterFileActions) {
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
          showFile(fileIDJson.id, allData, raf, rvs, myApp, rui, mtws, tv, showFile, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions);
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
          rvs('ls', myApp, rui, raf, mtws, null, null, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions);
          // const dnldbt = document.getElementsByClassName('dnldButton')[0];
          // const dfcbt = document.getElementsByClassName('displayButton')[0];
          // dnldbt.style.display = 'none';
          // dfcbt.style.display = 'none';
        }
      });
    }
  }

  showFileDetails(id, hdj, raf, rvs, myApp, rui, mtws = null, tv, showFile, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions) {
    // document.getElementsByClassName('displayFileContent')[0].innerHTML = '';
    const dnldbt = document.getElementsByClassName('dnldButton')[0];
    const dfcbt = document.getElementsByClassName('displayButton')[0];
    // dnldbt.style.display = 'none';
    // dfcbt.style.display = 'none';
    // //console.log('going to display the file details now');
    // //console.log(id);
    // //console.log('is this a sub directory?');
    // document.getElementsByClassName('fileActions')[0].style.display = 'block';
    // document.getElementsByClassName('fileDetailsTitle')[0].style.display = 'block';
    // let ifd = document.getElementsByClassName('insideFolderDetails')[0];
    // if (mtws === null) {
    //   ifd.style.display = 'none';
    //   document.getElementsByClassName('createNew')[0].style.display = 'none';
    // } else {
    //   ifd.style.display = 'block';
    //   document.getElementsByClassName('isHomeDir')[0].style.display = 'none';
    //   document.getElementsByClassName('isHomeDir')[1].style.display = 'none';
    //   document.getElementsByClassName('createNew')[0].style.display = 'block';
    // }
    rafterFileActions.resetFileActions(mtws, dnldbt, dfcbt);
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
          return rvs('ls', myApp, rui, raf, mtws, hdj[i].id, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions);
        }
        return rafterFileActions.fileNameState(hdj[i], dnldbt, dfcbt);
        //set Filename
        //console.log(hdj[i].state);
        // document.getElementsByClassName('dnldButton')[0].innerHTML = ('Download<br>' + hdj[i].name);
        // document.getElementsByClassName('deleteButton')[0].innerHTML = ('Delete<br>' + hdj[i].name);
        // document.getElementsByClassName('displayButton')[0].innerHTML = ('Display<br>' + hdj[i].name);
        // if (hdj[i].state !== 'empty') {
        //   dnldbt.style.display = 'block';
        //   dfcbt.style.display = 'block';
        // }
        //return;
      }
    }
    if (subDirFiles !== null && subDirFiles !== undefined) {
      rafterFileActions.setFileActions(id, subDirFiles, dnldbt, dfcbt);
    }
    // if (subDirFiles !== null && subDirFiles !== undefined) {
    //   for (let j = 0; j < subDirFiles.length; j++) {
    //     if (id === subDirFiles[j].id) {
    //       //console.log('i found a match!');
    //       document.getElementsByClassName('dnldButton')[0].innerHTML = ('Download<br>' + subDirFiles[j].name);
    //       document.getElementsByClassName('deleteButton')[0].innerHTML = ('Delete<br>' + subDirFiles[j].name);
    //       document.getElementsByClassName('displayButton')[0].innerHTML = ('Display<br>' + subDirFiles[j].name);
    //       if (subDirFiles[j].state !== 'empty') {
    //         dnldbt.style.display = 'block';
    //         dfcbt.style.display = 'block';
    //       }
    //       return document.getElementsByClassName('homeDirContent')[0].innerHTML = JSON.stringify(subDirFiles[j]);
    //     }
    //   }
    // }
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
    this.displayTree(this.tv, nameArr, 'treeView', this.showFileDetails, this.homeDirJson, this.rafterFile, this.rafterVolumeService, this.app, this.rafterUserID, this.makeTreeWithSub, this.displayTree, this.subDirJson, this.makeNewJson, this.makeFilesClickable, this.vsFetch, this.vsFetchSuccess, this.rafterFileActions);
  }

  async makeTreeWithSub(data, hdjId, hdj, tv, showFile, raf, rvs, myApp, rui, mtws, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions) {
    let childArr = mnj(data);
    for (let i = 0; i < tv.data.length; i++) {
      if (hdjId === tv.data[i].id) {
        tv.data[i].children = childArr;
      }
    }
    let newData = tv.data;
    await displayTree(tv, newData, 'treeView', showFile, hdj, raf, rvs, myApp, rui, mtws, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions);
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

  async vsFetch(vsFetchSuccess, myApp, rafterUserID, cmd, myRafterFile, fromSubDir, mtws, hdjId, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, rafterFileActions) {
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
      return vsFetchSuccess(data, vsFetchSuccess, myApp, rafterUserID, cmd, myRafterFile, fromSubDir, mtws, hdjId, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, rafterFileActions);
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

  vsFetchSuccess(data, vsFetchSuccess, myApp, rafterUserID, cmd, myRafterFile, fromSubDir, mtws, hdjId, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, rafterFileActions) {
    document.getElementsByClassName('subDirContent')[0].innerHTML = JSON.stringify(data);
    subDirFiles.push.apply(subDirFiles, data);
    mtws(data, hdjId, hdj, tv, showFile, myRafterFile, rvs, myApp, rafterUserID, mtws, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions);
  }

  rafterVolumeService(cmd, myApp, rafterUserID, myRafterFile, mtws, hdjId, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions) {
    if (myRafterFile.rfid !== '') {
      console.log('new request by id detected');
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'test') {
        return window.location.reload();
      }
    }
    vsFetch(vsFetchSuccess, myApp, rafterUserID, cmd, myRafterFile, true, mtws, hdjId, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, rafterFileActions);
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
