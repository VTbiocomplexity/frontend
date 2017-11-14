const Fetch = require('isomorphic-fetch');
class User {
  constructor() {
    this.backendUrl = 'http://localhost:7000';
    this.frontendUrl = 'http://localhost:3000';
    this.fetch = Fetch;
    this.searchParams = new URLSearchParams(window.location.search);
    this.uid = '';
    this.userEmail = this.searchParams.get('email');
    this.changeEmail = this.searchParams.get('changeemail');
    this.formType = '';
    this.formType += this.searchParams.get('form');
    this.userToken = localStorage.getItem('token');
    this.verifyEmail();
  }

  verifyEmail() {
    let formTitle = '';
    let passInput = '';
    let formButton = '';
    //console.log('going to verify this address: ' + userEmail);
    let emailVarifyForm = document.createElement('div');
    if (this.formType === 'reset') {
      formTitle = 'Reset Your Password';
      passInput = '<tr><th style="border:none; text-align:left">Password</th></tr><tr><td><input class="loginpass" pattern=".{8,}" title="8 characters minimum" type="password" name="password" style="width:300px;" value="" required onchange="userClass.validateForm()" onfocus="userClass.validateForm()" onkeydown="userClass.validateForm()" onkeyup="userClass.validateForm()"></td></tr>';
      formButton = 'this.resetPasswd()';
    } else {
      formTitle = 'Verify Your Email Address';
      formButton = 'this.updateUser';
      if (this.changeEmail !== '' && this.changeEmail !== null && this.changeEmail !== undefined) {
        formButton = 'this.verifyChangeEmail()';
      }
    }

    emailVarifyForm.className = 'RegistrationForm';
    emailVarifyForm.innerHTML = '<h2 style="margin:0px;padding:4px;font-size:1.2em;text-align:center;background:#eee;">' + formTitle + '</h2><form>' +
    '<div style="padding:2px; margin:10px;"><table><tbody><tr><th style="text-align:left">Email</th></tr><tr><td>' +
    '<input class="email" type="email" name="email" style="width:250px;" required value="" required onchange="userClass.validateForm()" onfocus="userClass.validateForm()" onkeydown="userClass.validateForm()" onkeyup="userClass.validateForm()" onpaste="userClass.validateForm()">' +
    '</td></tr><tr><td> </td></tr>' + passInput + '<tr><td> </td></tr><tr><th style="text-align:left">Code</th></tr><tr><td>' +
    '<input type="number" title="5 digit code" name="code" class="code" style="width:150px;" required" value=""></td></tr>' +
    '</tbody></table></div><div style="text-align:center;padding:2px;margin:10px;">' +
    '<div><button style="display:none; margin-bottom:-22px;" type="button" class="regbutton" onclick="' + formButton + '">Submit</button><button type="button" onclick="userClass.nevermind(&apos;RegistrationForm&apos;)">Cancel</button></div></div></form>' +
    '<div class="loginerror" style="color:red"></div>';
    let home = document.getElementsByClassName('home');
    home[0].insertBefore(emailVarifyForm, home[0].childNodes[0]);
    if (this.userEmail !== '' && this.userEmail !== null && this.userEmail !== undefined) {
      document.getElementsByClassName('email')[0].value = this.userEmail;
    } else if (this.changeEmail !== '' && this.changeEmail !== null && this.changeEmail !== undefined) {
      document.getElementsByClassName('email')[0].value = this.changeEmail;
    }
    if (this.formType === 'prefs') {
      document.getElementsByClassName('RegistrationForm')[0].style.display = 'none';
      document.getElementsByClassName('UserProfileForm')[0].style.display = 'block';
      console.log('this is the user token: ' + this.userToken);
      if (this.userToken === null) {
        this.nevermind('UserProfileForm');
      } else {
        this.populateForm();
      }
    } else {
      let verifyCode = document.getElementsByClassName('code')[0];
      verifyCode.formType = this.formType;
      verifyCode.addEventListener('change', this.validateForm);
      verifyCode.addEventListener('focus', this.validateForm);
      verifyCode.addEventListener('keydown', this.validateForm);
      verifyCode.addEventListener('keyup', this.validateForm);
      verifyCode.addEventListener('paste', this.validateForm);
      let submitButton = document.getElementsByClassName('regbutton')[0];
      submitButton.fetchClient = this.fetch;
      if (formTitle === 'Verify Your Email Address'){
        submitButton.addEventListener('click', this.updateUser);
      }
      //onchange="userClass.validateForm()" onfocus="userClass.validateForm()" onkeydown="userClass.validateForm()" onkeyup="userClass.validateForm()" onpaste="userClass.validateForm()
    }
  }

