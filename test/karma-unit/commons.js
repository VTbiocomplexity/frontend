class RouterStub {
  currentInstruction = {
    config: { title: 'Howdy is cool', name: 'yoyo' },
    fragment: {} }
  configure(handler) {
    if (handler) {
      handler(this);
    }
  }
  getRoute() {
    return this.router.currentInstruction.config.title; //name of the route
  }

  addPipelineStep(param1, AuthorizeStep) {
      //do nothing
  }

  options() {
      //do nothing
  }
  map(routes) {
    this.routes = routes;
    return this.routes instanceof Array ? this.routes : [this.routes];
  }
  navigate(route) {
    return route;
  }
  fallbackRoute(opt) {
    this.opt = opt;
  }
  }

class ConfigStub {
  map(array1) {
    return array1;
  }
  fallbackRoute(route) {
    this.route = route;
  }
  }

class AuthStub {
  setToken(token) {
    this.token = token;
  }
  logout(data) {
    const response = 'user logged out';
    this.authenticated = false;
    return new Promise((resolve) => {
      resolve({json: () => response});
    });
  }
  getMe() {
    const response = 'This is user data';
    return new Promise((resolve) => {
      resolve({json: () => response});
    });
  }
  getTokenPayload() {
    const response = this.token;
    return response;
  }
  isAuthenticated() {
    return this.authenticated;
  }
  }

class AppStateStub {
  constructor() {
    this.user = {};
    this.is_auth = false;
    this.roles = [];
  }
  getUser(uid) {
    if (uid === '1') {
      this.user = {name: 'Iddris Elba', userType: 'Charity', _id: '3333333', volTalents: ['childcare', 'other'], volCauses: ['Environmental', 'other'], volWorkPrefs: ['counseling', 'other'], volCauseOther: '', volTalentOther: '', volWorkOther: ''};
    } else if (uid === '2') {
      this.user = {name: 'Iddris Elba', userType: 'Volunteer', _id: '3333333', volTalents: ['childcare', 'other'], volCauses: ['Environmental', 'other'], volWorkPrefs: ['counseling', 'other'], volCauseOther: '', volTalentOther: '', volWorkOther: ''};
    } else {
      this.user = {name: 'Iddris Elba', userType: 'Developer', _id: '3333333', volTalents: [], volCauses: [], volWorkPrefs: [], volCauseOther: '', volTalentOther: '', volWorkOther: ''};
    }
      // return Promise.resolve({
      //   //Headers: this.headers,
      //   resolve(this.user)
      // });
    return new Promise((resolve) => {
      resolve(this.user);
    });
  }
  setUser(input) {
    this.user = input;
  }
  checkUserRole() {
    return this.roles;
  }
  getRoles() {
    return (this.roles);
  }
  setRoles(input) {
    this.roles = input;
  }
  }

