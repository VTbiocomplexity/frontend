const Fetch = require('isomorphic-fetch');
const patric = require('../commons/patric.js');
class Login_ {
  constructor() {
    this.fetch = Fetch;
    this.appName = '';
  }

  createLoginForm(appName){
    patric.nevermind('LoginForm');
    patric.nevermind('RegistrationForm');
    let useremailinput = '<tr class="emailheader"><th style="border:none">Email</th></tr><tr class="emailinput"><td>' +
    '<input class="loginemail" type="email" name="email" style="width:300px;" value="" required></td></tr>';
    let useridrow = '<tr class="uidheader"><th style="border:none">Email or Userid</th></tr><tr class="uidinput"><td>' +
    '<input class="userid" name="userid" style="width:300px;" value="" required></tr></td>';
    let loginform = document.createElement('div');
    loginform.className = 'LoginForm';
    loginform.innerHTML = '<h2 style="margin:0px;padding:4px;font-size:1.2em;text-align:center;background:#eee;">User Login</h2>' +
    '<form><div style="padding:2px; margin:10px;"><table><tbody>' + useridrow +
    '<tr><td>&nbsp;</td></tr>' + useremailinput +
    '<tr><td>&nbsp;</td></tr><tr><th style="border:none">Password</th></tr><tr><td>' +
    '<input class="loginpass" pattern=".{8,}" title="8 characters minimum" type="password" name="password" style="width:300px;" value="" required></td></tr>' +
    '</tbody></table></div><div style="text-align:center;padding:2px;margin:10px;">' +
    '<div class="loginerror" style="color:red"></div>' +
    '<div><button style="display:none; margin-bottom:-22px;" type="button" class="loginbutton">Login</button>' +
    '<button style="display:none;margin-top:34px" class="resetpass" type="button">Reset Password</button></div></div></form>' +
    '<button class="nevermind" style="margin-left:12px;margin-top:20px" type="button">Cancel</button></div></div></form>';
    let home = document.getElementsByClassName('home');
    home[0].insertBefore(loginform, home[0].childNodes[0]);
    let pArr = ['uidheader', 'uidinput', 'nevermind'];
    let nArr = ['emailheader', 'emailinput'];
    patric.showHideElements(appName, pArr, nArr);
  }

  loginUser(appName) {
    this.createLoginForm(appName);
    let emailInput = document.getElementsByClassName('loginemail')[0];
    this.setEvents(emailInput, appName);
    let useridInput = document.getElementsByClassName('userid')[0];
    this.setEvents(useridInput, appName);
    let passwordInput = document.getElementsByClassName('loginpass')[0];
    this.setEvents(passwordInput, appName);
    let loginButton = document.getElementsByClassName('loginbutton')[0];
    loginButton.appName = appName;
    loginButton.fetchClient = this.fetch;
    loginButton.runFetch = this.runFetch;
    loginButton.checkIfLoggedIn = this.checkIfLoggedIn;
    loginButton.generateSession = this.generateSession;
    loginButton.addEventListener('click', this.logMeIn);
    let resetPB = document.getElementsByClassName('resetpass')[0];
    resetPB.fetchClient = this.fetch;
    resetPB.appName = appName;
    resetPB.runFetch = this.runFetch;
    resetPB.addEventListener('click', this.resetpass);
    let cancelButton = document.getElementsByClassName('nevermind')[0];
    cancelButton.addEventListener('click', function(){
      document.getElementsByClassName('LoginForm')[0].style.display = 'none';
    });
  }

  setEvents(element, appName){
    element.addEventListener('change', this.validateLogin);
    element.addEventListener('focus', this.validateLogin);
    element.addEventListener('keydown', this.validateLogin);
    element.addEventListener('keyup', this.validateLogin);
    element.appName = appName;
    element.buttonsErrors = this.buttonsErrors;
  }

