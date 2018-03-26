import {UserAccount} from '../../src/dashboard-child-routes/user-account';
import {RouterStub, AuthStub, HttpMock, AppStateStub} from './commons';
import {App} from '../../src/app';

describe('the User Account Module', () => {
  let app1;
  let auth;
  let ua;
  beforeEach(() => {
    auth = new AuthStub();
    auth.setToken({sub: 'aowifjawifhiawofjo'});
    app1 = new App(auth, new HttpMock());
    app1.router = new RouterStub();
    app1.activate();
    ua = new UserAccount(app1);
    ua.activate();
    ua.app.authenticated = true;
    ua.app.appState = new AppStateStub();
    //sut.app.appState = new AppStateStub();
    //sut.app.authenticated = false;
  });

  it('Does not update User Details with an invalid form', (done) => {
    document.body.innerHTML = '<div class="elevation3" style="max-width:3.25in; margin:auto"><form><table><tbody>' +
'<tr><th>First Name <span style="color:red">*</span></th><th>Last Name <span style="color:red">*</span></th></tr>' +
'<tr><td><input class="uprofFirstName" style="width:100%" name="first_name" value="" required></td><td><input class="uprofLastName" style="width:100%" name="last_name" value="" required></td></tr>' +
'<tr><th colspan="2">Organization</th></tr><tr><td colspan="2"><input class="uprofAff" style="width:100%" name="affiliation" value=""></td></tr>' +
'<tr><th colspan="2">Organisms</th></tr><tr><td colspan="2"><input class="uprofOrganisms" name="organisms" style="width:100%"></td></tr>' +
'<tr><th colspan="2">Interests</th></tr><tr><td colspan="2"><textarea class="uprofInterests" rows="10" name="interests" style="height:85px;width:100%" value=""></textarea></td></tr>' +
'</tbody></table><div><span style="color:red; font-style: italic; text-align:left; margin-left:-120px">* Indicates a required field</span>' +
'<button class="updateprofbutton" type="button" style="margin-left:240px" click.delegate="updateUserPrefs()">Update Profile</button></div></form></div>' +
'<div class="formerrors" style="color:red; margin-top:5px"></div>';
    ua.updateUserPrefs();
    expect(document.getElementsByClassName('formerrors')[0].innerHTML).toBe('<p>Name is not valid, please fix</p>');
    document.getElementsByClassName('uprofFirstName')[0].value = 'Joe';
    ua.updateUserPrefs();
    expect(document.getElementsByClassName('formerrors')[0].innerHTML).toBe('<p>Name is not valid, please fix</p>');
    document.getElementsByClassName('uprofFirstName')[0].value = 'J oe';
    document.getElementsByClassName('uprofLastName')[0].value = 'Smith';
    ua.updateUserPrefs();
    expect(document.getElementsByClassName('formerrors')[0].innerHTML).toBe('<p>Name is not valid, please fix</p>');
    document.getElementsByClassName('uprofFirstName')[0].value = 'Joe';
    document.getElementsByClassName('uprofLastName')[0].value = 'Sm ith';
    ua.updateUserPrefs();
    expect(document.getElementsByClassName('formerrors')[0].innerHTML).toBe('<p>Name is not valid, please fix</p>');
    done();
  });
//   it('Updates User Details with a valid form', (done) => {
//     document.body.innerHTML = '<div class="UserProfileForm"><div class="elevation3" style="max-width:3.25in; margin:auto"><form><table><tbody>' +
// '<tr><th>First Name <span style="color:red">*</span></th><th>Last Name <span style="color:red">*</span></th></tr>' +
// '<tr><td><input class="uprofFirstName" style="width:100%" name="first_name" value="" required></td><td><input class="uprofLastName" style="width:100%" name="last_name" value="" required></td></tr>' +
// '<tr><th colspan="2">Organization</th></tr><tr><td colspan="2"><input class="uprofAff" style="width:100%" name="affiliation" value=""></td></tr>' +
// '<tr><th colspan="2">Organisms</th></tr><tr><td colspan="2"><input class="uprofOrganisms" name="organisms" style="width:100%"></td></tr>' +
// '<tr><th colspan="2">Interests</th></tr><tr><td colspan="2"><textarea class="uprofInterests" rows="10" name="interests" style="height:85px;width:100%" value=""></textarea></td></tr>' +
// '</tbody></table><div><span style="color:red; font-style: italic; text-align:left; margin-left:-120px">* Indicates a required field</span>' +
// '<button class="updateprofbutton" type="button" style="margin-left:240px" click.delegate="updateUserPrefs()">Update Profile</button></div></form></div>' +
// '<div class="formerrors" style="color:red; margin-top:5px"></div></div>';
//     //ua.attached();
//     document.getElementsByClassName('uprofFirstName')[0].value = 'Joe';
//     document.getElementsByClassName('uprofLastName')[0].value = 'Smith';
//     ua.user = {userType: 'Developer'};
//     ua.updateUserPrefs();
//     expect(document.getElementsByClassName('formerrors')[0].innerHTML).toBe('');
//     ua.user.userType = '';
//     ua.updateUserPrefs();
//     expect(document.getElementsByClassName('formerrors')[0].innerHTML).toBe('<p>Select a primary user type.</p>');
//     done();
//   });

  // it('Does not initiate a User Email Change Request with invalid email', (done) => {
  //   document.body.innerHTML = '<div class="UserProfileForm"><div class="formerrors" style="color:red; margin-top:5px"></div><input class="uprofEmail" style="width:2.5in" type="email" name="email" value="" required></div>';
  //   ua.attached();
  //   ua.user = {userType: 'Developer'};
  //   ua.changeUserEmail();
  //   expect(document.getElementsByClassName('formerrors')[0].innerHTML).toBe('<p>Email address is not valid</p>');
  //   document.getElementsByClassName('uprofEmail')[0].value = 'me@com';
  //   ua.changeUserEmail();
  //   expect(document.getElementsByClassName('formerrors')[0].innerHTML).toBe('<p>Email address is not valid</p>');
  //   done();
  // });
  // it('Initiate a User Email Change Request when given a valid email', (done) => {
  //   document.body.innerHTML = '<div class="UserProfileForm"><div class="formerrors" style="color:red; margin-top:5px"></div><input class="uprofEmail" style="width:2.5in" type="email" name="email" value="" required></div>';
  //   ua.attached();
  //   //ua.changeUserEmail();
  //   //expect(document.getElementsByClassName('formerrors')[0].innerHTML).toBe('<p>Email address is not valid</p>');
  //   document.getElementsByClassName('uprofEmail')[0].value = 'me@you.com';
  //   ua.changeUserEmail();
  //   expect(document.getElementsByClassName('formerrors')[0].innerHTML).toBe('');
  //   done();
  // });
});
