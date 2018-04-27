import { UserAccount } from '../../src/dashboard-child-routes/user-account';
import { RouterStub, AuthStub, HttpMock, AppStateStub } from './commons';
import { App } from '../../src/app';

const Uact = require('../../src/classes/UserAccount.js');

function testAsync(runAsync) {
  return (done) => {
    runAsync().then(done, (e) => { fail(e); done(); });
  };
}

describe('the User Account Module', () => {
  let app1;
  let auth;
  let ua;
  beforeEach(() => {
    auth = new AuthStub();
    auth.setToken({ sub: 'aowifjawifhiawofjo' });
    app1 = new App(auth, new HttpMock());
    app1.router = new RouterStub();
    app1.activate();
    ua = new UserAccount(app1);
    ua.activate();
    ua.app.authenticated = true;
    ua.app.appState = new AppStateStub();
    document.body.innerHTML = '<div class="elevation3 UserProfileForm" style="max-width:3.25in; margin:auto"><form><table><tbody>' +
'<tr><th>First Name <span style="color:red">*</span></th><th>Last Name <span style="color:red">*</span></th></tr>' +
'<tr><td><input class="uprofFirstName" style="width:100%" name="first_name" value="" required></td><td><input class="uprofLastName"' +
' style="width:100%" name="last_name" value="" required></td></tr>' +
'<tr><th colspan="2">Organization</th></tr><tr><td colspan="2"><input class="uprofAff" style="width:100%" name="affiliation" value=""></td></tr>' +
'<tr><th colspan="2">Area of Expertise</th></tr><tr><td colspan="2"><input class="uprofexpertise" name="expertise" style="width:100%"></td></tr>' +
'<tr><th colspan="2">Other Interests</th></tr><tr><td colspan="2"><textarea class="uprofInterests" rows="10" name="interests"' +
' style="height:85px;width:100%" value=""></textarea></td></tr>' +
'</tbody></table><div><span style="color:red; font-style: italic; text-align:left; margin-left:-120px">* Indicates a required field</span>' +
'<div><button class="updateprofbutton" type="button" style="margin-left:240px" click.delegate="updateUserPrefs()">' +
'Update Profile</button></div></form>' +
'<div class="formerrors" style="color:red; margin-top:5px"></div></div><div><input type="email" class="uprofEmail"></input></div>';
  });

  it('creates the user account form and checks for a configured user type', testAsync(async () => {
    ua.user = { userType: 'Developer' };
    await ua.attached();
    expect(document.getElementsByClassName('updateprofbutton')[0].getAttribute('disabled')).toBe(null);
    ua.user = { userType: '' };
    await ua.attached();
    expect(document.getElementsByClassName('updateprofbutton')[0].getAttribute('disabled')).not.toBe(null);
    ua.user = { userType: 'Developer' };
    document.getElementsByClassName('formerrors')[0].innerHTML = '<p>some error</p>';
    await ua.attached();
    expect(document.getElementsByClassName('updateprofbutton')[0].getAttribute('disabled')).not.toBe(null);
  }));

  it('checks for a valid user name', testAsync(async () => {
    ua.user = { userType: 'Developer' };
    await ua.checkName();
    expect(document.getElementsByClassName('formerrors')[0].innerHTML).toBe('<p>Name is not valid, please fix</p>');
    await ua.checkName();
    expect(document.getElementsByClassName('formerrors')[0].innerHTML).toBe('<p>Name is not valid, please fix</p>');
    document.getElementsByClassName('uprofFirstName')[0].value = 'Billy';
    document.getElementsByClassName('uprofLastName')[0].value = 'Joe';
    await ua.checkName();
    expect(document.getElementsByClassName('updateprofbutton')[0].getAttribute('disabled')).toBe(null);
    document.getElementsByClassName('formerrors')[0].innerHTML = '<p>some error</p>';
    document.getElementsByClassName('updateprofbutton')[0].setAttribute('disabled', true);
    await ua.checkName();
    expect(document.getElementsByClassName('updateprofbutton')[0].getAttribute('disabled')).not.toBe(null);
  }));

  it('updates the user prefs', testAsync(async () => {
    ua.userActClass = new Uact('123');
    ua.user = { userType: 'Developer' };
    document.getElementsByClassName('uprofFirstName')[0].value = 'Billy';
    document.getElementsByClassName('uprofLastName')[0].value = 'Joe';
    document.getElementsByClassName('UserProfileForm')[0].style.display = 'block';
    document.getElementsByClassName('formerrors')[0].innerHTML = '';
    await ua.updateUserPrefs();
  }));

  it('requests a change to the user email', testAsync(async () => {
    ua.userActClass = new Uact('123');
    ua.user = { userType: 'Developer' };
    document.getElementsByClassName('uprofEmail')[0].value = 'billy@joe.com';
    await ua.changeUserEmail();
    expect(document.getElementsByClassName('formerrors')[0].innerHTML).toBe('');
    document.getElementsByClassName('uprofEmail')[0].value = 'bladiblah';
    await ua.changeUserEmail();
    expect(document.getElementsByClassName('formerrors')[0].innerHTML).not.toBe('');
  }));
});
