// import {inject} from 'aurelia-framework';
const Fetch = require('isomorphic-fetch');
const utils = require('../commons/utils.js');
// import {App} from '../app';
// @inject(App)
class Login_ {
  constructor() {
    this.fetch = Fetch;
    this.appName = '';
    // this.app = App;
  }

  createLoginForm(appName) {
    utils.nevermind('LoginForm');
    utils.nevermind('RegistrationForm');
    const useremailinput = '<tr class="emailheader"><th style="border:none">Email</th></tr><tr class="emailinput"><td>' +
    '<input class="loginemail" type="email" name="email" style="width:300px;" value="" required></td></tr>';
    const useridrow = '<tr class="uidheader"><th style="border:none">Email or Userid</th></tr><tr class="uidinput"><td>' +
    '<input class="userid" name="userid" style="width:300px;" value="" required></tr></td>';
    const loginform = document.createElement('div');
    loginform.className = 'LoginForm';
    loginform.innerHTML = `${'<h2 style="margin:0px;padding:4px;font-size:1.2em;text-align:center;background:#eee;">' +
    '<span class="patric">PATRIC</span>User Login</h2>' +
    '<form><div style="padding:2px; margin:10px;"><table><tbody>'}${useridrow
    }<tr><td>&nbsp;</td></tr>${useremailinput
    }<tr><td>&nbsp;</td></tr><tr><th style="border:none">Password</th></tr><tr><td>` +
    '<input class="loginpass" pattern=".{8,}" title="8 characters minimum" type="password" name="password" ' +
    'style="width:300px;" value="" required></td></tr>' +
    '</tbody></table></div><div style="text-align:center;padding:2px;margin:10px;">' +
    '<div class="loginerror" style="color:red"></div>' +
    '<div><button style="display:none; margin-bottom:-22px;" type="button" class="loginbutton">Login</button>' +
    '<button style="display:none;margin-top:34px" class="resetpass" type="button">Reset Password</button></div></div></form>' +
    '<button class="nevermind" style="margin-left:12px;margin-top:20px" type="button">Cancel</button></div></div></form>';
    const home = document.getElementsByClassName('home');
    home[0].insertBefore(loginform, home[0].childNodes[0]);
    const elementsObj = { PATRIC: ['patric', 'uidheader', 'uidinput'], nArr: ['emailheader', 'emailinput'] };
    utils.showHideElements2(appName, elementsObj);
  }

