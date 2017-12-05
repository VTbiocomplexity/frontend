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
  }
  attached() {
    this.userActClass = new Uact();
    // let optionRequired = document.getElementById('optrequired');
    // console.log(optionRequired);
    // optionRequired.innerHTML += ' <span style="red">*</span>';
  }

  updateUserPrefs() {
    console.log('update user prefs');
    let fname = document.getElementsByClassName('uprofFirstName')[0].value;
    let fspace = fname.split(' ');
    let lname = document.getElementsByClassName('uprofLastName')[0].value;
    let lspace = lname.split(' ');
    if (fname === '' || lname === '' || fspace.length > 1 || lspace.length > 1) {
      console.log('not valid');
      return document.getElementsByClassName('formerrors')[0].innerHTML = '<p>Name is not valid, please fix</p>';
    }
    if (this.user.userType === '') {
      return document.getElementsByClassName('formerrors')[0].innerHTML = '<p>Select a primary user type.</p>';
    }
    document.getElementsByClassName('formerrors')[0].innerHTML = '';
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
