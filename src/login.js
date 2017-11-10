import {inject} from 'aurelia-framework';
import {App} from './app';
import {Register} from './classes/register_.js';
@inject(App)
export class Login {
  constructor(app){
    this.app = app;
    this.registerClass = new Register();
    //console.log(this.registerClass.register);
    //this.nevermind = this.registerClass.nevermind;
  }

  attached() {
    this.title = this.app.router.currentInstruction.config.title;
    //console.log('in the login module true means ohaf login ' + this.app.appState.isOhafLogin);
  }

  showRegister(app){
    this.registerClass.register(app);
  }

  showLogin(app){
    this.registerClass.loginUser(app);
  }

  validateLogin(){
    console.log('howdy');
  }

  // nevermind(form){
  //   this.registerClass.nevermind(form);
  // }

  authenticate(name){
    //delete all login database objects
    //create a new login database object, set isOhafLogin attribute
    //console.log('in auth');
    let ret;
    // if (this.app.appState.isOhafLogin){
    //   ret = this.app.auth.authenticate(name, false, {'isOhafUser': true });
    // } else {
    // let developer = false;
    // if (process.env.NODE_ENV === 'development'){
    //
    // }
    ret = this.app.auth.authenticate(name, false, {'role': process.env.role });
    //}
    ret.then((data) => {
      this.app.auth.setToken(data.token);
      //this.app.checkUser();
    }, undefined);
    return ret;
  }
}
