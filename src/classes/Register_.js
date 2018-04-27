const Fetch = require('isomorphic-fetch');
const utils = require('../commons/utils.js');

class Register_ {
  constructor() {
    this.fetch = Fetch;
    this.appName = '';
    this.utils = utils;
  }

  createRegistrationForm(appName) {
    this.utils.nevermind('LoginForm');
    this.utils.nevermind('RegistrationForm');
    this.appName = appName;
    const regform = document.createElement('div');
    regform.className = 'RegistrationForm';
    regform.innerHTML = '<h2 style="margin-top:20px;padding:4px;font-size:1.2em;text-align:center;background:#eee;">' +
    '<span class="appName"></span>User Registration</h2>' +
    '<form class=""><div style="padding:2px; margin:10px;"><table><tbody>' +
    '<tr><th>First Name <span style="color:red">*</span></th><th>Last Name <span style="color:red">*</span></th></tr><tr><td width="50%">' +
    '<input class="firstname" type="text" name="first_name" style="width:100%;" required>' +
    '</td><td><input class="lastname" type="text" name="last_name" style="width:100%;" required>' +
    '</td></tr><tr><th colspan="1">Email Address <span style="color:red">*</span></th>' +
    '<th colspan="1">Password <span style="color:red">*</span></th></tr><tr><td colspan="1">' +
    '<input class="email" type="email" name="email" style="width:100%;" required></td>' +
    '<td><input style="width:100%" class="password" pattern=".{8,}" title="8 characters minimum" ' +
    'type="password" name="password" style="width:100%;" required>' +
    '</td></tr>' +
    '<tr><th colspan="2">Job Title</th></tr><tr><td colspan="2"><input style="width:100%" class="organization"' +
    ' type="text" name="affiliation" value=""></td></tr>' +
    '<tr><th colspan="2">Area of Expertise</th></tr><tr><td colspan="2"><div><input style="width:100%;" ' +
    'class="expertise" type="text" name="expertise" value=""></div></td></tr>' +
    '<tr><th colspan="2">Other Interests</th></tr><tr><td colspan="2"><div><textarea style="width:100%;" ' +
    'class="interests" rows="5" cols="50" name="interests" style="height:75px;" value=""></textarea></div></td></tr>' +
    '</tbody></table><p><span style="color:red">*</span> <i>Indicates required field</i></p></div>' +
    '<div style="text-align:center;padding:2px;margin:10px;">' +
    '<div class="registererror" style="color:red"></div>' +
    '<div><button type="button" class="registerbutton" style="display:none; margin-bottom:-22px">Register New User</button>' +
    '<button class="nevermind" type="button" style="margin-top:2px">Cancel</button></div></div></form>';
    const home = document.getElementsByClassName('home');
    home[0].insertBefore(regform, home[0].childNodes[0]);
    document.getElementsByClassName('appName')[0].innerHTML = `${appName} `;
  }

