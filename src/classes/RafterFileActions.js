const FileSaver = require('file-saver');
export class RafterFileActions {
  constructor(httpClient) {
    this.httpClient = httpClient;
    this.reader = new FileReader();
  }
  fileDisplay() {
    let fileDetails = document.getElementsByClassName('homeDirContent')[0].innerHTML;
    let fdJson = JSON.parse(fileDetails);
    this.rafterFileID = fdJson.id;
    this.httpClient.fetch('/rafter/vs', { method: 'post', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'get', fileID: this.rafterFileID})
    }).then((response) => response.blob()).then((blob) => {
    //console.log(blob);
      async function loaded (evt) {
      //console.log('in function loaded');
      //console.log(evt.target);
        const fileString = evt.target.result;
      //console.log(fileString);
        document.getElementsByClassName('displayFileContent')[0].innerHTML = fileString;
      }
    /* istanbul ignore next */
      function errorHandler(evt) {
        alert('The file could not be read');
      }
      this.reader.onload = loaded;
      this.reader.onerror = errorHandler;
      this.reader.readAsText(blob);
    //console.log(fileContents);
    }).catch(function (err) {
      console.log(err);
    });
  }
  fileDelete() {
    let fileDetails = document.getElementsByClassName('homeDirContent')[0].innerHTML;
    let fdJson = JSON.parse(fileDetails);
    this.rafterFileID = fdJson.id;
    this.httpClient.fetch('/rafter/vs', { method: 'post', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({command: 'remove', fileID: this.rafterFileID})
    }).then((response) => response.json()).then((data) => {
      if (data) {
    /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'test') {
          window.location.reload();
        }
      }
    }).catch(function (err) {
      console.log(err);
    });
  }

  fileDownload() {
    let fileDetails = document.getElementsByClassName('homeDirContent')[0].innerHTML;
  //console.log(fileDetails);
    let fdJson = JSON.parse(fileDetails);
    this.rafterFileID = fdJson.id;
    this.httpClient.fetch('/rafter/vs', { method: 'post', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: 'get', fileID: this.rafterFileID})
    }).then((response) => response.blob()).then((blob) => {
  //console.log(blob);
      FileSaver.saveAs(blob, fdJson.name);
    }).catch(function (err) {
      console.log(err);
    });
  }

  valFileName(rf) {
    let rmfb = document.getElementsByClassName('rafterMakeFileButton')[0];
    rmfb.setAttribute('disabled', true);
  //console.log('check file name');
    if (rf.name !== '') {
      rmfb.removeAttribute('disabled');
    }
  }
  validateLogin(rlf) {
    let submitButton = document.getElementsByClassName('rafterLoginButton')[0];
    if (rlf.id !== '' && rlf.secret !== '' && rlf.appName !== '') {
      submitButton.removeAttribute('disabled');
    } else {
      submitButton.setAttribute('disabled', '');
    }
  }
  fileTypeValidate() {
    let nub = document.getElementById('uploadButton');
    nub.style.display = 'none';
  //console.log('i am validating');
  //console.log(rafterFilePath.files);
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

  async ulrf (fileString, cleanFileName, httpClient, rui, filePath) {
  //console.log('this is the file?');
  //console.log(fileString);
  //console.log(cleanFileName);
    httpClient.fetch('/rafter/vs', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({token: sessionStorage.getItem('rafterToken'), userName: rui, command: 'create', rafterFile: {fileType: 'text', name: cleanFileName, path: filePath, content: fileString, createType: 'file'}})
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

  uploadRafterFile(rui, rf) {
    const httpClient = this.httpClient;
    const ulrf = this.ulrf;
  //const rui = this.rafterUserID;
    const fileName = rafterFilePath.files[0].name;
  //const fileType = rafterFilePath.files[0].name;
    const filePath = rf.path;
  //console.log(fileName);
    let cleanFileName = fileName.replace(/\s/g, '');
    cleanFileName = cleanFileName.replace(/!/g, '');
    async function loaded (evt) {
    //console.log('in function loaded');
    //console.log(evt.target);
      const fileString = evt.target.result;
      ulrf(fileString, cleanFileName, httpClient, rui, filePath);
    }

    function errorHandler(evt) {
      alert('The file could not be read');
    }

    this.reader.onload = loaded;
    this.reader.onerror = errorHandler;
    this.reader.readAsText(rafterFilePath.files[0]);
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
    //const dnldbt = document.getElementsByClassName('dnldButton')[0];
    //const dfcbt = document.getElementsByClassName('displayButton')[0];
    dnldbt.style.display = 'none';
    dfcbt.style.display = 'none';
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
  }

  setFileActions(id, subDirFiles, dnldbt, dfcbt) {
    //if (subDirFiles !== null && subDirFiles !== undefined) {
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
    // }
  }

}
