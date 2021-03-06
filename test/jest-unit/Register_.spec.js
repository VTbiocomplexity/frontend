const Register_ = require('../../src/classes/Register_.js');

const reg = new Register_();

describe('The Register module', () => {
  it('hides a registration form with click Cancel button', () => {
    document.body.innerHTML = '<div class="home"></div>';
    reg.startup();
    document.getElementsByClassName('nevermind')[0].click();
    const regform = document.getElementsByClassName('RegistrationForm');
    expect(regform[0].style.display).toBe('none');
  });

  it('hides the submit button when registration form is not valid email', () => {
    document.body.innerHTML = '<div class="home"></div>';
    reg.startup('');
    document.getElementsByClassName('email')[0].value = 'google.@gmail.com';
    document.getElementsByClassName('email')[0].checkValidity = function () { return false; };
    document.getElementsByClassName('password')[0].checkValidity = function () { return true; };
    const evt = { target: { displayError: reg.displayRegError, validateGoogle: reg.validateGoogle } };
    reg.validateReg(evt);
    const registbutton = document.getElementsByClassName('registerbutton')[0];
    expect(registbutton.style.display).toBe('none');
  });

  it('hides the submit button when registration form is not valid name', () => {
    document.body.innerHTML = '<div class="home"></div>';
    reg.startup('PATRIC');
    document.getElementsByClassName('password')[0].checkValidity = function () { return true; };
    document.getElementsByClassName('email')[0].checkValidity = function () { return true; };
    document.getElementsByClassName('firstname')[0].value = '';
    const evt = { target: { displayError: reg.displayRegError, validateGoogle: reg.validateGoogle } };
    reg.validateReg(evt);
    const registbutton = document.getElementsByClassName('registerbutton')[0];
    expect(registbutton.style.display).toBe('none');
  });

  it('hides the submit button when registration form is not valid password', () => {
    document.body.innerHTML = '<div class="home"></div>';
    reg.startup('PATRIC');
    document.getElementsByClassName('email')[0].value = 'google.@gb.com';
    document.getElementsByClassName('firstname')[0].value = 'Bob';
    document.getElementsByClassName('lastname')[0].value = 'Smith';
    document.getElementsByClassName('email')[0].checkValidity = function () { return true; };
    document.getElementsByClassName('password')[0].checkValidity = function () { return false; };
    const evt = { target: { displayError: reg.displayRegError, validateGoogle: reg.validateGoogle } };
    reg.validateReg(evt);
    const registbutton = document.getElementsByClassName('registerbutton')[0];
    expect(registbutton.style.display).toBe('none');
  });

  it('shows the submit button when registration form is valid', () => {
    document.body.innerHTML = '<div class="home"></div>';
    reg.startup('PATRIC');
    document.getElementsByClassName('firstname')[0].value = 'Joe';
    document.getElementsByClassName('lastname')[0].value = 'Smith';
    document.getElementsByClassName('email')[0].value = 'joe@smith.com';
    document.getElementsByClassName('password')[0].value = '123456789';
    const mockvalidity = function () {
      return true;
    };
    document.getElementsByClassName('password')[0].checkValidity = mockvalidity;
    document.getElementsByClassName('email')[0].checkValidity = mockvalidity;
    const evt = { target: { displayError: reg.displayRegError, validateGoogle: reg.validateGoogle } };
    reg.validateReg(evt);
    const registbutton = document.getElementsByClassName('registerbutton')[0];
    expect(registbutton.style.display).toBe('block');
    document.body.innerHTML = '';
  });

  it('hides register button when email format is not valid', () => {
    document.body.innerHTML = '<div class="home"></div>';
    reg.startup('PATRIC');
    document.getElementsByClassName('firstname')[0].value = 'Joe';
    document.getElementsByClassName('lastname')[0].value = 'Smith';
    document.getElementsByClassName('email')[0].value = 'joe@smith.com';
    document.getElementsByClassName('password')[0].value = '123456789';
    const mockvalidity = function () {
      return false;
    };
    document.getElementsByClassName('password')[0].checkValidity = function () { return true; };
    document.getElementsByClassName('email')[0].checkValidity = mockvalidity;
    const evt = { target: { displayError: reg.displayRegError, validateGoogle: reg.validateGoogle } };
    reg.validateReg(evt);
    const registbutton = document.getElementsByClassName('registerbutton')[0];
    expect(registbutton.style.display).toBe('none');
    document.body.innerHTML = '';
  });

  it('create a new user for this app', () => {
    document.body.innerHTML = '<div class="home"></div>';
    reg.appName = '';
    reg.startup();
    document.getElementsByClassName('firstname')[0].value = 'Joe';
    document.getElementsByClassName('lastname')[0].value = 'Smith';
    document.getElementsByClassName('email')[0].value = 'joe@smith.com';
    document.getElementsByClassName('password')[0].value = '123456789';
    // document.getElementsByClassName('pas')[0].value = 'CoolApp';
    const mockfetch = function (url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve({ success: true })
      });
    };
    const evt = { target: { fetchClient: mockfetch, runFetch: reg.runFetch } };
    // reg.fetch = mockfetch;
    reg.createUser(evt).then(() => {
      const messagediv1 = document.getElementsByClassName('registererror')[0];
      expect(messagediv1.innerHTML).toBe('');
    });
  });

  it('it does not create a new user when there is an response error message from post', () => {
    document.body.innerHTML = '<div class="home"></div>';
    reg.startup('PATRIC');
    document.getElementsByClassName('firstname')[0].value = 'Joe';
    document.getElementsByClassName('lastname')[0].value = 'Smith';
    document.getElementsByClassName('email')[0].value = 'joe@smith.com';
    document.getElementsByClassName('password')[0].value = '123456789';
    const mockfetch = function (url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve({ message: 'error' })
      });
    };
    const evt = { target: { fetchClient: mockfetch, runFetch: reg.runFetch } };
    // reg.fetch = mockfetch;
    reg.createUser(evt).then(() => {
      const messagediv1 = document.getElementsByClassName('registererror')[0];
      expect(messagediv1.innerHTML).toMatch(/error/);
    });
  });

  it('it catches error on create a new user', () => {
    document.body.innerHTML = '<div class="home"></div>';
    reg.startup('');
    document.getElementsByClassName('firstname')[0].value = 'Joe';
    document.getElementsByClassName('lastname')[0].value = 'Smith';
    document.getElementsByClassName('email')[0].value = 'joe@smith.com';
    document.getElementsByClassName('password')[0].value = '123456789';
    const mockfetch = function (url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.reject(new Error({ error: 'rejected' }))
      });
    };
    const evt = { target: { fetchClient: mockfetch, runFetch: reg.runFetch } };
    return reg.createUser(evt)
      .catch(e => expect(e).toBeTruthy());
  });

  it('it initiates an email varification', () => {
    document.body.innerHTML = '<div class="home"></div>';
    reg.startup('');
    document.getElementsByClassName('firstname')[0].value = 'Joe';
    document.getElementsByClassName('lastname')[0].value = 'Smith';
    document.getElementsByClassName('email')[0].value = 'joe@smith.com';
    document.getElementsByClassName('password')[0].value = '123456789';
    const mockfetch = function (url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve({ email: 'joe@smith.com' })
      });
    };
    const evt = { target: { fetchClient: mockfetch, runFetch: reg.runFetch } };
    reg.createUser(evt).then((data) => {
      expect(data.email).toBe('joe@smith.com');
    });
  });

  it('it navigates to the user preferences page', () => {
    reg.userAccount();
  });

  it('it hides the registration form', () => {
    document.body.innerHTML = '<div><div class="RegistrationForm" style="display:block"></div></div>';
    reg.utils.nevermind('RegistrationForm');
    expect(document.getElementsByClassName('RegistrationForm')[0].style.display).toBe('none');
  });
});
