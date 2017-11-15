const Fetch = require('isomorphic-fetch');
class Register {
  constructor() {
    this.backendUrl = 'http://localhost:7000';
    this.fetch = Fetch;
    this.frontendUrl = 'http://localhost:3000';
    this.appName = '';
    //window.onload(this.checkIfLoggedIn());
  }
  checkIfLoggedIn() {
    console.log('checking if I am already logged in');
    if (localStorage.getItem('token') !== null) {
      //let hideWithAuth = [];
      let hideWithAuth = document.getElementsByClassName('HideWAuth');
      console.log('this is local storage :' + localStorage.getItem('token'));
      if (hideWithAuth.length > 0){
        hideWithAuth[0].style.display = 'none';
      }
      console.log('this is the hide with auth element' + hideWithAuth);
      let showWithAuth = document.getElementsByClassName('ShowWAuth');
      if (showWithAuth.length > 0){
        showWithAuth[0].style.display = 'block';
      }
    }
  }
  createRegistrationForm(appName){
    //console.log('show me a registration form here!');
    this.nevermind('LoginForm');
    this.nevermind('RegistrationForm');
    this.appName = appName;
    let useridrow = '';
    let primaryAppSelector = '';
    if (this.appName === 'PATRIC') {
      useridrow = '<th colspan="2">Userid (optional)</th></tr><tr><td colspan="2"><div style="width:100%"><input class="userid" type="text" name="userid" value=""></div></td>';
    } else {
      primaryAppSelector = '<tr><td><label style="display:inline">Primary App </label><select class="pas"><option value=""> </option><option value="PATRIC">PATRIC</option></select></td></tr>';
    }
    const regform = document.createElement('div');
    regform.className = 'RegistrationForm';
    regform.innerHTML = '<h2 style="margin:0px;padding:4px;font-size:1.2em;text-align:center;background:#eee;">User Registration</h2>' +
    '<form class=""><div style="padding:2px; margin:10px;"><table><tbody>' + primaryAppSelector +
    '<tr><th>First Name <span style="color:red">*</span></th><th>Last Name <span style="color:red">*</span></th></tr><tr><td width="150px">' +
    '<input class="firstname" type="text" name="first_name" style="width:150px;" required>' +
    '</td><td><input class="lastname" type="text" name="last_name" style="width:150px;" required>' +
    '</td></tr><tr><th colspan="1">Email Address <span style="color:red">*</span></th><th colspan="1">Password <span style="color:red">*</span></th></tr><tr><td colspan="1">' +
    '<input class="email" type="email" name="email" style="width:100%;" required></td>' + '<td><input class="password" pattern=".{8,}" title="8 characters minimum" type="password" name="password" style="width:100%;" required>' +
    // '</td></tr><tr></tr><tr><td colspan="1">' +
    '</td></tr><tr class="userIdRow">' + useridrow + '</tr>' +
    '<tr><th colspan="2">Organization</th></tr><tr><td colspan="2"><div style="width:100%"><input class="organization" type="text" name="affiliation" value=""></div></td></tr>' +
    '<tr><th colspan="2">Organisms</th></tr><tr><td colspan="2"><div><input style="width:97%;" class="organisms" type="text" name="organisms" value=""></div></td></tr>' +
    '<tr><th colspan="2">Interests</th></tr><tr><td colspan="2"><div><textarea style="width:97%;" class="interests" rows="5" cols="50" name="interests" style="height:75px;" value=""></textarea></div></td></tr>' +
    '</tbody></table><p><span style="color:red">*</span> <i>Indicates required field</i></p></div><div style="text-align:center;padding:2px;margin:10px;">' +
    '<div class="registererror" style="color:red"></div>' +
    '<div><button type="button" class="registerbutton" style="display:none; margin-bottom:-22px">Register New User</button>' +
    '<button class="nevermind" type="button">Cancel</button></div></div></form>';
    const home = document.getElementsByClassName('home');
    home[0].insertBefore(regform, home[0].childNodes[0]);
    if (this.appName !== 'PATRIC'){
      document.getElementsByClassName('nevermind')[0].style.display = 'none';
    }
  }
  register(appName) {
    this.appName = appName;
    this.createRegistrationForm(this.appName);
    let firstNameInput = document.getElementsByClassName('firstname')[0];
    firstNameInput.addEventListener('change', this.validateReg);
    firstNameInput.addEventListener('focus', this.validateReg);
    firstNameInput.addEventListener('keydown', this.validateReg);
    firstNameInput.addEventListener('keyup', this.validateReg);
    let lastNameInput = document.getElementsByClassName('lastname')[0];
    lastNameInput.addEventListener('change', this.validateReg);
    lastNameInput.addEventListener('focus', this.validateReg);
    lastNameInput.addEventListener('keydown', this.validateReg);
    lastNameInput.addEventListener('keyup', this.validateReg);
    let emailInput = document.getElementsByClassName('email')[0];
    emailInput.addEventListener('change', this.validateReg);
    emailInput.addEventListener('focus', this.validateReg);
    emailInput.addEventListener('keydown', this.validateReg);
    emailInput.addEventListener('keyup', this.validateReg);
    let passInput = document.getElementsByClassName('password')[0];
    passInput.addEventListener('change', this.validateReg);
    passInput.addEventListener('focus', this.validateReg);
    passInput.addEventListener('keydown', this.validateReg);
    passInput.addEventListener('keyup', this.validateReg);
    let registerEventButton = document.getElementsByClassName('registerbutton')[0];
    registerEventButton.fetchClient = this.fetch;
    registerEventButton.addEventListener('click', this.createUser);
    let cancelButton = document.getElementsByClassName('nevermind')[0];
    cancelButton.addEventListener('click', function(){
      document.getElementsByClassName('RegistrationForm')[0].style.display = 'none';
    });
    if (this.appName !== 'PATRIC'){
      let pas2 = document.getElementsByClassName('pas')[0];
      pas2.addEventListener('change', this.updateRegForm);
      pas2.addEventListener('change', this.validateReg);
    }
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'test'){
      document.getElementsByClassName('RegistrationForm')[0].scrollIntoView();
    }
  }

  updateRegForm(){
    console.log('inside this function');
    let primApp = document.getElementsByClassName('pas')[0].value;
    let uidRow = document.getElementsByClassName('userIdRow')[0];
    if (primApp === 'PATRIC'){
      uidRow.innerHTML = '<td colspan="2" style="padding-top:14px;"><label style="display:inline;">Userid (optional) </label><input class="userid" type="text" name="userid" value=""></td>';
      document.getElementsByClassName('registererror')[0].innerHTML = '';
      this.appName = 'PATRIC';
      console.log(this.appName);
    } else {
      uidRow.innerHTML = '';
      this.appName = primApp;
    }
  }

  validateReg() {
    let fname = document.getElementsByClassName('firstname')[0].value;
    let fspace = fname.split(' ');
    let lname = document.getElementsByClassName('lastname')[0].value;
    let lspace = lname.split(' ');
    let email = document.getElementsByClassName('email')[0].value;
    let edot = email.split('.');
    let validemail = document.getElementsByClassName('email')[0];
    let password = document.getElementsByClassName('password')[0].value;
    let pspace = password.split(' ');
    let primaryApp = '';
    if (document.getElementsByClassName('pas').length > 0){
      primaryApp = document.getElementsByClassName('pas')[0].value;
    }
    if (document.getElementsByClassName('pas').length === 0){
      primaryApp = 'PATRIC';
    }
    let googleAccount = false;
    if (email.split('@gmail').length > 1 || email.split('@vt.edu').length > 1 || email.split('@bi.vt.edu').length > 1){
      if (primaryApp !== 'PATRIC'){
        googleAccount = true;
      }
    }
    let validpass = document.getElementsByClassName('password')[0];
    let nameError = false;
    let pwError = false;
    let emError = false;
    if (fname === '' || lname === '' || fspace.length > 1 || lspace.length > 1){
      nameError = true;
    }
    if (pspace.length > 1 || !validpass.checkValidity() || password === ''){
      pwError = true;
    }
    if (!validemail.checkValidity() || edot.length === 1 || email === ''){
      emError = true;
    }
    this.displayRegError(nameError, emError, pwError, googleAccount);
    // let registbutton = document.getElementsByClassName('registerbutton')[0];
    // let regError = document.getElementsByClassName('registererror')[0];
    // if (!nameError && !emError && !pwError && !googleAccount) {
    //   registbutton.style.display = 'block';
    // } else {
    //   registbutton.style.display = 'none';
    // }
    // if (googleAccount){
    //   regError.innerHTML = '<p>Please scroll up and click the Login with Google button</p>';
    // } else if (nameError){
    //   regError.innerHTML = '<p>Name format is not valid</p>';
    // } else if (emError){
    //   regError.innerHTML = '<p>Email format is not valid</p>';
    // } else if (pwError){
    //   regError.innerHTML = '<p>Password format is not valid</p>';
    // } else {regError.innerHTML = '';}
  }

  displayRegError(nameError, emError, pwError, googleAccount){
    let registbutton = document.getElementsByClassName('registerbutton')[0];
    let regError = document.getElementsByClassName('registererror')[0];
    if (!nameError && !emError && !pwError && !googleAccount) {
      registbutton.style.display = 'block';
    } else {
      registbutton.style.display = 'none';
    }
    if (googleAccount){
      regError.innerHTML = '<p>Please scroll up and click the Login with Google button</p>';
    } else if (nameError){
      regError.innerHTML = '<p>Name format is not valid</p>';
    } else if (emError){
      regError.innerHTML = '<p>Email format is not valid</p>';
    } else if (pwError){
      regError.innerHTML = '<p>Password format is not valid</p>';
    } else {regError.innerHTML = '';}
  }

  createUser(evt) {
    let fetchClient = evt.target.fetchClient;
    let firstname = document.getElementsByClassName('firstname')[0].value;
    let primaryAppValue = '';
    if (document.getElementsByClassName('pas').length > 0){
      primaryAppValue = document.getElementsByClassName('pas')[0].value;
    }
    let lastname = document.getElementsByClassName('lastname')[0].value;
    let orgString = '';
    orgString += document.getElementsByClassName('organization')[0].value;
    let organismString = '';
    organismString += document.getElementsByClassName('organisms')[0].value;
    let userdetString = '';
    userdetString += document.getElementsByClassName('interests')[0].value;
    let useridValue = '';
    if (document.getElementsByClassName('userid').length > 0){
      useridValue = document.getElementsByClassName('userid')[0].value;
    }
    let messagediv = document.getElementsByClassName('registererror')[0];
    let bodyData = {'name': firstname + ' ' + lastname, 'email': document.getElementsByClassName('email')[0].value, 'password': document.getElementsByClassName('password')[0].value,
      'first_name': firstname, 'last_name': lastname, 'affiliation': orgString, 'organisms': organismString, 'interests': userdetString, 'id': useridValue, 'primaryApp': primaryAppValue};
    //console.log(bodyData);
    let fetchData = {
      method: 'POST',
      //credentials: 'same-origin',
      body: JSON.stringify(bodyData),
      headers: {
        //'X-CSRFTOKEN': cookieToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    return fetchClient('http://localhost:7000' + '/auth/signup', fetchData)
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        messagediv.innerHTML = '<p style="text-align:left;padding-left:12px">' + data.message + '</p>';
      } else {
        document.getElementsByClassName('RegistrationForm')[0].style.display = 'none';
        if (data.email) {
          window.location.href = 'http://localhost:9000' + '/userutil/?email=' + data.email;
        }
      }
    })
    .catch((error) => {
      console.log(error);
    });
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
    }
    let passwordInput = document.getElementsByClassName('loginpass')[0];
    passwordInput.addEventListener('change', this.validateLogin);
    passwordInput.addEventListener('focus', this.validateLogin);
    passwordInput.addEventListener('keydown', this.validateLogin);
    passwordInput.addEventListener('keyup', this.validateLogin);
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
    //let useridValue = '';
    let useridValue = document.getElementsByClassName('userid')[0].value;
    //console.log('user id value: ' + useridValue);
    let validpass = document.getElementsByClassName('loginpass')[0].checkValidity();
    let logbutton = document.getElementsByClassName('loginbutton')[0];
    let loginErrorMessage = document.getElementsByClassName('loginerror')[0];
    let resetpassButton = document.getElementsByClassName('resetpass')[0];
    //let validemail = false;
    //let emailValue = '';
    //let edot = '';
    let emailValue = document.getElementsByClassName('loginemail')[0].value;
    let validemail = document.getElementsByClassName('loginemail')[0].checkValidity();
    //if (emailValue !== ''){
      //let emailInput = document.getElementsByClassName('loginemail')[0];
      //validemail = emailInput.checkValidity();
    let edot = emailValue.split('.');
      //console.log(edot.length);
    if (edot.length === 1 || !validemail || emailValue === ''){
      validemail = false;
      loginErrorMessage.innerHTML = '<p>Invalid email format</p>';
    }
    if (emailValue.split('@gmail').length > 1 || emailValue.split('@vt.edu').length > 1 || emailValue.split('@bi.vt.edu').length > 1){
      validemail = false;
      loginErrorMessage.innerHTML = '<p>Please click the Login with Google button</p>';
    }
  //  }
    //let edot = validemail.split('.');

    if (appName !== 'PATRIC') {
      if (validemail && validpass) {
        logbutton.style.display = 'block';
        loginErrorMessage.innerHTML = '';
      } else {
        logbutton.style.display = 'none';
        if (loginErrorMessage.innerHTML === ''){
          loginErrorMessage.innerHTML = '<p>Invalid email or password</p>';
        }
      }
      if (validemail) {
        resetpassButton.style.display = 'block';
        //loginErrorMessage.innerHTML = '';
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
        //loginErrorMessage.innerHTML = '';
      } else {
        resetpassButton.style.display = 'none';
      }
    }
    // if (emailValue !== '' && emailValue !== '1' && emailValue !== 1 && emailValue !== undefined) {
    //   console.log(emailValue);
    //   if (validemail) {
    //     resetpassButton.style.display = 'block';
    //     //loginErrorMessage.innerHTML = '';
    //   } else {
    //     resetpassButton.style.display = 'none';
    //   }
    // }
    // if (useridValue !== '' && useridValue !== '1' && useridValue !== 1) {
    //   resetpassButton.style.display = 'block';
    //   //loginErrorMessage.innerHTML = '';
    // } else {
    //   resetpassButton.style.display = 'none';
    // }
    // if (emailValue !== '' && emailValue !== '1' && emailValue !== 1 && emailValue !== undefined) {
    //   console.log(emailValue);
    //   if (validemail) {
    //     resetpassButton.style.display = 'block';
    //     //loginErrorMessage.innerHTML = '';
    //   } else {
    //     resetpassButton.style.display = 'none';
    //   }
    // }
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
        console.log(data.message);
        //let messagediv = document.getElementsByClassName('loginerror')[0];
        //console.log(messagediv);
        messageDiv.innerHTML = '<p style="text-align:left; padding-left:12px">' + data.message + '</p>';
      } else {
        //this.nevermind('LoginForm');
        let regform1 = [];
        regform1 = document.getElementsByClassName('LoginForm');
        // if (regform1.length > 0) {
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

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('useremail');
    let hideWithAuth = document.getElementsByClassName('HideWAuth')[0];
    hideWithAuth.style.display = 'block';
    let showWithAuth = document.getElementsByClassName('ShowWAuth')[0];
    showWithAuth.style.display = 'none';
    window.location.href = this.frontendUrl + '/';
  }

  generateSession(useremail) {
    //fetch the user with the auth header
    console.log('put some cool code here for session and cookie and storage or something for this user: ' + useremail);
    let bodyData = {'email': useremail };
    //var cookieToken = getCookieToken();
    let fetchData = {
      method: 'POST',
      //credentials: 'same-origin',
      body: JSON.stringify(bodyData),
      headers: {
        //'X-CSRFTOKEN': cookieToken,
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

  userAccount() {
    window.location.href = this.frontendUrl + '/userutil/?form=prefs';
  }

}

module.exports = Register;
