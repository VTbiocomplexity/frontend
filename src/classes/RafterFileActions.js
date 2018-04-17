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
}