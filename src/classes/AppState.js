export class AppState {
  constructor(httpClient) {
    this.httpClient = httpClient;
    this.user = {};
    this.is_auth = false;
    this.roles = [];
    // this.isOhafLogin = false;
    // this.newUser = false;
  }

  getUserID() {
    return this.user._id;
  }

  getUser(uid) {
    // console.log('appState getUser');
    if (this.getUserID() !== undefined) {
      // console.log('appState returning already set user');
      return new Promise((resolve) => {
        resolve(this.user);
      });
    }
    // console.log('appState getting new user');
    return this.httpClient.fetch(`/user/${uid}`)
      .then(response => response.json())
      .then((data) => {
        const user = data;
        this.setUser(user);
        // check only if this is not a new user
        /* istanbul ignore else */
        if (this.user.userType) {
          this.checkUserRole();
        }
      });
  }

  checkUserRole() {
    if (this.user.userType !== 'Developer') {
      const thisuserrole = this.user.userType;
      this.setRoles([thisuserrole.toLowerCase()]);
    } else {
      const validRoles = JSON.parse(process.env.userRoles).roles;
      const validRolesLowerCase = [];
      for (let i = 0; i < validRoles.length; i++) {
        validRolesLowerCase.push(validRoles[i].toLowerCase());
      }
      this.setRoles(validRolesLowerCase); // developer access to all user roles
      // console.log(validRoles.toLowerCase());
    }
  }

  setUser(input) {
    // console.log('appState setUser');
    // console.log(this.user);
    this.user = input;
  }

  // setNewUser(input) {
  //   this.newUser = input;
  // }

  // getAuth() {
  //   return (this.is_auth);
  // }
  //
  // setAuth(input) {
  //   this.is_auth = input;
  // }

  getRoles() {
    return new Promise((resolve) => {
      resolve(this.roles);
    });
  }

  setRoles(input) {
    this.roles = input;
    // console.log('user roles are ' + this.roles);
  }
}
