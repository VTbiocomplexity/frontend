const User_ = require('../../src/classes/User_.js');

let mockfetch, user = new User_();
// const mockStorage = {
//   setItem() {
//   // do nothing
//   },
//   getItem() {
//   // do nothing
//   },
//   removeItem() {
//   // do nothing
//   }
// };
// window.localStorage = mockStorage;
document.body.innerHTML = '<div><div class="home"></div></div>';
describe('The User_ module', () => {
  beforeEach(() => {
    // window.localStorage = mockStorage;
    spyOn(window.localStorage, 'getItem').and.callFake(() => {
      // do nothing
    });
    spyOn(window.localStorage, 'setItem').and.callFake(() => {
    // do nothing
    });
    spyOn(window.localStorage, 'removeItem').and.callFake(() => {
    // do nothing
    });
  });
  it('generates a email varification form', () => {
    user.verifyEmail();
    expect(document.body.innerHTML).toMatch(/Verify Your Email Address/);
  });

  it('generates a change email varification form', () => {
    user.changeEmail = 'joe@smith.com';
    user.verifyEmail();
    expect(document.getElementsByClassName('email')[0].value).toBe('joe@smith.com');
  });

  it('generates a reset password form with email already filled in', () => {
    user.formType = 'reset';
    user.userEmail = 'joe@smith.com';
    user.verifyEmail();
    expect(document.body.innerHTML).toMatch(/Reset Your Password/);
  });

  it('it validates the reset password form', () => {
    user.formType = 'reset';
    document.getElementsByClassName('email')[0].checkValidity = function () { return true; };
    document.getElementsByClassName('code')[0].value = 12345;
    document.getElementsByClassName('loginpass')[0].checkValidity = function () { return true; };
    const evt = { target: { formType: 'reset' } };
    user.validateForm(evt);
    const sbutton = document.getElementsByClassName('regbutton')[0];
    expect(sbutton.style.display).toBe('block');
  });

  it('it validates the email varification form', () => {
    user.formType = 'email';
    const evt = { target: { formType: 'email' } };
    document.getElementsByClassName('email')[0].value = 'joe@smith.com';
    document.getElementsByClassName('code')[0].value = '12345';
    document.getElementsByClassName('email')[0].checkValidity = function () { return true; };
    document.getElementsByClassName('code')[0].checkValidity = function () { return true; };
    document.getElementsByClassName('loginpass')[0].checkValidity = function () { return true; };
    user.validateForm(evt);
    const sbutton = document.getElementsByClassName('regbutton')[0];
    expect(sbutton.style.display).toBe('block');
  });

  it('it hides submit button if the email varification form is invalid', () => {
    user.formType = 'email';
    const evt = { target: { formType: 'email' } };
    document.getElementsByClassName('email')[0].value = 'joesmith.com';
    document.getElementsByClassName('code')[0].value = '12345';
    document.getElementsByClassName('email')[0].checkValidity = function () { return false; };
    document.getElementsByClassName('code')[0].checkValidity = function () { return true; };
    document.getElementsByClassName('loginpass')[0].checkValidity = function () { return true; };
    user.validateForm(evt);
    const sbutton = document.getElementsByClassName('regbutton')[0];
    expect(sbutton.style.display).toBe('none');
  });

  it('it hides submit button if the reset password form is invalid', () => {
    user.formType = 'reset';
    const evt = { target: { formType: 'reset' } };
    document.getElementsByClassName('email')[0].value = 'joesmith.com';
    document.getElementsByClassName('code')[0].value = '12345';
    document.getElementsByClassName('email')[0].checkValidity = function () { return true; };
    document.getElementsByClassName('code')[0].checkValidity = function () { return true; };
    document.getElementsByClassName('loginpass')[0].checkValidity = function () { return false; };
    user.validateForm(evt);
    const sbutton = document.getElementsByClassName('regbutton')[0];
    expect(sbutton.style.display).toBe('none');
  });

  it('it resets the password', () => {
    mockfetch = function (url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve({})
      });
    };
    user.fetch = mockfetch;
    user.formType = 'reset';
    user.verifyEmail();
    document.getElementsByClassName('loginpass')[0].value = 'password1';
    document.getElementsByClassName('code')[0].value = '12345';
    document.getElementsByClassName('email')[0].value = 'joe@smith.com';
    const evt = { target: { formType: 'reset', fetchClient: mockfetch, runFetch: user.runFetch } };
    user.resetPasswd(evt).then(() => {
      const messagediv = document.getElementsByClassName('loginerror')[0];
      expect(messagediv.innerHTML).toBe('');
    });
  });

  it('it displays the error message from reset password PUT', () => {
    document.body.innerHTML = '<div><div class="home"></div></div>';
    user = new User_();
    user.formType = 'reset';
    user.userEmail = 'joe@smith.com';
    user.verifyEmail();
    mockfetch = function (url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve({ message: 'incorrect email' })
      });
    };
    const evt = { target: { formType: 'reset', fetchClient: mockfetch, runFetch: user.runFetch } };
    document.getElementsByClassName('loginpass')[0].value = 'password1';
    document.getElementsByClassName('code')[0].value = '12345';
    user.resetPasswd(evt).then(() => {
      const messagediv = document.getElementsByClassName('loginerror')[0];
      expect(messagediv.innerHTML).toMatch(/incorrect email/);
      messagediv.innerHTML = '';
    });
  });

  it('it catches the error from reset password PUT', () => {
    mockfetch = function (url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.reject(new Error({ error: 'server error' }))
      });
    };
    const evt = { target: { formType: 'reset', fetchClient: mockfetch, runFetch: user.runFetch } };
    return user.resetPasswd(evt)
      .catch(e => expect(e).toBeTruthy());
  });

  it('it updates the user', () => {
    mockfetch = function (url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve({})
      });
    };
    const evt = { target: { fetchClient: mockfetch, runFetch: user.runFetch } };
    user.updateUser(evt).then(() => {
      const messagediv = document.getElementsByClassName('loginerror')[0];
      expect(messagediv.innerHTML).toBe('');
    });
  });

  it('it displays error message on updates the user PUT', () => {
    mockfetch = function (url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve({ message: 'wrong email' })
      });
    };
    const evt = { target: { fetchClient: mockfetch, runFetch: user.runFetch } };
    user.updateUser(evt).then(() => {
      const messagediv = document.getElementsByClassName('loginerror')[0];
      expect(messagediv.innerHTML).toMatch(/wrong email/);
      messagediv.innerHTML = '';
    });
  });

  it('it catches errors on update the user PUT', () => {
    mockfetch = function (url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.reject(new Error({ error: 'big problem' }))
      });
    };
    const evt = { target: { fetchClient: mockfetch, runFetch: user.runFetch } };
    return user.updateUser(evt)
      .catch(e => expect(e).toBeTruthy());
  });

  it('it hides the form', () => {
    document.body.innerHTML = '<div class="form" style="display:block"></div>';
    user.nevermind('form');
    expect(document.getElementsByClassName('form')[0].style.display).toBe('none');
  });

  it('it displays a email varification form for a change email request', () => {
    document.body.innerHTML = '<div><div class="home"></div></div><div class="UserProfileForm"></div>';
    user.userEmail = '';
    user.changeEmail = 'bob@smith.com';
    user.verifyEmail();
    expect(document.getElementsByClassName('email')[0].value).toBe('bob@smith.com');
  });

  it('it sends PUT request to varify the changed email with pin', () => {
    mockfetch = function (url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve({ success: true })
      });
    };
    user.fetch = mockfetch;
    document.body.innerHTML = '<input class="email" value="new@email.com">' +
    '<input class="code" value="12345"><div class="loginerror"></div>';
    const evt = { target: { fetchClient: mockfetch, runFetch: user.runFetch } };
    return user.verifyChangeEmail(evt).then(() => {
      expect(document.getElementsByClassName('loginerror')[0].innerHTML).toBe('');
    });
  });

  it('it sends PUT request to varify the changed email with pin and displays error message', () => {
    mockfetch = function (url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve({ message: 'incorrect pin' })
      });
    };
    user.fetch = mockfetch;
    document.body.innerHTML = '<input class="email" value="new@email.com">' +
    '<input class="code" value="12345"><div class="loginerror"></div>';
    const evt = { target: { fetchClient: mockfetch, runFetch: user.runFetch } };
    return user.verifyChangeEmail(evt).then(() => {
      expect(document.getElementsByClassName('loginerror')[0].innerHTML).toBe('<p style="text-align:left; padding-left:12px">incorrect pin</p>');
    });
  });

  it('it sends PUT request to varify the changed email with pin and catches error', () => {
    mockfetch = function (url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.reject(new Error({ error: 'big problem' }))
      });
    };
    user.fetch = mockfetch;
    const evt = { target: { fetchClient: mockfetch, runFetch: user.runFetch } };
    return user.verifyChangeEmail(evt)
      .catch(e => expect(e).toBeTruthy());
  });
});