class HttpMock {
    // this one catches the ajax and then resolves a custom json data.
    // real api calls will have more methods.
  constructor(data) {
    this.error = false;
    this.message = false;
    this.errorType = data;
    this.user = data || {name: 'Iddris Elba', userType: 'Volunteer', _id: '3333333', volTalents: [], volCauses: [], volWorkPrefs: [], volCauseOther: '', volTalentOther: '', volWorkOther: ''};
    if (data === 'rafterError' || data === 'rafterCreateError') {
      this.error = true;
    }
    if (data === 'rafterMessage') {
      this.message = true;
    }
    this.type = data;
    this.data = data;
  }
  status = 500;
  headers = {accept: 'application/json', method: '', url: ''}
  configure(fn) {
    this.__configureCallback = fn;
    return this.__configureReturns;
  }
  fetch(url, obj) {
    this.headers.url = url;
    this.headers.method = obj ? obj.method : 'GET';
    if (obj && obj.method === 'put') {
      this.user = obj.body;
    }
    this.status = 200;
    if (url === '/rafter/rinit') {
      console.log('init rafter test');
      if (!this.error && this.data !== 'rafterInitError') {
        let tkn = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6W10sImZpcnN0X25hbWUiOiJuZHNzbCIsImxhc3RfbmFtZSI6ImFwcCIsInJvbGVzIjpbXSwidGVhbXMiOlsiQHVzZXJzIl0sImlhdCI6MTUxNzk0Nzk2MSwibmJmIjoxNTE3OTQ3OTYxLCJleHAiOjE1MTgwMzQzNjEsImF1ZCI6WyJAY29yZSIsIiNwdWJsaWMiXSwiaXNzIjoiaHR0cHM6Ly9yYWZ0ZXIuYmkudnQuZWR1L3VzZXJzdmMvcHVibGljX2tleSIsInN1YiI6Im5kc3NsQXBwIn0.a_q5Hq2MKWizi1KFbq8RMKAeQQbpsPweexIRCQwQ2a65J5Ojukf9vv' +
          '-i9vRVuzPJEWxPHhXZTSzLXiwPlLB5P9VOlzgDPhmVuPwx2n0q-T9hbV6vGt1E0EL-oKex1dpVE10iM0BWujXvQRC8gPJXhIBNR6zUDXX5ziO_8Y48CNWvKBDKhTjcrGEuj7CEMSt9kZBlgt-E_DnkibnFfHl763k_vPWqJ4okWkhELXtpCj7ObKrjNGRjYzKrMRyjJkIHLOc6ZEsTKkWt4ATzOXN_jVYFqN5tzRpMqiqC-G0oS-aSOiML6HZpqiEu26oLoQ4a6RDAXPp6Me9SXwkhw7K-JNDvW68LRyXIMnz7HisLWhc6-1XykgQ6MLcu4uvsOBD11VQpVmO-5Dkdf2vAlr7jbQ8tvKZaJi4W2PEiVIfR6lNhGPLyU4Zx4bg084tzi6n3jSipKcavfPY' +
          '-iNAbZOYDXlB8GKdDIEFpRQmO11Yyr1_B9OjRYFWrf1scdlLhdXcRQT33FHQo_sakhZMI36s50ksj6B4ghrEHhdvgE1TFBgMg6uyRiNiZiRVgd08kMok_JmlJrjGkqoUIgvZeC9NkjGU8YcV5bF5ZTeJpTlJ7l28W8fY_lkjOs4LBsxoJDdnrdGR-FsfFMQJajL4LEuwXGlpBHjfiLpqflRYhf8poDRU';
        return Promise.resolve({
          Headers: this.headers,
          json: () => Promise.resolve(tkn)
        });
      } else if (this.data === 'rafterInitError') {
        console.log('line 145');
        return Promise.resolve({
          Headers: this.headers,
          json: () => Promise.resolve('{"error": "you fail"}')
        });
      }
      return Promise.reject({
        Headers: this.headers,
        json: () => Promise.reject({message: 'error'})
      });
    }

    if (url === '/rafter/rlogin') {
      console.log('login rafter test');
      if (!this.error) {
        let data = '{authorization_token: 123}, {&#34;user&#34;: {&#34;name&#34;: &#34;tester&#34;}';
        return Promise.resolve({
          Headers: this.headers,
          json: () => Promise.resolve(data)
        });
      }
      return Promise.reject({
        Headers: this.headers,
        json: () => Promise.reject({message: 'error'})
      });
    }

    if (url === '/rafter/vs') {
      console.log('rafter volume service test');
      if (this.type === 'failDelete') {
        return Promise.resolve({
          Headers: this.headers,
          json: () => Promise.resolve(false)
        });
      }
      if (!this.error && !this.message) {
        console.log('no error and no message');
        let data = {name: 'filename'};
        return Promise.resolve({
          Headers: this.headers,
          json: () => Promise.resolve(data)
        });
      } else if (this.message) {
        let em = JSON.stringify({error: 'you did something wrong'});
        let data = {message: em};
        return Promise.resolve({
          Headers: this.headers,
          json: () => Promise.resolve(data)
        });
      }
        //let errormsg = {message: 'error'};
        //if (this.errorType === 'rafterCreateError') {
        //errormsg = {error: 'incorrect stuff'};
        //}
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.reject(new Error({error: 'fail'}))
      });
    }

    if (url === '/rafter/vsinit') {
      console.log('rafter volume init test');
      if (!this.error && ! this.message) {
        let data = {home: true};
        return Promise.resolve({
          Headers: this.headers,
          json: () => Promise.resolve(data)
        });
      }
      return Promise.reject({
        Headers: this.headers,
        json: () => Promise.reject({message: 'error'})
      });
    }

    return Promise.resolve({
      Headers: this.headers,
      json: () => Promise.resolve(this.user)
    });
  }
  }

export {RouterStub, ConfigStub, AuthStub, AppStateStub, HttpMock};