  validateForm(evt) {
    let newpasswd = '';
    this.formType = evt.target.formType;
    if (this.formType === 'reset') {
      newpasswd = document.getElementsByClassName('loginpass')[0];
    }
    let isemailvalid = document.getElementsByClassName('email')[0].checkValidity();
    let emValue = document.getElementsByClassName('email')[0].value;
    let edot = emValue.split('.');
    let isvalidcode = document.getElementsByClassName('code')[0].value;
    let submitbutton = document.getElementsByClassName('regbutton')[0];
    console.log(isemailvalid);
    console.log(isvalidcode);
    console.log(edot.length);
    if (isemailvalid && isvalidcode !== '' && edot.length > 1 && isvalidcode > 9999 && isvalidcode < 100000) {
      submitbutton.style.display = 'block';
    } else {
      submitbutton.style.display = 'none';
    }
    if (this.formType === 'reset') {
      if (newpasswd.checkValidity() && isemailvalid && edot.length > 1 && isvalidcode > 9999 && isvalidcode < 100000) {
        submitbutton.style.display = 'block';
      } else {
        submitbutton.style.display = 'none';
      }
    }
  }

  updateUser(evt) {
    console.log('trying to valide the user email with a code');
    let fetchClient = evt.target.fetchClient;
    let bodyData = {'email': document.getElementsByClassName('email')[0].value, 'resetCode': document.getElementsByClassName('code')[0].value };
    let fetchData = {
      method: 'PUT',
      body: JSON.stringify(bodyData),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    return fetchClient('http://localhost:7000' + '/auth/validemail', fetchData)
  //.then(handleErrors)
  .then((response) => response.json())
  .then((data) => {
    if (data.message) {
      //console.log(data.message);
      let messagediv = document.getElementsByClassName('loginerror')[0];
      messagediv.innerHTML = '<p style="text-align:left; padding-left:12px">' + data.message + '</p>';
    } else {
      //this.nevermind('RegistrationForm');
      //let regform1 = [];
      let regform1 = document.getElementsByClassName('RegistrationForm');
      if (regform1.length > 0) {
        regform1[0].style.display = 'none';
      }
      window.location.href = 'http://localhost:9000' + '/';
    }
  })
  .catch((error) => {
    console.log(error);
    //console.log
  });
  }

  populateForm() {
    let bodyData = {'email': localStorage.getItem('useremail') };
    //var cookieToken = getCookieToken();
    let fetchData = {
      method: 'POST',
      //credentials: 'same-origin',
      body: JSON.stringify(bodyData),
      headers: {
        //'X-CSRFTOKEN': cookieToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    };
    return this.fetch(this.backendUrl + '/user/', fetchData)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      document.getElementsByClassName('uprofFirstName')[0].value = data[0].first_name;
      document.getElementsByClassName('uprofLastName')[0].value = data[0].last_name;
      document.getElementsByClassName('uprofAff')[0].value = data[0].affiliation;
      document.getElementsByClassName('uprofOrganisms')[0].value = data[0].organisms;
      document.getElementsByClassName('uprofInterests')[0].value = data[0].interests;
      document.getElementsByClassName('uprofEmail')[0].value = data[0].email;
      this.uid = data[0]._id;
      //console.log(data);
    });
  }

  validateUserPrefs() {
    console.log('going to validate firstname, lastname, and email');
    let profBut = document.getElementsByClassName('updateprofbutton')[0];
    let emBut = document.getElementsByClassName('updateemailbutton')[0];
    let fname = document.getElementsByClassName('uprofFirstName')[0].value;
    let fspace = fname.split(' ');
    console.log(fspace.length);
    let lname = document.getElementsByClassName('uprofLastName')[0].value;
    let lspace = lname.split(' ');
    let isemailvalid = document.getElementsByClassName('uprofEmail')[0].checkValidity();
    let emValue = document.getElementsByClassName('uprofEmail')[0].value;
    let edot = emValue.split('.');
    console.log(isemailvalid);
    //let emvalue = document.getElementsByClassName('uprofLastName')[0]
    if (fname !== '' && lname !== '' && fspace.length === 1 && lspace.length === 1) {
      profBut.style.display = 'block';
    } else {
      profBut.style.display = 'none';
    }
    if (isemailvalid && edot.length > 1) {
      emBut.style.display = 'block';
    } else {
      emBut.style.display = 'none';
    }
  }

  updateUserPrefs() {
    let fname = document.getElementsByClassName('uprofFirstName')[0].value;
    let lname = document.getElementsByClassName('uprofLastName')[0].value;
    //document.getElementsByClassName('uprofEmail')[0].value = data[0].email;
    //this.uid = data[0]._id;
    let bodyData = {'first_name': fname, 'last_name': lname, 'name': fname + ' ' + lname,
      'affiliation': document.getElementsByClassName('uprofAff')[0].value,
      'organisms': document.getElementsByClassName('uprofOrganisms')[0].value,
      'interests': document.getElementsByClassName('uprofInterests')[0].value};
    let fetchData = {
      method: 'PUT',
      //credentials: 'same-origin',
      body: JSON.stringify(bodyData),
      headers: {
        //'X-CSRFTOKEN': cookieToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    };
    return this.fetch(this.backendUrl + '/user/' + this.uid, fetchData)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      this.nevermind('UserProfileForm');
    });
  }

  resetPasswd() {
    let bodyData = {'email': document.getElementsByClassName('email')[0].value,
      'resetCode': document.getElementsByClassName('code')[0].value,
      'password': document.getElementsByClassName('loginpass')[0].value
    };
    let fetchData = {
      method: 'PUT',
      body: JSON.stringify(bodyData),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    return this.fetch(this.backendUrl + '/auth/passwdreset', fetchData)
  .then((response) => response.json())
  .then((data) => {
    //console.log(data);
    if (data.message) {
      //console.log(data.message);
      let messagediv = document.getElementsByClassName('loginerror')[0];
      messagediv.innerHTML = '<p style="text-align:left; padding-left:12px">' + data.message + '</p>';
      // return data.message;
    }
    this.nevermind('RegistrationForm');
  })
  .catch((error) => {
    console.log(error);
    //console.log
  });
  }

  nevermind(className) {
    let regform1 = [];
    regform1 = document.getElementsByClassName(className);
    if (regform1.length > 0) {
      regform1[0].style.display = 'none';
    }
    window.location.href = this.frontendUrl + '/';
  }

  changeUserEmail() {
    let bodyData = {'changeemail': document.getElementsByClassName('uprofEmail')[0].value, 'email': localStorage.getItem('useremail') };
    let fetchData = {
      method: 'PUT',
      body: JSON.stringify(bodyData),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    return this.fetch(this.backendUrl + '/auth/changeemail', fetchData)
  //.then(handleErrors)
  .then((response) => response.json())
  .then((data) => {
    if (data.message) {
      //console.log(data.message);
      let messagediv = document.getElementsByClassName('loginerror')[0];
      messagediv.innerHTML = '<p style="text-align:left; padding-left:12px">' + data.message + '</p>';
    } else {
      window.location.href = this.frontendUrl + '/userutil/?changeemail=' + document.getElementsByClassName('uprofEmail')[0].value;
    }
  })
  .catch((error) => {
    console.log(error);
    //console.log
  });
  }

  verifyChangeEmail() {
    console.log('using your pin to validate your new email address now ...');
    let bodyData = {'changeemail': document.getElementsByClassName('email')[0].value, 'resetCode': document.getElementsByClassName('code')[0].value,
      'email': localStorage.getItem('useremail') };
    let fetchData = {
      method: 'PUT',
      body: JSON.stringify(bodyData),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    return this.fetch(this.backendUrl + '/auth/updateemail', fetchData)
    //.then(handleErrors)
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        //console.log(data.message);
        let messagediv = document.getElementsByClassName('loginerror')[0];
        messagediv.innerHTML = '<p style="text-align:left; padding-left:12px">' + data.message + '</p>';
      } else {
        localStorage.setItem('useremail', document.getElementsByClassName('email')[0].value);
        this.nevermind('RegistrationForm');
        //window.location.href = this.frontendUrl + '/';
      }
    })
    .catch((error) => {
      console.log(error);
      //console.log
    });
  }

}

module.exports = User;