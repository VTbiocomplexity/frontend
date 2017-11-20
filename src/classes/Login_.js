const Fetch = require('isomorphic-fetch');
class Login_ {
  constructor() {
    this.backendUrl = 'http://localhost:7000';
    this.fetch = Fetch;
    this.frontendUrl = 'http://localhost:3000';
    this.appName = '';
    //window.onload(this.checkIfLoggedIn());
  }
  nevermind(className) {
    let regform1 = [];
    regform1 = document.getElementsByClassName(className);
    if (regform1.length > 0) {
      regform1[0].style.display = 'none';
    }
  }
  createLoginForm(appName){
    this.nevermind('LoginForm');
    this.nevermind('RegistrationForm');
    let useridrow = '';
    let useremailinput = '<tr class="emailheader"><th style="border:none">Email</th></tr><tr class="emailinput"><td>' +
    '<input class="loginemail" type="email" name="email" style="width:300px;" value="" required></td></tr>';
    useridrow = '<tr class="uidheader"><th style="border:none">Email or Userid</th></tr><tr class="uidinput"><td>' +
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
  }

  loginUser(appName) {
    this.createLoginForm(appName);
    if (appName !== 'PATRIC'){
      document.getElementsByClassName('uidheader')[0].style.display = 'none';
      document.getElementsByClassName('uidinput')[0].style.display = 'none';
      document.getElementsByClassName('nevermind')[0].style.display = 'none';
      let emailInput = document.getElementsByClassName('loginemail')[0];
      emailInput.appName = appName;
      emailInput.buttonsErrors = this.buttonsErrors;
      emailInput.addEventListener('change', this.validateLogin);
      emailInput.addEventListener('focus', this.validateLogin);
      emailInput.addEventListener('keydown', this.validateLogin);
      emailInput.addEventListener('keyup', this.validateLogin);
    } else {
      document.getElementsByClassName('emailheader')[0].style.display = 'none';
      document.getElementsByClassName('emailinput')[0].style.display = 'none';
      let useridInput = document.getElementsByClassName('userid')[0];
      useridInput.addEventListener('change', this.validateLogin);
      useridInput.addEventListener('focus', this.validateLogin);
      useridInput.addEventListener('keydown', this.validateLogin);
      useridInput.addEventListener('keyup', this.validateLogin);
      useridInput.appName = appName;
      useridInput.buttonsErrors = this.buttonsErrors;
    }
    let passwordInput = document.getElementsByClassName('loginpass')[0];
    passwordInput.addEventListener('change', this.validateLogin);
    passwordInput.addEventListener('focus', this.validateLogin);
    passwordInput.addEventListener('keydown', this.validateLogin);
    passwordInput.addEventListener('keyup', this.validateLogin);
    passwordInput.appName = appName;
    passwordInput.buttonsErrors = this.buttonsErrors;
    let loginButton = document.getElementsByClassName('loginbutton')[0];
    loginButton.appName = appName;
    loginButton.fetchClient = this.fetch;
    loginButton.checkIfLoggedIn = this.checkIfLoggedIn;
    loginButton.generateSession = this.generateSession;
    loginButton.addEventListener('click', this.logMeIn);
    let resetPB = document.getElementsByClassName('resetpass')[0];
    resetPB.fetchClient = this.fetch;
    resetPB.appName = appName;
    resetPB.messageDiv = document.getElementsByClassName('loginerror')[0];
    resetPB.addEventListener('click', this.resetpass);
    let cancelButton = document.getElementsByClassName('nevermind')[0];
    cancelButton.addEventListener('click', function(){
      document.getElementsByClassName('LoginForm')[0].style.display = 'none';
    });
  }

  validateLogin(evt) {
    let appName = evt.target.appName;
    let buttonsErrors = evt.target.buttonsErrors;
    //console.log(appName);
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
    let loginErrorMessage = document.getElementsByClassName('loginerror')[0];
    if (appName !== 'PATRIC') {
      if (validemail && validpass) {
        logbutton.style.display = 'block';
        loginErrorMessage.innerHTML = '';
      } else {
        logbutton.style.display = 'none';
        loginErrorMessage.innerHTML = message;
        if (message === ''){
          loginErrorMessage.innerHTML = '<p>Invalid email or password</p>';
        }
      }
      if (validemail) {
        resetpassButton.style.display = 'block';
      } else {
        resetpassButton.style.display = 'none';
      }
    }
    if (appName === 'PATRIC') {
      if (validpass && useridValue !== '') {
        logbutton.style.display = 'block';
        loginErrorMessage.innerHTML = '';
      } else {
        logbutton.style.display = 'none';
        loginErrorMessage.innerHTML = '<p>Invalid password or Userid</p>';
      }
      if (useridValue !== '') {
        resetpassButton.style.display = 'block';
      } else {
        resetpassButton.style.display = 'none';
      }
    }
  }

  resetpass(evt) {
    let appName = evt.target.appName;
    let fetchClient = evt.target.fetchClient;
    let messageDiv = evt.target.messageDiv;
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
    return fetchClient('http://localhost:7000' + '/auth/resetpass', fetchData)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.message) {
        messageDiv.innerHTML = '<p style="text-align:left; padding-left:12px">' + data.message + '</p>';
      } else {
        let regform1 = [];
        regform1 = document.getElementsByClassName('LoginForm');
        regform1[0].style.display = 'none';
        window.location.href = 'http://localhost:9000' + '/userutil/?email=' + loginEmail + '&form=reset';
      }
    })
    .catch((error) => {
      console.log(error);
    });
  }
  logMeIn(evt) {
    console.log('going to log you in');
    let fetchClient = evt.target.fetchClient;
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
    return fetchClient('http://localhost:7000' + '/auth/login', fetchData)
    .then((response) => response.json())
    .then((data) => {
      if (data.token !== undefined) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('useremail', data.email);
        if (appName === 'PATRIC') {
          checkIfLoggedIn();
          generateSession(data.email);
        }
        let regform1 = [];
        regform1 = document.getElementsByClassName('LoginForm');
        regform1[0].style.display = 'none';
        window.location.href = 'http://localhost:9000' + '/';
      }
      if (data.message) {
        let messagediv = document.getElementsByClassName('loginerror')[0];
        messagediv.innerHTML = '<p style="text-align:left; padding-left:12px">' + data.message + '</p>';
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
    return this.fetch('this.backendUrl' + '/user/', fetchData)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    });
  }
}
module.exports = Login_;
