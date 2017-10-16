import {inject} from 'aurelia-framework';
import {App} from './app';
@inject(App)
export class Login {
  constructor(app){
    this.app = app;
  }

  attached() {
    this.title = this.app.router.currentInstruction.config.title;
    //console.log('in the login module true means ohaf login ' + this.app.appState.isOhafLogin);
  }

  authenticate(name){
    //delete all login database objects
    //create a new login database object, set isOhafLogin attribute
    //console.log('in auth');
    let ret;
    // if (this.app.appState.isOhafLogin){
    //   ret = this.app.auth.authenticate(name, false, {'isOhafUser': true });
    // } else {
    //TODO set isDeveloper to true if node env is development
    ret = this.app.auth.authenticate(name, false, {'isDeveloper': false });
    //}
    ret.then((data) => {
      this.app.auth.setToken(data.token);
      //this.app.checkUser();
    }, undefined);
    return ret;
  }
}
