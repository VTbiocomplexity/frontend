import { inject } from 'aurelia-framework';
import { App } from '../app';
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
    this.rafter = { id: '', secret: '', appName: '' };
    this.rafterFile = {
      name: '', createType: 'file', path: '', fileType: 'unspecified', rfid: ''
    };
    this.tv = null;
    this.homeDirJson = null;
    this.subDirJson = [];
    this.rafterFileID = '';
    this.appNames = [];
  }
  fileTypes = ['intersim-im-11-1_runoutput', 'intersim-im-11-1_runlog', 'GraphABM_rank',
    'json', 'text', 'jsonh+fasta', 'png', 'jpg', 'pdf', 'xml', 'fasta'];
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
  rafterAddApp() {
    this.showLogin = true;
    document.getElementsByClassName('fileActions')[0].style.display = 'none';
    document.getElementsByClassName('homeDirLink')[0].style.display = 'none';
  }
  async removeApp() {
    const appName = document.getElementById('appName2').value;
    const myIndex = this.appNames.indexOf(appName);
    this.user.rafterApps.splice(myIndex, 1);
    await this.app.updateById('/user/', this.uid, this.user);
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'test') {
      window.location.reload();
    }
  }
  setRafterUserId() {
    const rT = (sessionStorage.getItem('rafterToken'));
    if (rT !== null && rT !== undefined) {
      const rU = jwtDecode(rT);
      this.rafterUserID = rU.sub;
    }
  }
  async handleRafterLogin(option) {
    if (option === 'changeApp') {
      const selection = document.getElementById('appName').value;
      const myIndex = this.appNames.indexOf(selection);
      this.rafter = {
        id: this.user.rafterApps[myIndex].r_app_id,
        secret: this.user.rafterApps[myIndex].r_app_secret,
        appName: this.user.rafterApps[myIndex].r_app_name
      };
    }
    if (option === 'autoInitRafter') {
      this.rafter = {
        id: this.user.rafterApps[0].r_app_id,
        secret: this.user.rafterApps[0].r_app_secret,
        appName: this.user.rafterApps[0].r_app_name
      };
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
  displayTree(
    tv, nameArr, divId, showFile, hdj, raf, rvs, myApp, rui, mtws, displayTree, subDirFiles,
    mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles
  ) {
    let treeNodeObj, filesInFolder = null; // these are the files that are inside of a subfolder of the home dir
    const newTV = new TreeView(nameArr, divId);
    const getTreeLeaves = document.getElementsByClassName('tree-leaf-content');
    const foldersArr = [];
    for (let i = 0; i < getTreeLeaves.length; i += 1) {
      treeNodeObj = JSON.parse(getTreeLeaves[i].getAttribute('data-item'));
      if (treeNodeObj.isContainer) {
        getTreeLeaves[i].innerHTML = `<div class="tlfolder fa fa-folder"></div>${getTreeLeaves[i].innerHTML}`;
        foldersArr.push({ id: treeNodeObj.id, domDiv: getTreeLeaves[i] });
      }
    }
    for (let j = 0; j < foldersArr.length; j += 1) {
      foldersArr[j].domDiv.addEventListener('click', () => {
        showFile(
          foldersArr[j].id, null, raf, rvs, myApp, rui, mtws, newTV, showFile, displayTree,
          subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles, hdj
        );
      });
      if (foldersArr[j].domDiv.nextElementSibling !== null) {
        filesInFolder = foldersArr[j].domDiv.nextElementSibling;
      }
      // }
      // console.log(filesInFolder);
      // console.log(filesInFolder.getElementByClassName('tree-leaf'));
    }
    // if (subSubDirFiles === null) {
    // home directory click event is here
    newTV.on('select', (evt) => {
      showFile(
        evt.data.id, null, raf, rvs, myApp, rui, null, null, null, null, subDirFiles, mnj,
        makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles, hdj
      );
    });
    // }
    // if (filesInFolder === null) {
    //   // return console.log('no files inside this subfolder');
    // }
    makeFilesClickable(
      filesInFolder, showFile, raf, rvs, myApp, rui, subDirFiles, mnj, makeFilesClickable,
      mtws, newTV, displayTree, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles, hdj
    );
  }
  makeFilesClickable(
    filesInFolder, showFile, raf, rvs, myApp, rui, subDirFiles, mnj, makeFilesClickable, mtws,
    tv, displayTree, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles, hdj
  ) {
    if (filesInFolder === null) {
      return;
    }
    const fif = filesInFolder.getElementsByClassName('tree-leaf');
    const insideFolderDetails = document.getElementsByClassName('subDirContent')[0].innerHTML;
    const allData = JSON.parse(insideFolderDetails);
    let fileID, fileIDsJson, matchFile = false;
    for (let k = 0; k < fif.length; k += 1) {
      fileID = fif[k].getElementsByClassName('tree-leaf-content')[0];
      fileIDsJson = fileID.getAttribute('data-item');
      const fileIDJson = JSON.parse(fileIDsJson);
      // if (subSubDirFiles === null || subSubDirFiles === undefined) {
      // console.log(fif[k]);
      // console.log(fileIDJson.id);
      // if (subSubDirFiles !== null && subSubDirFiles !== undefined) {
      // console.log(subSubDirFiles.id);
      // do not put click events into sub sub folders
      matchFile = rafterFileActions.setSubSubClicks(subSubDirFiles, fileIDJson.id, fif, k);
      if (!matchFile) {
        // console.log('line209');
        fif[k].addEventListener('click', () => {
          console.log('I clicked the file inside sub folder');
          if (!fileIDJson.isContainer) {
            showFile(
              fileIDJson.id, allData, raf, rvs, myApp, rui, mtws, tv, showFile, displayTree, subDirFiles,
              mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles, hdj
            );
          } else {
            // raf.rfid = fileIDJson.id;
            rafterFileActions.subSubFolderClick(fileIDJson, subDirFiles, subSubDirFiles);
          }
        });
      }
    }
  }
  showFileDetails(
    id, allData, raf, rvs, myApp, rui, mtws = null, tv, showFile,
    displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles, hdj
  ) {
    const dnldbt = document.getElementsByClassName('dnldButton')[0];
    const dfcbt = document.getElementsByClassName('displayButton')[0];
    document.getElementsByClassName('displayFileContent')[0].style.display = 'none';
    let matchFile = false;
    document.getElementsByClassName('deleteButton')[0].style.display = 'block';
    rafterFileActions.resetFileActions(mtws, dnldbt, dfcbt);
    if (hdj !== null) {
      // console.log('rafter line 189');
      for (let i = 0; i < hdj.length; i += 1) {
        if (id === hdj[i].id) {
          // console.log('match');
          document.getElementsByClassName('homeDirContent')[0].innerHTML = JSON.stringify(hdj[i]);
          if (hdj[i].isContainer) {
            // console.log('i clicked a container');
            // console.log(hdj[i]);
            document.getElementsByClassName('fileActions')[0].style.display = 'none';
            document.getElementsByClassName('folderName')[0].innerHTML = hdj[i].name;
            document.getElementsByClassName('isHomeDir')[0].style.display = 'block';
            document.getElementsByClassName('isHomeDir')[1].style.display = 'block';
            const newRaf = raf;
            newRaf.path = `/${hdj[i].name}`;
            newRaf.rfid = '';
            return rvs(
              'ls', myApp, rui, newRaf, mtws, hdj[i].id, hdj, tv, showFile,
              rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles
            );
          }
          // if (hdj[i].type === 'jpg' || hdj[i].type === 'jpg') {
          //   console.log('graphic file');
          // }
          return rafterFileActions.fileNameState(hdj[i], dnldbt, dfcbt);
        }
      }
    }
    matchFile = rafterFileActions.setSubSubFiles(subSubDirFiles, id);
    // console.log(subSubDirFiles);
    return rafterFileActions.setFileActions(
      id, subDirFiles, dnldbt, dfcbt, raf, subSubDirFiles, matchFile,
      rvs, myApp, rui, mtws, hdj, tv, showFile, displayTree, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions
    );
  }
  makeNewJson(data) {
    const nameArr = [];
    let nameObj = {};
    for (let i = 0; i < data.length; i += 1) {
      nameObj = {
        name: data[i].name, id: data[i].id, type: data[i].type, isContainer: data[i].isContainer, children: []
      };
      nameArr.push(nameObj);
    }
    return nameArr;
  }
  makeTree(data) {
    const nameArr = this.makeNewJson(data);
    this.displayTree(
      this.tv, nameArr, 'treeView', this.showFileDetails, this.homeDirJson, this.rafterFile,
      this.rafterVolumeService, this.app, this.rafterUserID, this.makeTreeWithSub, this.displayTree,
      this.subDirJson, this.makeNewJson, this.makeFilesClickable, this.vsFetch, this.vsFetchSuccess, this.rafterFileActions
    );
  }
  async makeTreeWithSub(
    data, hdjId, hdj, tv, showFile, raf, rvs, myApp, rui, mtws,
    displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles
  ) {
    let newData;
    const newTV = tv;
    // console.log(hdjId);
    const childArr = mnj(data);
    // console.log('child array');
    // console.log(childArr);
    // console.log(subSubDirFiles);
    if (hdjId !== null) {
      sessionStorage.setItem('parentId', hdjId);
    }
    if (raf.rfid !== '') {
      newData = rafterFileActions.makeSubSubTree(tv.data, raf, childArr);
    } else {
      for (let i = 0; i < tv.data.length; i += 1) {
        if (hdjId === tv.data[i].id) {
          newTV.data[i].children = childArr;
        }
      }
      newData = newTV.data;
    }
    await displayTree(
      newTV, newData, 'treeView', showFile, hdj, raf, rvs, myApp,
      rui, mtws, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles
    );
    newTV.expandAll();
  }
  async navHomeDir() {
    const hdc = JSON.stringify(this.homeDirJson);
    this.rafterFile = {
      name: '', createType: 'file', path: '', fileType: 'unspecified', rfid: ''
    };
    document.getElementsByClassName('folderName')[0].innerHTML = `home/${this.rafterUserID}`;
    document.getElementsByClassName('insideFolderDetails')[0].style.display = 'block';
    document.getElementsByClassName('subDirContent')[0].innerHTML = hdc;
    document.getElementsByClassName('fileActions')[0].style.display = 'none';
    document.getElementsByClassName('fileDetailsTitle')[0].style.display = 'none';
    document.getElementsByClassName('homeDirContent')[0].innerHTML = '';
    document.getElementsByClassName('createNew')[0].style.display = 'block';
    document.getElementsByClassName('isHomeDir')[0].style.display = 'block';
    document.getElementsByClassName('isHomeDir')[1].style.display = 'block';
    await this.fetchVS('ls');
    const top = document.getElementsByClassName('home-header-image')[0];
    /* istanbul ignore else */
    if (top !== null && top !== undefined) {
      top.scrollIntoView();
    }
    document.getElementById('fileType1').checked = true;
    document.getElementsByClassName('rafterMakeFileButton')[0].setAttribute('disabled', '');
    document.getElementsByClassName('fileTypeSelector')[0].style.display = 'block';
  }
  async fetchVS(cmd) {
    if (this.rafterFile.createType !== 'folder') { this.rafterFile.createType = 'file'; }
    this.rafterFile.name = this.rafterFile.name.replace(/\s/g, '');
    this.rafterFile.name = this.rafterFile.name.replace(/!/g, '');
    if (this.rafterFile.name === '' && cmd === 'create') { this.rafterFile.name = 'unspecified'; }
    // console.log(this.rafterFile);
    if (cmd === 'create') {
      const folderName = `/${document.getElementsByClassName('folderName')[0].innerHTML}`;
      console.log(folderName);
      const isHome = folderName.includes('home');
      if (folderName !== this.rafterFile.path && !isHome) {
        this.rafterFile.path = this.rafterFile.path + folderName;
      }
      console.log(this.rafterFile.path);
    }
    await this.vsFetch(this.vsFetchSuccess, this.app, this.rafterUserID, cmd, this.rafterFile, false);
  }
  async vsFetch(
    vsFetchSuccess, myApp, rafterUserID, cmd, myRafterFile, fromSubDir, mtws, hdjId,
    hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, rafterFileActions, subSubDirFiles
  ) {
    await myApp.httpClient.fetch('/rafter/vs', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: sessionStorage.getItem('rafterToken'), userName: rafterUserID, command: cmd, rafterFile: myRafterFile
      })
    })
      .then(response => response.json()).then((data) => {
        if (data.message !== null && data.message !== '' && data.message !== undefined) {
          document.getElementsByClassName('userServiceError')[0].innerHTML = data.message;
          document.getElementsByClassName('userServiceError')[1].innerHTML = data.message;
          return;
        }
        document.getElementsByClassName('userServiceError')[0].innerHTML = '';
        document.getElementsByClassName('userServiceError')[1].innerHTML = '';
        document.getElementsByClassName('showHideHD')[0].style.display = 'block';
        document.getElementsByClassName('rafterCheckHome')[0].style.display = 'none';
        if (fromSubDir) {
          vsFetchSuccess(
            data, vsFetchSuccess, myApp, rafterUserID, cmd, myRafterFile,
            fromSubDir, mtws, hdjId, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable,
            vsFetch, rafterFileActions, subSubDirFiles
          );
        } else if (cmd === 'ls' && !fromSubDir) {
          this.homeDirJson = data;
          this.makeTree(data);
          return;
        } // cmd is create
        this.navHomeDir();
      }).catch((err) => {
      // console.log('this is the error');
        // console.log(err);
        /* istanbul ignore next */
        if (err.status === 500 && process.env.NODE_ENV !== 'test') { window.location.reload(); }
      });
  }
  vsFetchSuccess(
    data, vsFetchSuccess, myApp, rafterUserID, cmd, myRafterFile, fromSubDir,
    mtws, hdjId, hdj, tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, rafterFileActions, subSubDirFiles
  ) {
    let nsdf = subSubDirFiles, nid = hdjId;
    document.getElementsByClassName('subDirContent')[0].innerHTML = JSON.stringify(data);
    if (myRafterFile.rfid === '') {
      subDirFiles.push(...data);
      console.log(data);
    } else {
      nsdf = data;
      let homeDirC = document.getElementsByClassName('homeDirContent')[0].innerHTML;
      homeDirC = JSON.parse(homeDirC);
      nid = homeDirC.container_id;
      document.getElementsByClassName('folderName')[0].innerHTML = homeDirC.name;
    }
    if (data.length === 0) {
      console.log('allow delete empty folder');
      document.getElementsByClassName('fileActions')[0].style.display = 'block';
      const folderName = document.getElementsByClassName('folderName')[0].innerHTML;
      const deleteButton = document.getElementsByClassName('deleteButton')[0];
      deleteButton.innerHTML = `Delete<br>${folderName}`;
      deleteButton.style.display = 'block';
    }
    mtws(
      data, nid, hdj, tv, showFile, myRafterFile, rvs, myApp, rafterUserID, mtws,
      displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, nsdf
    );
  }
  rafterVolumeService(
    cmd, myApp, rafterUserID, myRafterFile, mtws, hdjId, hdj,
    tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles
  ) {
    vsFetch(
      vsFetchSuccess, myApp, rafterUserID, cmd, myRafterFile, true, mtws, hdjId, hdj,
      tv, showFile, rvs, displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, rafterFileActions, subSubDirFiles
    );
  }
  checkIfLoggedIn(cep, rlo, sli, cipr) {
    if (window.sessionStorage.getItem('rafterToken') !== null && window.sessionStorage.getItem('rafterToken') !== undefined) {
      const rtok = window.sessionStorage.getItem('rafterToken');
      try {
        const decoded = jwtDecode(rtok);
        const validToken = cep(decoded);
        if (!validToken) {
          rlo();
          return true;
        } return false;
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
    this.interval = setInterval(
      () => {
        cili(cep, rlo, sli, cipr);
      }
      , 3400,
    );
    const rT = (sessionStorage.getItem('rafterToken'));
    if (rT !== null && rT !== undefined) {
      this.setRafterUserId();
      document.getElementsByClassName('rafterAddApp')[0].style.display = 'block';
      document.getElementsByClassName('rafterCheckHome')[0].style.display = 'block';
      // console.log('this is the rafterApps');
      // console.log(this.user.rafterApps);
      if (this.user.rafterApps !== undefined && this.user.rafterApps.length > 1) {
        for (let i = 0; i < this.user.rafterApps.length; i += 1) {
          this.appNames.push(this.user.rafterApps[i].r_app_name);
        }
        document.getElementsByClassName('appSelector')[0].style.display = 'block';
        document.getElementsByClassName('appSelector')[1].style.display = 'block';
      }
      await this.rafterUser.initVol(rT);
      document.getElementsByClassName('rafterLogin')[0].style.display = 'none';
    }
  }
}
