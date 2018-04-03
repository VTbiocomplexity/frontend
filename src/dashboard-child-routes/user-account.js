const Uact = require('../classes/UserAccount.js');
import {inject} from 'aurelia-framework';
import {App} from '../app';
@inject(App)
export class UserAccount {
  constructor(app) {
    this.app = app;
    this.userActClass = {};
  }
  async activate() {
    this.userTypes = JSON.parse(process.env.userRoles).roles;
    this.uid = this.app.auth.getTokenPayload().sub;
    this.user = await this.app.appState.getUser(this.uid);
    this.canChangeUserType = true;
    console.log(this.user);
  }
  attached() {
    this.userActClass = new Uact(this.uid);
    this.checkUserRole();
    // let optionRequired = document.getElementById('optrequired');
    // console.log(optionRequired);
    // optionRequired.innerHTML += ' <span style="red">*</span>';
  }

  checkUserRole() {
    let button = document.getElementsByClassName('updateprofbutton')[0];
    let errMessages = document.getElementsByClassName('formerrors')[0];
    if (this.user.userType === '') {
      button.setAttribute('disabled', true);
      return errMessages.innerHTML += '<p>Select a primary user type.</p>';
    }
    errMessages.innerHTML = errMessages.innerHTML.replace('<p>Select a primary user type.</p>', '');
    if (errMessages.innerHTML === '') {
      button.removeAttribute('disabled');
    }
    //document.getElementsByClassName('formerrors')[0].innerHTML = '';
  }

  checkName() {
    let button = document.getElementsByClassName('updateprofbutton')[0];
    let errMessages = document.getElementsByClassName('formerrors')[0];
    let fname = document.getElementsByClassName('uprofFirstName')[0].value;
    let fspace = fname.split(' ');
    let lname = document.getElementsByClassName('uprofLastName')[0].value;
    let lspace = lname.split(' ');
    if (fname === '' || lname === '' || fspace.length > 1 || lspace.length > 1) {
      button.setAttribute('disabled', true);
      if (errMessages.innerHTML.indexOf('<p>Name is not valid, please fix</p>') === -1) {
        errMessages.innerHTML += '<p>Name is not valid, please fix</p>';
      }
      return;
    }
    errMessages.innerHTML = errMessages.innerHTML.replace('<p>Name is not valid, please fix</p>', '');
    if (errMessages.innerHTML === '') {
      button.removeAttribute('disabled');
    }
  }

  updateUserPrefs() {
    this.userActClass.updateUserPrefs(this.user.userType);
  }

  changeUserEmail() {
    let isemailvalid = document.getElementsByClassName('uprofEmail')[0].checkValidity();
    let emValue = document.getElementsByClassName('uprofEmail')[0].value;
    let edot = emValue.split('.');
    if (isemailvalid && edot.length > 1) {
      document.getElementsByClassName('formerrors')[0].innerHTML = '';
      this.userActClass.changeUserEmail();
    } else {
      document.getElementsByClassName('formerrors')[0].innerHTML = '<p>Email address is not valid</p>';
    }
  }
}
