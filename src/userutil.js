const User = require('./classes/user_.js');
export class UserUtil {
//  this.app = app;
  constructor(){
    this.userClass = {};
  //console.log(this.registerClass.register);
  //this.nevermind = this.registerClass.nevermind;
  }
  // activate(){
  //   this.userClass.verifyEmail();
  // }
  attached(){
    this.userClass = new User();
  }
}
