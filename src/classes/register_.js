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
    let fetchData = {
      method: 'POST',
      body: JSON.stringify(bodyData),
      headers: {
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

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('useremail');
    let hideWithAuth = document.getElementsByClassName('HideWAuth')[0];
    hideWithAuth.style.display = 'block';
    let showWithAuth = document.getElementsByClassName('ShowWAuth')[0];
    showWithAuth.style.display = 'none';
    window.location.href = this.frontendUrl + '/';
  }

  userAccount() {
    window.location.href = this.frontendUrl + '/userutil/?form=prefs';
  }

}

module.exports = Register;
