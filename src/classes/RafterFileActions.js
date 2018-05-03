const FileSaver = require('file-saver');

export class RafterFileActions {
  constructor(httpClient) {
    this.httpClient = httpClient;
    this.reader = new FileReader();
  }
  fileDisplay() {
    const fileDetails = document.getElementsByClassName('homeDirContent')[0].innerHTML;
    const fdJson = JSON.parse(fileDetails);
    // console.log(fdJson.type);
    this.rafterFileID = fdJson.id;
    this.httpClient.fetch('/rafter/vs', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'get', fileID: this.rafterFileID })
    }).then(response => response.blob()).then((blob) => {
    // console.log(blob);
      async function loaded(evt) {
      // console.log('in function loaded');
      // console.log(evt.target);
        // const readResult = evt.target.result;
        // console.log(fileString);
        const dfc = document.getElementsByClassName('displayFileContent')[0];
        console.log(fdJson.type);
        if (fdJson.type !== 'jpg' && fdJson.type !== 'png') {
          dfc.innerHTML = evt.target.result;
        } else {
          dfc.innerHTML = '';
          console.log(evt.target.result);
          const image = new Image();
          image.width = document.documentElement.clientWidth - 20;
          image.title = fdJson.name;
          image.src = await evt.target.result;
          dfc.appendChild(image);
        }
        dfc.style.display = 'block';
        dfc.scrollIntoView();
      }
      /* istanbul ignore next */
      function errorHandler() { alert('The file could not be read'); }
      this.reader.onload = loaded;
      this.reader.onerror = errorHandler;
      // if (fdJson.type !== 'jpg' && fdJson.type !== 'png') {
      this.reader.readAsText(blob);
      // } else {
      // this.reader.readAsDataURL(blob);
      // }
    // console.log(fileContents);
    }).catch((err) => { console.log(err); });
  }
  fileDelete() {
    const fileDetails = document.getElementsByClassName('homeDirContent')[0].innerHTML;
    const fdJson = JSON.parse(fileDetails);
    this.rafterFileID = fdJson.id;
    this.httpClient.fetch('/rafter/vs', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'remove', fileID: this.rafterFileID })
    }).then(response => response.json()).then((data) => {
      if (data) {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'test') { window.location.reload(); }
      }
    }).catch((err) => { console.log(err); });
  }
  fileDownload() {
    const fileDetails = document.getElementsByClassName('homeDirContent')[0].innerHTML;
    // console.log(fileDetails);
    const fdJson = JSON.parse(fileDetails);
    this.rafterFileID = fdJson.id;
    this.httpClient.fetch('/rafter/vs', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'get', fileID: this.rafterFileID })
    }).then(response => response.blob()).then((blob) => {
      // console.log(blob);
      FileSaver.saveAs(blob, fdJson.name);
    }).catch((err) => { console.log(err); });
  }
  valFileName(rf) {
    const rmfb = document.getElementsByClassName('rafterMakeFileButton')[0];
    rmfb.setAttribute('disabled', true);
    // console.log('check file name');
    if (rf.name !== '') { rmfb.removeAttribute('disabled'); }
  }
  validateLogin(rlf) {
    const submitButton = document.getElementsByClassName('rafterLoginButton')[0];
    if (rlf.id !== '' && rlf.secret !== '' && rlf.appName !== '') {
      submitButton.removeAttribute('disabled');
    } else { submitButton.setAttribute('disabled', ''); }
  }
  fileTypeValidate() {
    const nub = document.getElementById('uploadButton');
    nub.style.display = 'none';
    // console.log('i am validating');
    // console.log(rafterFilePath.files);
    if (rafterFilePath.files.length === 0) {
      alert('no file was selected');
      return false;
    }
    let oInput;
    const validTypes = ['text/plain', 'text/html', 'application/json', 'text/xml', 'image/jpeg', 'image/png'];
    for (let i = 0; i < rafterFilePath.files.length; i += 1) {
      oInput = rafterFilePath.files[i];
      // the type is determined automatically during the creation of the Blob.
      // this value cannot be controlled by developer, hence cannot test it.
      /* istanbul ignore if */
      if (validTypes.indexOf(oInput.type) !== -1) {
      // console.log('type is a plain text file');
        nub.style.display = 'block';
        return true;
      }
    }
    alert(`Sorry, ${oInput.type} is an invalid file type.`);
    return false;
  }
  async ulrf(fileString, cleanFileName, httpClient, rui, filePath, fType) {
    const folderName = `/${document.getElementsByClassName('folderName')[0].innerHTML}`;
    // console.log(fType);
    // console.log(fileString);
    if (fType === 'text/plain' || fType === 'text/html') {
      fType = 'text';
    } else if (fType === 'application/json') {
      fType = 'json';
    } else if (fType === 'text/xml') {
      fType = 'xml';
    } else if (fType === 'image/jpeg') {
      fType = 'jpg';
    } else if (fType === 'image/png') {
      fType = 'png';
    } else {
      return alert(`file type is: ${fType}`);
    }
    /* istanbul ignore else */
    if (folderName !== filePath) { filePath += folderName; }
    // console.log(filePath);
    return httpClient.fetch('/rafter/vs', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: sessionStorage.getItem('rafterToken'),
        userName: rui,
        command: 'create',
        rafterFile: {
          fileType: fType, name: cleanFileName, path: filePath, content: fileString, createType: 'file'
        }
      })
    }).then(response => response.json())
      .then(() => {
        // console.log(data);
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'test') { window.location.reload(); }
      }).catch((err) => { console.log(err); });
  }
  uploadRafterFile(rui, rf) {
    const httpClient = this.httpClient;
    const ulrf = this.ulrf;
    // const rui = this.rafterUserID;
    const fileName = rafterFilePath.files[0].name;
    const fType = rafterFilePath.files[0].type;
    const filePath = rf.path;
    // console.log(fileName);
    let cleanFileName = fileName.replace(/\s/g, '');
    cleanFileName = cleanFileName.replace(/!/g, '');
    async function loaded(evt) {
    // console.log('in function loaded');
    // console.log(evt.target);
      const fileString = evt.target.result;
      console.log(fileString);
      ulrf(fileString, cleanFileName, httpClient, rui, filePath, fType);
    }
    function errorHandler() {
      alert('The file could not be read');
    }
    this.reader.onload = loaded;
    this.reader.onerror = errorHandler;
    if (fType.includes('image')) {
      console.log('line 178');
      this.reader.readAsDataURL(rafterFilePath.files[0]);
    } else {
      this.reader.readAsText(rafterFilePath.files[0]);
    }
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
  nevermind() {
  /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'test') {
      window.location.reload();
    }
  }
  resetFileActions(mtws, dnldbt, dfcbt) {
    document.getElementsByClassName('displayFileContent')[0].innerHTML = '';
    dnldbt.style.display = 'none';
    dfcbt.style.display = 'none';
    document.getElementsByClassName('fileActions')[0].style.display = 'block';
    document.getElementsByClassName('fileDetailsTitle')[0].style.display = 'block';
    const ifd = document.getElementsByClassName('insideFolderDetails')[0];
    if (mtws === null) {
      ifd.style.display = 'none';
      document.getElementsByClassName('createNew')[0].style.display = 'none';
    } else {
      ifd.style.display = 'block';
      document.getElementsByClassName('isHomeDir')[0].style.display = 'none';
      document.getElementsByClassName('isHomeDir')[1].style.display = 'none';
      document.getElementsByClassName('createNew')[0].style.display = 'block';
    }
  }
  setFileActions(
    id, subDirFiles, dnldbt, dfcbt, raf, subSubDirFiles, matchFile, rvs, myApp,
    rui, mtws, hdj, tv, showFile, displayTree, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions
  ) {
    if (matchFile || subDirFiles === null || subDirFiles === undefined) { return; }
    // console.log('set file actions');
    // document.getElementsByClassName('deleteButton')[0].style.display = 'none';
    for (let j = 0; j < subDirFiles.length; j += 1) {
      if (id === subDirFiles[j].id && !subDirFiles[j].isContainer) {
      // console.log('i found a match!');
        document.getElementsByClassName('deleteButton')[0].style.display = 'block';
        document.getElementsByClassName('dnldButton')[0].innerHTML = (`Download<br>${subDirFiles[j].name}`);
        document.getElementsByClassName('deleteButton')[0].innerHTML = (`Delete<br>${subDirFiles[j].name}`);
        document.getElementsByClassName('displayButton')[0].innerHTML = (`Display<br>${subDirFiles[j].name}`);
        if (subDirFiles[j].state !== 'empty') {
          document.getElementsByClassName('dnldButton')[0].style.display = 'block';
          document.getElementsByClassName('displayButton')[0].style.display = 'block';
        }
        document.getElementsByClassName('homeDirContent')[0].innerHTML = JSON.stringify(subDirFiles[j]);
        return;
      }
      if (subDirFiles[j].isContainer && id === subDirFiles[j].id) {
        console.log('I clicked a sub sub folder');
        // console.log(subSubDirFiles);
        document.getElementsByClassName('deleteButton')[0].style.display = 'none';
        document.getElementsByClassName('homeDirContent')[0].innerHTML = JSON.stringify(subDirFiles[j]);
        // document.getElementsByClassName('subDirContent')[0].innerHTML = '';
        raf.rfid = id;
        console.log(raf.rfid);
        document.getElementsByClassName('createNew')[0].style.display = 'block';
        rvs(
          'ls', myApp, rui, raf, mtws, null, hdj, tv, showFile, rvs,
          displayTree, subDirFiles, mnj, makeFilesClickable, vsFetch, vsFetchSuccess, rafterFileActions, subSubDirFiles
        );
      // document.getElementsByClassName('fileCreate')[0].style.display = 'block';
      }
    }
  }
  setSubSubClicks(subSubDirFiles, id, fif, k) {
    if (subSubDirFiles !== null && subSubDirFiles !== undefined) {
      for (let zz = 0; zz < subSubDirFiles.length; zz += 1) {
        if (subSubDirFiles[zz].id === id) {
        // console.log('found a match');
          fif[k].addEventListener('click', () => {
          // console.log('do nothing for sub sub click');
            document.getElementsByClassName('deleteButton')[0].style.display = 'none';
          });
          return true;
        }
      }
    }
    return false;
  }
  setSubSubFiles(subSubDirFiles, id) {
    if (subSubDirFiles !== null && subSubDirFiles !== undefined) {
      // console.log('set sub sub files');
    // do not put click events into sub sub folders
      for (let zz = 0; zz < subSubDirFiles.length; zz += 1) {
        if (subSubDirFiles[zz].id === id) {
        // console.log('found a match');
          document.getElementsByClassName('deleteButton')[0].style.display = 'block';
          document.getElementsByClassName('homeDirContent')[0].innerHTML = JSON.stringify(subSubDirFiles[zz]);
          // document.getElementsByClassName('deleteButton')[0].style.display = 'block';
          document.getElementsByClassName('dnldButton')[0].innerHTML = (`Download<br>${subSubDirFiles[zz].name}`);
          document.getElementsByClassName('deleteButton')[0].innerHTML = (`Delete<br>${subSubDirFiles[zz].name}`);
          document.getElementsByClassName('displayButton')[0].innerHTML = (`Display<br>${subSubDirFiles[zz].name}`);
          if (subSubDirFiles[zz].state !== 'empty') {
            document.getElementsByClassName('dnldButton')[0].style.display = 'block';
            document.getElementsByClassName('displayButton')[0].style.display = 'block';
          }
          return true;
        }
      // document.getElementsByClassName('deleteButton')[0].style.display = 'block';
      // return false;
      }
    }
    return false;
  }
  makeSubSubTree(tvData, raf, childArr) {
    // console.log('make sub sub tree');
    const parentId = sessionStorage.getItem('parentId');
    // console.log(parentId);
    let j = 0;
    for (j = 0; j < tvData.length; j += 1) {
    /* istanbul ignore else */
      if (parentId === tvData[j].id) {
        break;
      }
    }
    // console.log(tvData);
    /* istanbul ignore else */
    if (tvData[j] !== undefined) {
      for (let k = 0; k < tvData[j].children.length; k += 1) {
        // console.log(tvData[j].children);
        if (tvData[j].children[k].id === raf.rfid) {
        // console.log('make the sub sub tree');
        // console.log(tv.data[j].children[k]);
          tvData[j].children[k].children = childArr;
        // console.log(tv.data[j].children[k].children);
        } else {
          tvData[j].children[k].children = [];
        }
      }
    }
    tvData = this.removeOtherSubSubChildren(tvData, parentId);
    // //remove all other sub sub folder children from treeView
    // for (let k = 0; k < tvData.length; k++) {
    //   if (tvData[k].id !== parentId) {
    //     //console.log(tvData[k]);
    //     for (let l = 0; l < tvData[k].children.length; l++) {
    //       if (tvData[k].children[l].children !== undefined) {
    //         if (tvData[k].children[l].children.length > 0) {tvData[k].children[l].children = [];}
    //       }
    //     }
    //   }
    // }
    raf.rfid = '';
    return tvData;
  }
  removeOtherSubSubChildren(tvData, parentId) {
    console.log('remove all other sub sub folder children from treeView');
    for (let k = 0; k < tvData.length; k += 1) {
      if (tvData[k].id !== parentId) {
        // console.log(tvData[k]);
        for (let l = 0; l < tvData[k].children.length; l += 1) {
          tvData[k].children[l].children = [];
        }
      }
    }
    return tvData;
  }
  fileNameState(myFile, dnldbt, dfcbt) {
  // console.log('file name state');
    document.getElementsByClassName('deleteButton')[0].style.display = 'block';
    document.getElementsByClassName('dnldButton')[0].innerHTML = (`Download<br>${myFile.name}`);
    document.getElementsByClassName('deleteButton')[0].innerHTML = (`Delete<br>${myFile.name}`);
    document.getElementsByClassName('displayButton')[0].innerHTML = (`Display<br>${myFile.name}`);
    if (myFile.state !== 'empty') {
      dnldbt.style.display = 'block';
      dfcbt.style.display = 'block';
    }
  }
  subSubFolderClick(fij, subDirFiles, subSubDirFiles) {
    // console.log('got me a sub sub folder');
    document.getElementsByClassName('fileActions')[0].style.display = 'none';
    // console.log(fileIDJson);
    document.getElementsByClassName('folderName')[0].innerHTML = fij.name;
    document.getElementsByClassName('createNew')[0].style.display = 'none';
    document.getElementsByClassName('dnldButton')[0].style.display = 'none';
    document.getElementsByClassName('displayButton')[0].style.display = 'none';
    // raf.rfid = fileIDJson.id;
    // refresh the inside Folder Details
    // hide the file actions (display, download, delete)
    // tree view opens with sub sub folder content
    document.getElementsByClassName('displayFileContent')[0].innerHTML = ''; // this is incase someone clicked view button on a file
    document.getElementsByClassName('subDirContent')[0].innerHTML = JSON.stringify(subSubDirFiles);
    // console.log('trying to find the sub sub folder metadata');
    // console.log(subSubDirFiles);
    // console.log(allData);
    // console.log(subDirFiles);
    // console.log(raf.rfid);
    // console.log(hdj);
    for (let i = 0; i < subDirFiles.length; i += 1) {
    /* istanbul ignore else */
      if (subDirFiles[i].id === fij.id) {
        document.getElementsByClassName('homeDirContent')[0].innerHTML = JSON.stringify(subDirFiles[i]);
        document.getElementsByClassName('createNew')[0].style.display = 'block';
      }
    }
  }
}
