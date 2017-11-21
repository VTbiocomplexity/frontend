const Fetch = require('isomorphic-fetch');
class User_ {
  constructor() {
    this.fetch = Fetch;
    // this.searchParams = new URLSearchParams(window.location.search);
    this.uid = '';
    // this.userEmail = this.searchParams.get('email');
    // this.changeEmail = this.searchParams.get('changeemail');
    // this.formType = '';
    // this.formType += this.searchParams.get('form');
    // this.userToken = localStorage.getItem('token');
    this.populateForm();
  }

//This populates the UserProfileForm, found in the userutil.html (or userutil/index.html)
  populateForm() {
    document.getElementsByClassName('UserProfileForm')[0].style.display = 'block';
    let bodyData = {'email': localStorage.getItem('useremail') };
    let fetchData = {
      method: 'POST',
      body: JSON.stringify(bodyData),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    };
    return this.fetch(process.env.backendUrl + '/user/', fetchData)
    .then((response) => response.json())
    .then((data) => {
      //console.log(data);
      document.getElementsByClassName('uprofFirstName')[0].value = data[0].first_name;
      document.getElementsByClassName('uprofLastName')[0].value = data[0].last_name;
      document.getElementsByClassName('uprofAff')[0].value = data[0].affiliation;
      document.getElementsByClassName('uprofOrganisms')[0].value = data[0].organisms;
      document.getElementsByClassName('uprofInterests')[0].value = data[0].interests;
      document.getElementsByClassName('uprofEmail')[0].value = data[0].email;
      this.uid = data[0]._id;
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
    let bodyData = {'first_name': fname, 'last_name': lname, 'name': fname + ' ' + lname,
      'affiliation': document.getElementsByClassName('uprofAff')[0].value, 'organisms': document.getElementsByClassName('uprofOrganisms')[0].value, 'interests': document.getElementsByClassName('uprofInterests')[0].value};
    let fetchData = {
      method: 'PUT',
      body: JSON.stringify(bodyData),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    };
    return this.fetch(process.env.backendUrl + '/user/' + this.uid, fetchData)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      document.getElementsByClassName('UserProfileForm')[0].style.display = 'none';
      let feurl = 'http://localhost:7000';
        /* istanbul ignore if */
      if (process.env.FrontendUrl !== undefined){
        feurl = process.env.FrontendUrl;
      }
      window.location.href = feurl + '/';
    });
  }

  // nevermind(className) {
  //   let regform1 = [];
  //   regform1 = document.getElementsByClassName(className);
  //   regform1[0].style.display = 'none';
  //   let feurl = 'http://localhost:7000';
  //     /* istanbul ignore if */
  //   if (process.env.FrontendUrl !== undefined){
  //     feurl = process.env.FrontendUrl;
  //   }
  //   window.location.href = feurl + '/';
  // }

// this is only the initial request to change the email address from the User Prefs page
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

    return this.fetch(process.env.backendUrl + '/auth/changeemail', fetchData)
  .then((response) => response.json())
  .then((data) => {
    if (data.message) {
      //console.log(data.message);
      let messagediv = document.getElementsByClassName('loginerror')[0];
      messagediv.innerHTML = '<p style="text-align:left; padding-left:12px">' + data.message + '</p>';
    } else {
      let feurl = 'http://localhost:7000';
        /* istanbul ignore if */
      if (process.env.FrontendUrl !== undefined){
        feurl = process.env.FrontendUrl;
      }
      window.location.href = feurl + '/userutil/?changeemail=' + document.getElementsByClassName('uprofEmail')[0].value;
    }
  })
  .catch((error) => {
    console.log(error);
  });
  }
}

module.exports = User_;
