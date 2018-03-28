const UserAccount = require('../../src/classes/UserAccount.js');
let mockfetch;
const mockStorage = {setItem: function(item, value) {
  //do nothing
}, getItem: function(item) {
  //do nothing
}, removeItem: function(item) {
  //do nothing
}
};
window.localStorage = mockStorage;

document.body.innerHTML = '<div class="UserProfileForm" style="display:none; text-align:center; max-width:4in;"></div>';
let ua = new UserAccount();
describe('the UserAccount module', () => {
  it('it populates the user pref form with the current user attributes', () => {
    mockfetch = function(url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve([{'_id': '12345', 'first_name': 'bob', 'last_name': 'jones', 'affiliation': 'self', 'expertise': 'fish', 'interests': 'fishing', 'email': 'bob@smith.com'}])
      });
    };
    ua.fetch = mockfetch;
    document.body.innerHTML = '<div><div class="home"></div></div><div class="UserProfileForm" style="display:block">' +
    '<input class="uprofFirstName"><input class="uprofLastName"><input class="uprofAff"><input class="uprofexpertise">' +
    '<input class="uprofInterests"><input class="uprofEmail"></div>';
    ua.populateForm().then((data) => {
      expect(document.getElementsByClassName('uprofEmail')[0].value).toBe('bob@smith.com');
      expect(ua.uid).toBe('12345');
    });
  });

  it('it populates the user pref form correctly after new Google user created', () => {
    mockfetch = function(url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve([{'_id': '12345', 'email': 'bob@smith.com', name: 'Bob Smith'}])
      });
    };
    ua.fetch = mockfetch;
    document.body.innerHTML = '<div><div class="home"></div></div><div class="UserProfileForm" style="display:block">' +
    '<input class="uprofFirstName"><input class="uprofLastName"><input class="uprofAff"><input class="uprofexpertise">' +
    '<input class="uprofInterests"><input class="uprofEmail"></div>';
    ua.populateForm().then((data) => {
      expect(document.getElementsByClassName('uprofEmail')[0].value).toBe('bob@smith.com');
      expect(document.getElementsByClassName('uprofFirstName')[0].value).toBe('Bob');
      expect(ua.uid).toBe('12345');
    });
  });

  it('it updates user with the user prefs form', () => {
    mockfetch = function(url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve({})
      });
    };
    ua.fetch = mockfetch;
    document.body.innerHTML = '<div><div class="home"></div></div><div class="UserProfileForm" style="display:block">' +
    '<input class="uprofFirstName" value="Bob"><input class="uprofLastName" value="Smith"><input class="uprofAff" value="self"><input class="uprofexpertise" value="dog">' +
    '<input class="uprofInterests" value="walking"><input class="uprofEmail" value="bob@smith.com"></div>';
    ua.updateUserPrefs().then((data) => {
      expect(data.message).toBe(undefined);
    });
  });

  it('it tries to updates user with the user prefs form, but displays an error', () => {
    mockfetch = function(url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve({message: 'some error'})
      });
    };
    ua.fetch = mockfetch;
    document.body.innerHTML = '<div><div class="home"></div></div><div class="UserProfileForm" style="display:block">' +
    '<input class="uprofFirstName" value="Bob"><input class="uprofLastName" value="Smith"><input class="uprofAff" value="self"><input class="uprofexpertise" value="dog">' +
    '<input class="uprofInterests" value="walking"><input class="uprofEmail" value="bob@smith.com"></div>';
    ua.updateUserPrefs().then((data) => {
      expect(data.message).toBe('some error');
    });
  });

  it('it sends PUT request to change user email', () => {
    mockfetch = function(url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve({success: true})
      });
    };
    ua.fetch = mockfetch;
    document.body.innerHTML = '<input class="uprofEmail" value="new@email.com"><div class="loginerror"></div>';
    return ua.changeUserEmail().then(() => {
      let messagediv = document.getElementsByClassName('loginerror')[0];
      expect(messagediv.innerHTML).toBe('');
      messagediv.innerHTML = '';
    });
  });

  it('it sends PUT request to change user email and displays error message', () => {
    mockfetch = function(url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.resolve({message: 'email is incorrect'})
      });
    };
    ua.fetch = mockfetch;
    document.body.innerHTML = '<input class="uprofEmail" value="new@email.com"><div class="formerrors"></div>';
    //document.getElementsByClassName('uprofEmail')[0].value = 'new@email.com';

    return ua.changeUserEmail().then(() => {
      let messagediv = document.getElementsByClassName('formerrors')[0];
      expect(messagediv.innerHTML).toBe('<p style="text-align:left; padding-left:12px">email is incorrect</p>');
      messagediv.innerHTML = '';
    });
  });

  it('it sends PUT request to change user email and catches error', () => {
    mockfetch = function(url, data) {
      this.headers = {};
      this.headers.url = url;
      this.headers.method = data.method;
      return Promise.resolve({
        Headers: this.headers,
        json: () => Promise.reject({error: 'big problem'})
      });
    };
    ua.fetch = mockfetch;
    return ua.changeUserEmail()
    .catch((e) => expect(e).toBeTruthy());
  });
});