  validateLogin(evt) {
    let appName = evt.target.appName;
    let buttonsErrors = evt.target.buttonsErrors;
    let useridValue = document.getElementsByClassName('userid')[0].value;
    let validpass = document.getElementsByClassName('loginpass')[0].checkValidity();
    let emailValue = document.getElementsByClassName('loginemail')[0].value;
    let validemail = document.getElementsByClassName('loginemail')[0].checkValidity();
    let edot = emailValue.split('.');
    let message = '';
    if (edot.length === 1 || !validemail || emailValue === ''){
      validemail = false;
      message = '<p>Invalid email format</p>';
    }
    if (emailValue.split('@gmail').length > 1 || emailValue.split('@vt.edu').length > 1 || emailValue.split('@bi.vt.edu').length > 1){
      validemail = false;
      message = '<p>Please click the Login with Google button</p>';
    }
    buttonsErrors(appName, message, validemail, validpass, useridValue);
  }

  buttonsErrors(appName, message, validemail, validpass, useridValue){
    let resetpassButton = document.getElementsByClassName('resetpass')[0];
    let logbutton = document.getElementsByClassName('loginbutton')[0];
    logbutton.style.display = 'none';
    let loginErrorMessage = document.getElementsByClassName('loginerror')[0];
    loginErrorMessage.innerHTML = message;
    if (appName !== 'PATRIC' && validemail) {
      logbutton.style.display = 'block';
      loginErrorMessage.innerHTML = '';
    }
    if (appName === 'PATRIC' && useridValue !== '') {
      logbutton.style.display = 'block';
      loginErrorMessage.innerHTML = '';
    }
    if (!validpass){
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
    let appName = evt.target.appName;
    let fetchClient = evt.target.fetchClient;
    let runFetch = evt.target.runFetch;
    let loginEmail = '';
    if (appName !== 'PATRIC') {
      loginEmail = document.getElementsByClassName('loginemail')[0].value;
    } else {
      loginEmail = document.getElementsByClassName('userid')[0].value;
    }
    let bodyData = {'email': loginEmail };
    let fetchData = {
      method: 'PUT',
      body: JSON.stringify(bodyData),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    return runFetch(fetchClient, process.env.BackendUrl, '/auth/resetpass', fetchData);
  }

  logMeIn(evt) {
    console.log('going to log you in');
    let fetchClient = evt.target.fetchClient;
    let runFetch = evt.target.runFetch;
    let appName = evt.target.appName;
    let checkIfLoggedIn = evt.target.checkIfLoggedIn;
    let generateSession = evt.target.generateSession;
    let useridValue = '';
    let emailValue = '';
    const passwordValue = document.getElementsByClassName('loginpass')[0].value;
    useridValue = document.getElementsByClassName('userid')[0].value;
    if (appName !== 'PATRIC') {
      emailValue = document.getElementsByClassName('loginemail')[0].value;
    }
    let bodyData = {'email': emailValue, 'password': passwordValue, 'id': useridValue };
    let fetchData = {
      method: 'POST',
      body: JSON.stringify(bodyData),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    return runFetch(fetchClient, process.env.BackendUrl, '/auth/login', fetchData, checkIfLoggedIn, generateSession, appName);
  }

  runFetch(fetchClient, url, route, fetchData, checkIfLoggedIn, generateSession, appName){
    let loginform1 = document.getElementsByClassName('LoginForm');
    let messagediv = document.getElementsByClassName('loginerror')[0];
    let feurl = 'http://localhost:7000';
    /* istanbul ignore if */
    if (process.env.FrontendUrl !== undefined){
      feurl = process.env.FrontendUrl;
    }
    return fetchClient(url + route, fetchData)
    .then((response) => response.json())
    .then((data) => {
      if (data.token !== undefined) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('useremail', data.email);
        if (appName === 'PATRIC') {
          checkIfLoggedIn();
          generateSession(data.email);
        }
        loginform1[0].style.display = 'none';
        window.location.href = feurl + '/';
      }
      if (data.message) {
        messagediv.innerHTML = '<p style="text-align:left; padding-left:12px">' + data.message + '</p>';
      }
      if (!data.message && !data.token) {
        loginform1[0].style.display = 'none';
        window.location.href = feurl + '/userutil/?email=' + loginEmail + '&form=reset';
      }
    })
    .catch((error) => {
      console.log(error);
    });
  }

  generateSession(useremail) {
    console.log('put some cool code here for session and cookie and storage or something for this user: ' + useremail);
    let bodyData = {'email': useremail };
    let fetchData = {
      method: 'POST',
      body: JSON.stringify(bodyData),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    };
    return this.fetch(process.env.BackendUrl + '/user/', fetchData)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    });
  }
}
module.exports = Login_;
