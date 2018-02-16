import {inject} from 'aurelia-framework';
import {App} from '../app';
const jwtDecode = require('jwt-decode');
//import {json} from 'aurelia-fetch-client';
//import {VolumeService} from 'rafter';
@inject(App)
export class Rafter {
  constructor(app) {
    this.showLogin = true;
    this.app = app;
    this.rafterUserID = '';
    this.rafter = {
      id: '',
      password: ''
    };
    this.rafterFile = {name: ''};
    //   this.vs = new VolumeService('http://rafter.bi.vt.edu/volumesvc/', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6W10sImZpcnN0X25hbWUiOiJuZHNzbCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv' +
    //   '-i9vRVuzPJEWxPHhXZTSzLXiwPlLB5P9VOlzgDPhmVuPwx2n0q-T9hbV6vGt1E0EL-oKex1dpVE10iM0BWujXvQRC8gPJXhIBNR6zUDXX5ziO_8Y48CNWvKBDKhTjcrGEuj7CEMSt9kZBlgt-E_DnkibnFfHl763k_vPWqJ4okWkhELXtpCj7ObKrjNGRjYzKrMRyjJkIHLOc6ZEsTKkWt4ATzOXN_jVYFqN5tzRpMqiqC-G0oS-aSOiML6HZpqiEu26oLoQ4a6RDAXPp6Me9SXwkhw7K-JNDvW68LRyXIMnz7HisLWhc6-1XykgQ6MLcu4uvsOBD11VQpVmO-5Dkdf2vAlr7jbQ8tvKZaJi4W2PEiVIfR6lNhGPLyU4Zx4bg084tzi6n3jSipKcavfPY' +
    //   '-iNAbZOYDXlB8GKdDIEFpRQmO11Yyr1_B9OjRYFWrf1scdlLhdXcRQT33FHQo_sakhZMI36s50ksj6B4ghrEHhdvgE1TFBgMg6uyRiNiZiRVgd08kMok_JmlJrjGkqoUIgvZeC9NkjGU8YcV5bF5ZTeJpTlJ7l28W8fY_lkjOs4LBsxoJDdnrdGR-FsfFMQJajL4LEuwXGlpBHjfiLpqflRYhf8poDRU');
    // //   this.auth = auth;
    // //
  }

  async activate() {
    this.uid = this.app.auth.getTokenPayload().sub;
    this.user = await this.app.appState.getUser(this.uid);
    this.checkIfLoggedIn();
    //this.postUSV();
    //console.log(this.vs);
    //this.app.dashboardTitle = this.user.userType;
    //this.app.role = this.user.userType;
  }

  // rafterMakeFile() {
  //   console.log('make a new file');
  // }

  rafterVolumeService(cmd) {
    //console.log('do I have a home directory?');
    this.app.httpClient.fetch('/rafter/vs', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({token: localStorage.getItem('rafterToken'), userName: this.rafterUserID, command: cmd, rafterFile: this.rafterFile})
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (cmd === 'ls') {
          document.getElementsByClassName('homeDirContent')[0].innerHTML = JSON.stringify(data);
        }
        if (data.message) {
          let errorMessage = JSON.parse(data.message);
          console.log(errorMessage);
        }
      }).catch((err) => {
        console.log(err);
        //document.getElementsByClassName('userServiceError')[0].innerHTML = 'Wrong userid or password';
      });
  }

  rafterLogout() {
    console.log('going to log you out');
    localStorage.removeItem('rafterToken');
    localStorage.removeItem('rafterUser');
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'test') {
      //console.log('is this a test?');
      window.location.reload();
    }
  }

  checkIfLoggedIn(cep, rlo, sli) {
    if (window.localStorage.getItem('rafterToken') !== null && window.localStorage.getItem('rafterToken') !== undefined) {
      console.log('howdy rafter user');
      let rtok = window.localStorage.getItem('rafterToken');
      //this.rafterUserID = JSON.parse(localStorage.getItem('rafterUser')).id;
      //this.rafterUserID = localStorage.getItem('rafterUser')
      //console.log(rtok);
      try {
        let decoded = jwtDecode(rtok);
        console.log(decoded);
        let validToken;
        if (cep !== null && cep !== undefined) {
          validToken = cep(decoded);
          console.log(validToken);
        } else {
          validToken = this.checkExpired(decoded);
        }
        if (!validToken) {
          console.log('your token is bad, logging you out!');
          if (rlo !== null && rlo !== undefined) {
            rlo();
          } else {
            this.rafterLogout();
          }
        } else {
          if (sli !== null && sli !== undefined) {
            sli = false;
          } else {
            this.showLogin = false;
          }
        }
      } catch (err) {
        // The token is invalid
        console.log(err);
        console.log('your token is bad, logging you out!');
        if (rlo !== null && rlo !== undefined) {
          rlo();
        } else {
          this.rafterLogout();
        }
      }
    } else {
      console.log('you our not logged in');
      if (sli !== null && sli !== undefined) {
        sli = true;
      } else {
        this.showLogin = true;
      }
    }
  }

  checkExpired(decoded) {
    let d = new Date();
    let checkd = d.valueOf() / 1000;
    console.log(checkd);
    if (checkd > decoded.exp) {
      console.log('expired');
      return false;
    } return true;
  }

  validate() {
    let submitButton = document.getElementsByClassName('rafterLoginButton')[0];
    if (this.rafter.id !== '' && this.rafter.password !== '') {
      console.log('enable the button!');
      console.log(submitButton);
      submitButton.removeAttribute('disabled');
    } else {
      submitButton.setAttribute('disabled', '');
    }
  }

  postUSV() {
    this.app.httpClient.fetch('/rafter/rlogin', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.rafter)
    })
    .then((response) => response.json())
    .then((data) => {
      let data1 = data.replace(/&#34;/g, '');
      let token = data1.split('authorization_token: ')[1];
      token = token.split('}')[0];
      token = token.replace(/\r?\n|\r/g, '');
      //console.log(token);
      window.localStorage.setItem('rafterToken', token);
      console.log(data);
      let rafterUser = data.split('&#34;user&#34;:')[1];
      rafterUser = rafterUser.split('}')[0];
      rafterUser = rafterUser + '}';
      rafterUser = rafterUser.replace(/&#34;/g, '"');
      console.log(rafterUser);
      console.log(JSON.parse(rafterUser));
      window.localStorage.setItem('rafterUser', rafterUser);
      this.rafterUserID = JSON.parse(rafterUser).id;
      this.initVol(token);
      this.activate();
    }).catch((err) => {
      console.log(err);
      document.getElementsByClassName('userServiceError')[0].innerHTML = 'Wrong userid or password';
    });
  }

  initVol(mToken) {
    this.app.httpClient.fetch('/rafter/vsinit', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({token: mToken})
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    }).catch((err) => {
      console.log(err);
    });
  }

  attached() {
    const cili = this.checkIfLoggedIn;
    const cep = this.checkExpired;
    const sli = this.showLogin;
    const rlo = this.rafterLogout;
    setInterval(function() {
      cili(cep, rlo, sli);
    }
    , 5400);

    let ruser = JSON.parse(localStorage.getItem('rafterUser'));
    //console.log(ruser.id);
    if (ruser !== null && ruser !== undefined) {
      this.rafterUserID = ruser.id;
    }
  }

}
