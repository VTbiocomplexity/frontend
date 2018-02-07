import {inject} from 'aurelia-framework';
import {App} from '../app';
//import {json} from 'aurelia-fetch-client';
//import {VolumeService} from 'rafter';
@inject(App)
export class Rafter {
  constructor(app) {
    this.app = app;
    this.rafter = {
      id: '',
      password: ''
    };
  //   this.vs = new VolumeService('http://rafter.bi.vt.edu/volumesvc/', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6W10sImZpcnN0X25hbWUiOiJuZHNzbCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv' +
  //   '-i9vRVuzPJEWxPHhXZTSzLXiwPlLB5P9VOlzgDPhmVuPwx2n0q-T9hbV6vGt1E0EL-oKex1dpVE10iM0BWujXvQRC8gPJXhIBNR6zUDXX5ziO_8Y48CNWvKBDKhTjcrGEuj7CEMSt9kZBlgt-E_DnkibnFfHl763k_vPWqJ4okWkhELXtpCj7ObKrjNGRjYzKrMRyjJkIHLOc6ZEsTKkWt4ATzOXN_jVYFqN5tzRpMqiqC-G0oS-aSOiML6HZpqiEu26oLoQ4a6RDAXPp6Me9SXwkhw7K-JNDvW68LRyXIMnz7HisLWhc6-1XykgQ6MLcu4uvsOBD11VQpVmO-5Dkdf2vAlr7jbQ8tvKZaJi4W2PEiVIfR6lNhGPLyU4Zx4bg084tzi6n3jSipKcavfPY' +
  //   '-iNAbZOYDXlB8GKdDIEFpRQmO11Yyr1_B9OjRYFWrf1scdlLhdXcRQT33FHQo_sakhZMI36s50ksj6B4ghrEHhdvgE1TFBgMg6uyRiNiZiRVgd08kMok_JmlJrjGkqoUIgvZeC9NkjGU8YcV5bF5ZTeJpTlJ7l28W8fY_lkjOs4LBsxoJDdnrdGR-FsfFMQJajL4LEuwXGlpBHjfiLpqflRYhf8poDRU');
  // //   this.auth = auth;
  // //
  }

  async activate() {
    this.uid = this.app.auth.getTokenPayload().sub;
    this.user = await this.app.appState.getUser(this.uid);
    //this.postUSV();
    //console.log(this.vs);
    //this.app.dashboardTitle = this.user.userType;
    //this.app.role = this.user.userType;
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
        // 'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.rafter)
        // body: JSON.stringify({id: 'ndsslApp', password: 'rafteri5Fun!'})
    })
    .then((response) => response.json())
    .then((data) => {
      data = data.replace(/&#34;/g, '');
      let token = data.split('authorization_token:')[1];
      token = token.split('}')[0];
      console.log(token);
      window.localStorage.setItem('rafterToken', token);


    // document.getElementById('charityDash').scrollIntoView();
    // this.activate();
    // this.createNewCharity();
    }).catch((err) => {
      console.log(err);
      document.getElementsByClassName('userServiceError')[0].innerHTML = 'Wrong userid or password';
    });
  }

}