  startup(appName) {
    this.createLoginForm(appName);
    const emailInput = document.getElementsByClassName('loginemail')[0];
    this.setEvents(emailInput, appName);
    const useridInput = document.getElementsByClassName('userid')[0];
    this.setEvents(useridInput, appName);
    const passwordInput = document.getElementsByClassName('loginpass')[0];
    this.setEvents(passwordInput, appName);
    const loginButton = document.getElementsByClassName('loginbutton')[0];
    loginButton.appName = appName;
    loginButton.fetchClient = this.fetch;
    loginButton.runFetch = this.runFetch;
    // loginButton.checkIfLoggedIn = this.checkIfLoggedIn;
    // loginButton.generateSession = this.generateSession;
    loginButton.addEventListener('click', this.logMeIn);
    const resetPB = document.getElementsByClassName('resetpass')[0];
    resetPB.fetchClient = this.fetch;
    resetPB.appName = appName;
    resetPB.runFetch = this.runFetch;
    resetPB.addEventListener('click', this.resetpass);
    const cancelButton = document.getElementsByClassName('nevermind')[0];
    cancelButton.addEventListener('click', () => {
      document.getElementsByClassName('LoginForm')[0].style.display = 'none';
    });
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'test') {
      document.getElementsByClassName('LoginForm')[0].scrollIntoView();
    }
  }

  setEvents(element, appName) {
    element.addEventListener('change', this.validateLogin);
    element.addEventListener('focus', this.validateLogin);
    element.addEventListener('keydown', this.validateLogin);
    element.addEventListener('keyup', this.validateLogin);
    element.appName = appName;
    element.buttonsErrors = this.buttonsErrors;
  }

  validateLogin(evt) {
    const appName = evt.target.appName;
    const buttonsErrors = evt.target.buttonsErrors;
    const useridValue = document.getElementsByClassName('userid')[0].value;
    const validpass = document.getElementsByClassName('loginpass')[0].checkValidity();
    const emailValue = document.getElementsByClassName('loginemail')[0].value;
    let message = '', validemail = document.getElementsByClassName('loginemail')[0].checkValidity();
    const edot = emailValue.split('.');
    if (edot.length === 1 || !validemail || emailValue === '') {
      validemail = false;
      message = '<p>Invalid email format</p>';
    }
    if (emailValue.split('@gmail').length > 1 || emailValue.split('@vt.edu').length > 1 || emailValue.split('@bi.vt.edu').length > 1) {
      validemail = false;
      message = '<p>Please click the Login with Google button</p>';
    }
    buttonsErrors(appName, message, validemail, validpass, useridValue);
  }

  buttonsErrors(appName, message, validemail, validpass, useridValue) {
    const resetpassButton = document.getElementsByClassName('resetpass')[0];
    const logbutton = document.getElementsByClassName('loginbutton')[0];
    logbutton.style.display = 'none';
    const loginErrorMessage = document.getElementsByClassName('loginerror')[0];
    loginErrorMessage.innerHTML = message;
    if (appName !== 'PATRIC' && validemail) {
      logbutton.style.display = 'block';
      loginErrorMessage.innerHTML = '';
    }
    if (appName === 'PATRIC' && useridValue !== '') {
      logbutton.style.display = 'block';
      loginErrorMessage.innerHTML = '';
    }
    if (!validpass) {
      logbutton.style.display = 'none';
      loginErrorMessage.innerHTML = '<p>Invalid password</p>';
    }
    if (useridValue !== '' || validemail) {
      resetpassButton.style.display = 'block';
    } else {
      resetpassButton.style.display = 'none';
    }
  }

  resetpass(evt) {
    const appName = evt.target.appName;
    const fetchClient = evt.target.fetchClient;
    const runFetch = evt.target.runFetch;
    let loginEmail = '';
    if (appName !== 'PATRIC') {
      loginEmail = document.getElementsByClassName('loginemail')[0].value;
    } else {
      loginEmail = document.getElementsByClassName('userid')[0].value;
    }
    const bodyData = { email: loginEmail };
    const fetchData = {
      method: 'PUT',
      body: JSON.stringify(bodyData),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };
    return runFetch(fetchClient, process.env.BackendUrl, '/auth/resetpass', fetchData, null, null, loginEmail);
  }

  logMeIn(evt) {
    console.log('going to log you in');
    const fetchClient = evt.target.fetchClient;
    const runFetch = evt.target.runFetch;
    const appName = evt.target.appName;
    let useridValue = '', emailValue = '';
    const passwordValue = document.getElementsByClassName('loginpass')[0].value;
    useridValue = document.getElementsByClassName('userid')[0].value;
    if (appName !== 'PATRIC') {
      emailValue = document.getElementsByClassName('loginemail')[0].value;
    }
    const bodyData = { email: emailValue, password: passwordValue, id: useridValue };
    const fetchData = {
      method: 'POST',
      body: JSON.stringify(bodyData),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };
    return runFetch(fetchClient, process.env.BackendUrl, '/auth/login', fetchData, appName, null);
  }

  runFetch(fetchClient, url, route, fetchData) {
    const loginform1 = document.getElementsByClassName('LoginForm');
    const messagediv = document.getElementsByClassName('loginerror')[0];
    let feurl = 'http://localhost:7000';
    /* istanbul ignore if */
    if (process.env.FrontendUrl !== undefined) {
      feurl = process.env.FrontendUrl;
    }
    return fetchClient(url + route, fetchData)
      .then(response => response.json())
      .then((data) => {
        if (data.token !== undefined) {
          localStorage.setItem('ndssl_id_token', data.token);
          localStorage.setItem('userEmail', data.email);
          // Login.app.auth.setToken(data.token);
          // if (appName === 'PATRIC') {
          //   //checkIfLoggedIn();
          //   generateSession(data.email);
          // }
          loginform1[0].style.display = 'none';
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'test') {
            window.location.href = `${feurl}/login/?token=true`;
          }
        }
        if (data.message) {
          messagediv.innerHTML = `<p style="text-align:left; padding-left:12px">${data.message}</p>`;
        }
        if (!data.message && !data.token && data.email) {
          loginform1[0].style.display = 'none';
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'test') {
            window.location.href = `${feurl}/userutil/?email=${data.email}&form=reset`;
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
module.exports = Login_;
