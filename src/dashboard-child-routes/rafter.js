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
    sessionStorage.removeItem('parentId');
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
  rafterAddApp() {this.showLogin = true;}
  async removeApp() {
    let appName = document.getElementById('appName2').value;
    //console.log('going to remove: ' + appName);
    let myIndex = this.appNames.indexOf(appName);
    //console.log(this.user.rafterApps[myIndex]);
    this.user.rafterApps.splice(myIndex, 1);
    //console.log(this.user.rafterApps);
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
      //let folderJson = JSON.parse(document.getElementsByClassName('homeDirContent')[0].innerHTML);
      //console.log(folderJson.id);
      //this.rafterFile.rfid = folderJson.id;
      console.log(this.rafterFile);
    } else {
      this.rafterFile.createType = 'file';
      document.getElementsByClassName('fileTypeSelector')[0].style.display = 'block';
    }
  }
  displayTree(tv, nameArr, divId, showFile, hdj, raf, rvs, myApp, rui, mtws, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles) {
    let filesInFolder = null; //these are the files that are inside of a subfolder of the home dir
    tv = new TreeView(nameArr, divId);
    //if (subSubDirFiles !== null && subSubDirFiles !== undefined) {
    //console.log(subSubDirFiles);
    //console.log(childArr);
    //find a sub sub folder
    //let subDirIds = [];
    // if (childArr !== undefined) {
    //   for (let i = 0; i < childArr.length; i++) {
    //     if (childArr[i].isContainer) {
    //       //console.log(childArr[i]);
    //       subDirIds.push(childArr[i].id);
    //       //console.log(subDirIds);
    //     }
    //   }
    // }
      //console.log('add click events for the files inside of subsubfolder');
      //tv = new TreeView(newData, 'treeView');
      //return tv.expandAll();
    //}
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
        //do not add sub sub folders
        // if (subSubDirFiles !== undefined && subSubDirFiles !== null) {
        //   //console.log('line 113');
        //   if (subSubDirFiles[0].container_id !== treeNodeObj.id) {
        //     console.log('line 115');
        //     foldersArr.push({id: treeNodeObj.id, domDiv: getTreeLeaves[i]});
        //   }
        // } else {
        //   console.log('line 119');
        //do not add sub sub folders
        //for (let z = 0; z < subDirIds.length; z++) {
        //if (subDirIds.indexOf(treeNodeObj.id) === -1) {
        foldersArr.push({id: treeNodeObj.id, domDiv: getTreeLeaves[i]});
        //}
        //console.log(subDirIds.indexOf(treeNodeObj.id));
        // }
      }
    }
    //subSubDirFiles = null;
    //console.log(foldersArr);
    // make folders clickable
    for (let j = 0; j < foldersArr.length; j++) {
      //console.log(foldersArr[j]);
      //console.log('find a match for subsubfolder');
      //console.log(foldersArr[j].id);
      //console.log(raf.rfid);
      //if (raf.rfid !== foldersArr[j].id) {
      foldersArr[j].domDiv.addEventListener('click', function(evt) {
          //console.log(evt);
        showFile(foldersArr[j].id, null, raf, rvs, myApp, rui, mtws, tv, showFile, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles, hdj);
      });
      if (foldersArr[j].domDiv.nextElementSibling !== null) {
        filesInFolder = foldersArr[j].domDiv.nextElementSibling;
          //console.log(filesInFolder);
      }
      //}
      //console.log(filesInFolder);
      //console.log(filesInFolder.getElementByClassName('tree-leaf'));
    }
    //if (subSubDirFiles === null) {
    //home directory click event is here
    tv.on('select', function(evt) {
      //console.log('i clicked the select event from tv');
        //console.log(evt.data.id);
      showFile(evt.data.id, null, raf, rvs, myApp, rui, null, null, null, null, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles, hdj);
    });
    //}
    if (filesInFolder === null) {
      //return console.log('no files inside this subfolder');
    }
    makeFilesClickable(filesInFolder, showFile, raf, rvs, myApp, rui, subDirFiles, mnj, makeFilesClickable, mtws, tv, displayTree, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles, hdj);
  }
  makeFilesClickable(filesInFolder, showFile, raf, rvs, myApp, rui, subDirFiles, mnj, makeFilesClickable, mtws, tv, displayTree, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles, hdj) {
    //console.log(subSubDirFiles);
    if (filesInFolder === null) {
      return;
    }
    let fif = filesInFolder.getElementsByClassName('tree-leaf');
    let insideFolderDetails = document.getElementsByClassName('subDirContent')[0].innerHTML;
    //insideFolderDetails.innerHTML = '';
    let allData = JSON.parse(insideFolderDetails);
    //console.log(allData);
    let fileID, fileIDsJson;
    //console.log('find a folder');
    //console.log(fif);
    let matchFile = false;
    for (let k = 0; k < fif.length; k++) {
      //console.log(fif[k]);
      fileID = fif[k].getElementsByClassName('tree-leaf-content')[0];
      fileIDsJson = fileID.getAttribute('data-item');
      let fileIDJson = JSON.parse(fileIDsJson);
      //if (subSubDirFiles === null || subSubDirFiles === undefined) {
      //console.log(fif[k]);
      //console.log(fileIDJson.id);
      //if (subSubDirFiles !== null && subSubDirFiles !== undefined) {
        //console.log(subSubDirFiles.id);
      //do not put click events into sub sub folders
      matchFile = rafterFileActions.setSubSubClicks(subSubDirFiles, fileIDJson.id, fif, k);
      if (!matchFile) {
        //console.log('line209');
        fif[k].addEventListener('click', function(evt) {
          //console.log('I clicked the file inside sub folder');
          if (!fileIDJson.isContainer) {
            showFile(fileIDJson.id, allData, raf, rvs, myApp, rui, mtws, tv, showFile, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles, hdj);
          } else {
            raf.rfid = fileIDJson.id;
            rafterFileActions.subSubFolderClick(fileIDJson, subDirFiles, subSubDirFiles);
            console.log('line 207');
            //rvs('ls', myApp, rui, raf, mtws, null, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles);
          }
        });
      }
    }
  }
  showFileDetails(id, allData, raf, rvs, myApp, rui, mtws = null, tv, showFile, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles, hdj) {
    //console.log(subSubDirFiles);
    const dnldbt = document.getElementsByClassName('dnldButton')[0];
    const dfcbt = document.getElementsByClassName('displayButton')[0];
    let matchFile = false;
    document.getElementsByClassName('deleteButton')[0].style.display = 'block';
    rafterFileActions.resetFileActions(mtws, dnldbt, dfcbt);
    if (hdj !== null) {
      for (let i = 0; i < hdj.length; i++) {
        if (id === hdj[i].id) {
          document.getElementsByClassName('homeDirContent')[0].innerHTML = JSON.stringify(hdj[i]);
          //console.log(document.getElementsByClassName('homeDirContent')[0].innerHTML);
          if (hdj[i].isContainer) {
          //console.log('I found a folder');
            document.getElementsByClassName('fileActions')[0].style.display = 'none';
            document.getElementsByClassName('folderName')[0].innerHTML = hdj[i].name;
            document.getElementsByClassName('isHomeDir')[0].style.display = 'block';
            document.getElementsByClassName('isHomeDir')[1].style.display = 'block';
            raf.path = '/' + hdj[i].name;
            raf.rfid = '';
            console.log('line 230?');
            return rvs('ls', myApp, rui, raf, mtws, hdj[i].id, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles);
          }
          return rafterFileActions.fileNameState(hdj[i], dnldbt, dfcbt);
        }
      }
    }
    matchFile = rafterFileActions.setSubSubFiles(subSubDirFiles, id);
    //console.log(subSubDirFiles);
    rafterFileActions.setFileActions(id, subDirFiles, dnldbt, dfcbt, raf, subSubDirFiles, matchFile, rvs, myApp, rui, mtws, hdj, tv, showFile, displayTree, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions);
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

  async makeTreeWithSub(data, hdjId, hdj, tv, showFile, raf, rvs, myApp, rui, mtws, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles) {
    let childArr;
    let newData;
    //console.log(hdj);
    childArr = mnj(data);
    //console.log('child array');
    //console.log(childArr);
    //console.log(subSubDirFiles);
    if (hdjId !== null) {
      sessionStorage.setItem('parentId', hdjId);
    }
    if (raf.rfid !== '' && childArr.length > 0) {
      newData = rafterFileActions.makeSubSubTree(tv.data, raf, childArr);
    } else {
      for (let i = 0; i < tv.data.length; i++) {
        if (hdjId === tv.data[i].id) {
          tv.data[i].children = childArr;
        }
      }
      newData = tv.data;
    }
    await displayTree(tv, newData, 'treeView', showFile, hdj, raf, rvs, myApp, rui, mtws, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles);
    tv.expandAll();
  }

  async navHomeDir() {
    let hdc = JSON.stringify(this.homeDirJson);
    this.rafterFile = {name: '', createType: 'file', path: '', fileType: 'unspecified', rfid: ''};
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
    let top = document.getElementsByClassName('home-header-image')[0];
    /* istanbul ignore else */
    if (top !== null && top !== undefined) {
      top.scrollIntoView();
    }
    document.getElementById('fileType1').checked = true;
    document.getElementsByClassName('rafterMakeFileButton')[0].setAttribute('disabled', '');
    document.getElementsByClassName('fileTypeSelector')[0].style.display = 'block';
  }

  async fetchVS(cmd) {
    if (this.rafterFile.createType !== 'folder') {this.rafterFile.createType = 'file';}
    this.rafterFile.name = this.rafterFile.name.replace(/\s/g, '');
    this.rafterFile.name = this.rafterFile.name.replace(/!/g, '');
    if (this.rafterFile.name === '' && cmd === 'create') {this.rafterFile.name = 'unspecified';}
    //console.log(this.rafterFile);
    if (cmd === 'create') {
      let folderName = '/' + document.getElementsByClassName('folderName')[0].innerHTML;
      console.log(folderName);
      if (folderName !== this.rafterFile.path) {
        this.rafterFile.path = this.rafterFile.path + folderName;
      }
      console.log(this.rafterFile.path);
    }
    await this.vsFetch(this.vsFetchSuccess, this.app, this.rafterUserID, cmd, this.rafterFile, false);
  }
  async vsFetch(vsFetchSuccess, myApp, rafterUserID, cmd, myRafterFile, fromSubDir, mtws, hdjId, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, rafterFileActions, subSubDirFiles) {
    return await myApp.httpClient.fetch('/rafter/vs', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({token: sessionStorage.getItem('rafterToken'), userName: rafterUserID, command: cmd, rafterFile: myRafterFile})
    })
    .then(function(response) { return response.json();}).then((data) => {
      if (data.message !== null && data.message !== '' && data.message !== undefined) {
        document.getElementsByClassName('userServiceError')[0].innerHTML = data.message;
        return document.getElementsByClassName('userServiceError')[1].innerHTML = data.message;
      }
      document.getElementsByClassName('userServiceError')[0].innerHTML = '';
      document.getElementsByClassName('userServiceError')[1].innerHTML = '';
      document.getElementsByClassName('showHideHD')[0].style.display = 'block';
      document.getElementsByClassName('rafterCheckHome')[0].style.display = 'none';
      //console.log(data);
      //console.log(myRafterFile.rfid);
      if (fromSubDir) {
        return vsFetchSuccess(data, vsFetchSuccess, myApp, rafterUserID, cmd, myRafterFile, fromSubDir, mtws, hdjId, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, rafterFileActions, subSubDirFiles);
      }
      if (cmd === 'ls') {
        this.homeDirJson = data;
        this.makeTree(data);
      } else {  //cmd is create
        this.navHomeDir();
      }
    }).catch(function (err) {
      //console.log('this is the error');
      console.log(err);
      if (err.status === 500) {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'test') {window.location.reload();}
      }
    });
  }

  vsFetchSuccess(data, vsFetchSuccess, myApp, rafterUserID, cmd, myRafterFile, fromSubDir, mtws, hdjId, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, rafterFileActions, subSubDirFiles) {
    //console.log(hdjId);
    //console.log('vs fetch');
    //console.log(data);
    document.getElementsByClassName('subDirContent')[0].innerHTML = JSON.stringify(data);
    if (myRafterFile.rfid === '') {
      subDirFiles.push.apply(subDirFiles, data);
    } else {
      console.log(data);
      //if (subSubDirFiles === undefined) {
      subSubDirFiles = data;
      //} else {subSubDirFiles.push.apply(subSubDirFiles, data);}
      //subSubDirFiles = data;
    }
    //console.log(subDirFiles);
    mtws(data, hdjId, hdj, tv, showFile, myRafterFile, rvs, myApp, rafterUserID, mtws, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles);
  }

  rafterVolumeService(cmd, myApp, rafterUserID, myRafterFile, mtws, hdjId, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles) {
    console.log('rafter volume service:' + cmd);
    // if (myRafterFile.rfid !== '') {
    //   //console.log('new request by id detected');
    //   //console.log(hdjId);
    // }
    vsFetch(vsFetchSuccess, myApp, rafterUserID, cmd, myRafterFile, true, mtws, hdjId, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, rafterFileActions, subSubDirFiles);
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
