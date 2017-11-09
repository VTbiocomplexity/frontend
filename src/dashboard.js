import {inject} from 'aurelia-framework';
import {App} from './app';
import {json} from 'aurelia-fetch-client';
@inject(App)
export class Dashboard {
  constructor(app){
    this.app = app;
  }
  async activate() {
    this.userTypes = JSON.parse(process.env.userRoles).roles;
    this.uid = this.app.auth.getTokenPayload().sub;
    this.user = await this.app.appState.getUser(this.uid);
    //console.log(this.user);
    /* istanbul ignore else */
    if (this.user.userType === 'Developer'){
      this.userTypes.push('Developer');
    }
    //console.log('dashboard user type is ' + this.user.userType);
    // this.states = [ 'Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia',
    //   'Federated States of Micronesia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
    //   'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    //   'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico',
    //   'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Island', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
    //this.states.sort();
    console.log(this.user);
    if (this.user.userType !== undefined && this.user.userType !== '' && this.user.userType !== null){
      this.childRoute();
    }
    //this.setupValidation();
  }

  childRoute(){
    if (this.user.userType === 'Developer'){
      this.app.router.navigate('dashboard/developer');
    } else {
      this.app.router.navigate('/');
    }
  }

  async updateUser(){
    await fetch;
    this.app.httpClient.fetch('/user/' + this.uid, {
      method: 'put',
      body: json(this.user)
    })
    .then((response) => response.json())
    .then((data) => {
      this.app.appState.setUser(this.user);
      //this.app.appState.checkUserRole();
      //this.app.appState.newUser = false;
      this.activate();
    });
  }
}
