const Fetch = require('isomorphic-fetch');

class UserAct {
  constructor(uid) {
    this.fetch = Fetch;
    this.uid = uid;
    this.populateForm();
  }

  // This populates the UserProfileForm, found in the userutil.html (or userutil/index.html)
  populateForm() {
    document.getElementsByClassName('UserProfileForm')[0].style.display = 'block';
    const bodyData = { email: localStorage.getItem('userEmail') };
    const fetchData = {
      method: 'POST',
      body: JSON.stringify(bodyData),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('ndssl_id_token')}`
      }
    };
    return this.fetch(`${process.env.BackendUrl}/user/`, fetchData)
      .then(response => response.json())
      .then((data) => {
        this.fillInFields(data);
      }).catch((err) => {
        console.log(err);
      });
  }

  fillInFields(data) {
    let fname = '';
    let lname = '';
    if (data[0].first_name !== undefined && data[0].last_name !== undefined) {
      fname = data[0].first_name;
      lname = data[0].last_name;
    } else {
      const nameArr = data[0].name.split(' ');
      fname = nameArr[0];
      lname = nameArr[1];
    }
    document.getElementsByClassName('uprofFirstName')[0].value = fname;
    document.getElementsByClassName('uprofLastName')[0].value = lname;
    let org = '';
    if (data[0].affiliation !== undefined) {
      org = data[0].affiliation;
    }
    document.getElementsByClassName('uprofAff')[0].value = org;
    let organis = '';
    if (data[0].expertise !== undefined) {
      organis = data[0].expertise;
    }
    document.getElementsByClassName('uprofexpertise')[0].value = organis;
    let intr = '';
    if (data[0].interests !== undefined) {
      intr = data[0].interests;
    }
    document.getElementsByClassName('uprofInterests')[0].value = intr;
    document.getElementsByClassName('uprofEmail')[0].value = data[0].email;
    this.uid = data[0]._id;
  }

  updateUserPrefs(thisUserType) {
    const fname = document.getElementsByClassName('uprofFirstName')[0].value;
    const lname = document.getElementsByClassName('uprofLastName')[0].value;
    const bodyData = {
      first_name: fname,
      last_name: lname,
      name: `${fname} ${lname}`,
      userType: thisUserType,
      affiliation: document.getElementsByClassName('uprofAff')[0].value,
      expertise: document.getElementsByClassName('uprofexpertise')[0].value,
      interests: document.getElementsByClassName('uprofInterests')[0].value
    };
    const fetchData = {
      method: 'PUT',
      body: JSON.stringify(bodyData),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('ndssl_id_token')}`
      }
    };
    return this.fetch(`${process.env.BackendUrl}/user/${this.uid}`, fetchData)
      .then(response => response.json())
      .then((data) => {
        console.log(data);
        if (data.message) {
          document.getElementsByClassName('formerrors')[0].innerHTML = `<p>${data.message}</p>`;
        } else {
          document.getElementsByClassName('UserProfileForm')[0].style.display = 'none';
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'test') {
            window.location.href = `${process.env.FrontendUrl}/dashboard`;
          }
        }
      });
  }

  // this is only the initial request to change the email address from the User Prefs page
  changeUserEmail() {
    const bodyData = { changeemail: document.getElementsByClassName('uprofEmail')[0].value, email: localStorage.getItem('userEmail') };
    const fetchData = {
      method: 'PUT',
      body: JSON.stringify(bodyData),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };
    return this.fetch(`${process.env.BackendUrl}/auth/changeemail`, fetchData)
      .then(response => response.json())
      .then((data) => {
        if (data.message) {
        // console.log(data.message);
          const messagediv = document.getElementsByClassName('formerrors')[0];
          messagediv.innerHTML = `<p style="text-align:left; padding-left:12px">${data.message}</p>`;
        } else {
          let feurl = 'http://localhost:7000';
          /* istanbul ignore if */
          if (process.env.FrontendUrl !== undefined) {
            feurl = process.env.FrontendUrl;
          }
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'test') {
            window.location.href = `${feurl}/userutil/?changeemail=${document.getElementsByClassName('uprofEmail')[0].value}`;
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

module.exports = UserAct;
