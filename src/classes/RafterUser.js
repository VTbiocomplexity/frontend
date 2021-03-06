const jwtDecode = require('jwt-decode');

export class RafterUser {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  rafterLogout() {
    sessionStorage.removeItem('rafterToken');
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'test') {
      window.location.reload();
    }
  }

  checkExpired(decoded) {
    // console.log('check expired');
    const d = new Date();
    const checkd = d.valueOf() / 1000;
    if (checkd > decoded.exp) {
      return false;
    } return true;
  }

  checkIfPageReload() {
    let reloadPage = false;
    const showHideHD = document.getElementsByClassName('showHideHD')[0];
    const rafterCheckHome = document.getElementsByClassName('rafterCheckHome')[0];
    // console.log(showHideHD);
    // console.log(rafterCheckHome);
    if (showHideHD !== null && showHideHD !== undefined) {
      if (showHideHD.style.display === 'block') {
        // console.log('why is logout button?');
        reloadPage = true;
        showHideHD.style.display = 'none';
      }
    }
    if (rafterCheckHome !== null && rafterCheckHome !== undefined) {
      if (rafterCheckHome.style.display === 'block') {
        // console.log('why is logout button?');
        reloadPage = true;
        rafterCheckHome.style.display = 'none';
      }
    }
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
      body: JSON.stringify({ token: mToken })
    })
      .then(response => response.json())
      .then(() =>
      // console.log(data);
        true).catch((err) => {
        console.log(err);
        return false;
      });
  }
  initRafter(ruid, rObj, uid, interval, sli) {
    rObj.uid = uid; //eslint-disable-line
    const userServiceError = document.getElementsByClassName('userServiceError')[0];
    const message = 'Wrong app id or app secret';
    // console.log(JSON.stringify(rObj));
    return this.httpClient.fetch('/rafter/rinit', {
      method: 'post', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rObj)
    })
      .then(response => response.json()).then((data) => {
        if (!data.includes('error')) {
          window.sessionStorage.setItem('rafterToken', data);
          const user = jwtDecode(data);
          // console.log(user);
          ruid = user.sub; //eslint-disable-line
          if (userServiceError !== null && userServiceError !== undefined) { userServiceError.innerHTML = ''; }
          // this.initVol(data);
          /* istanbul ignore if */
          // if (process.env.NODE_ENV !== 'test') { window.location.reload(); }
        } else {
          if (userServiceError !== null && userServiceError !== undefined) { userServiceError.innerHTML = message; }
          if (!sli) {
          // tried to select an app, but the app secret was readAsText
          // display the rafter login form
            const rafterlogin = document.getElementsByClassName('rafterLogin')[0];
            rafterlogin.removeAttribute('show.bind');
            rafterlogin.classList.remove('aurelia-hide');
            // console.log(rafterlogin);
            document.getElementsByClassName('rafterCheckHome')[0].style.display = 'none';
          // sli = true;
          }
        }
      }).catch((err) => {
        console.log(err);
        window.clearInterval(interval);
        if (userServiceError !== null && userServiceError !== undefined) {
          userServiceError.innerHTML = message;
        }
      });
  }
}