  startup(appName) {
    this.appName = appName;
    this.createRegistrationForm(this.appName);
    const firstNameInput = document.getElementsByClassName('firstname')[0];
    this.setEvents(firstNameInput, appName);
    const lastNameInput = document.getElementsByClassName('lastname')[0];
    this.setEvents(lastNameInput, appName);
    const emailInput = document.getElementsByClassName('email')[0];
    this.setEvents(emailInput, appName);
    const passInput = document.getElementsByClassName('password')[0];
    this.setEvents(passInput, appName);
    const registerEventButton = document.getElementsByClassName('registerbutton')[0];
    registerEventButton.fetchClient = this.fetch;
    registerEventButton.runFetch = this.runFetch;
    registerEventButton.addEventListener('click', this.createUser);
    const cancelButton = document.getElementsByClassName('nevermind')[0];
    cancelButton.addEventListener('click', () => {
      document.getElementsByClassName('RegistrationForm')[0].style.display = 'none';
    });
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'test') {
      document.getElementsByClassName('RegistrationForm')[0].scrollIntoView();
    }
  }

  setEvents(element, appName) {
    element.addEventListener('change', this.validateReg);
    element.addEventListener('focus', this.validateReg);
    element.addEventListener('keydown', this.validateReg);
    element.addEventListener('keyup', this.validateReg);
    /* eslint-disable */
    element.displayError = this.displayRegError;
    element.validateGoogle = this.validateGoogle;
    element.appName = appName;
    /* eslint-enable */
  }

  validateReg(evt) {
    const displayError = evt.target.displayError;
    const validateGoogle = evt.target.validateGoogle;
    const appName = evt.target.appName;
    const fname = document.getElementsByClassName('firstname')[0].value;
    const fspace = fname.split(' ');
    const lname = document.getElementsByClassName('lastname')[0].value;
    const lspace = lname.split(' ');
    const email = document.getElementsByClassName('email')[0].value;
    const edot = email.split('.');
    const validemail = document.getElementsByClassName('email')[0];
    const password = document.getElementsByClassName('password')[0].value;
    const pspace = password.split(' ');
    const googleAccount = validateGoogle(email, appName);
    const validpass = document.getElementsByClassName('password')[0];
    let nameError = false, pwError = false, emError = false;
    if (fname === '' || lname === '' || fspace.length > 1 || lspace.length > 1) {
      nameError = true;
    }
    if (pspace.length > 1 || !validpass.checkValidity() || password === '') {
      pwError = true;
    }
    if (!validemail.checkValidity() || edot.length === 1 || email === '') {
      emError = true;
    }
    displayError(nameError, emError, pwError, googleAccount);
  }

  validateGoogle(email) {
    let googleAccount = false;
    if (email.split('@gmail').length > 1 || email.split('@vt.edu').length > 1 || email.split('@bi.vt.edu').length > 1) {
      googleAccount = true;
    }
    return googleAccount;
  }

  displayRegError(nameError, emError, pwError, googleAccount) {
    const registbutton = document.getElementsByClassName('registerbutton')[0];
    const regError = document.getElementsByClassName('registererror')[0];
    if (!nameError && !emError && !pwError && !googleAccount) {
      registbutton.style.display = 'block';
    } else {
      registbutton.style.display = 'none';
    }
    if (googleAccount) {
      regError.innerHTML = '<p>Please scroll up and click the Login with Google button</p>';
    } else if (nameError) {
      regError.innerHTML = '<p>Name format is not valid</p>';
    } else if (emError) {
      regError.innerHTML = '<p>Email format is not valid</p>';
    } else if (pwError) {
      regError.innerHTML = '<p>Password format is not valid</p>';
    } else { regError.innerHTML = ''; }
  }

  createUser(evt) {
    const fetchClient = evt.target.fetchClient;
    const firstname = document.getElementsByClassName('firstname')[0].value;
    const runFetch = evt.target.runFetch;
    const lastname = document.getElementsByClassName('lastname')[0].value;
    const orgString = document.getElementsByClassName('organization')[0].value;
    const expertisetring = document.getElementsByClassName('expertise')[0].value;
    const userdetString = document.getElementsByClassName('interests')[0].value;
    const bodyData = {
      name: `${firstname} ${lastname}`,
      email: document.getElementsByClassName('email')[0].value,
      password: document.getElementsByClassName('password')[0].value,
      first_name: firstname,
      last_name: lastname,
      affiliation: orgString,
      expertise: expertisetring,
      interests: userdetString
    };
    const fetchData = {
      method: 'POST',
      body: JSON.stringify(bodyData),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };
    return runFetch(fetchClient, `${process.env.BackendUrl}/auth/signup`, fetchData);
  }

  runFetch(fetchClient, url, route, fetchData) {
    const messagediv = document.getElementsByClassName('registererror')[0];
    return fetchClient(url, route, fetchData)
      .then(response => response.json())
      .then((data) => {
        if (data.message) {
          messagediv.innerHTML = `<p style="text-align:left;padding-left:12px">${data.message}</p>`;
        } else {
          document.getElementsByClassName('RegistrationForm')[0].style.display = 'none';
          if (data.email) {
          /* istanbul ignore if */
            if (process.env.NODE_ENV !== 'test') {
              window.location.href = `${process.env.FrontendUrl}/userutil/?email=${data.email}`;
            }
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  userAccount() {
    let feurl = 'http://localhost:7000';
    /* istanbul ignore if */
    if (process.env.FrontendUrl !== undefined) {
      feurl = process.env.FrontendUrl;
    }
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'test') {
      window.location.href = `${feurl}/userutil/?form=prefs`;
    }
  }
}

module.exports = Register_;
