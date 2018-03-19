export class RafterUser {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  rafterLogout() {
    //console.log('going to log you out');
    localStorage.removeItem('rafterToken');
    //localStorage.removeItem('rafterUser');
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'test') {
      //console.log('is this a test?');
      window.location.reload();
    }
  }
  checkExpired(decoded) {
    console.log('check expired');
    let d = new Date();
    let checkd = d.valueOf() / 1000;
    //console.log(checkd);
    if (checkd > decoded.exp) {
      //console.log('expired');
      return false;
    } return true;
  }

  checkIfPageReload(sli) {
    let reloadPage = false;
    let logoutButton = document.getElementsByClassName('rafterLogout')[0];
    if (logoutButton !== null && logoutButton !== undefined) {
      if (logoutButton.style.display === 'block') {
        reloadPage = true;
        logoutButton.style.display === 'none';
      }
    }
    console.log('you are not logged in');
    sli = true;
    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'test' && reloadPage) {
      window.location.reload();
    }
  }

  initVol(mToken) {
    this.httpClient.fetch('/rafter/vsinit', {
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
}
