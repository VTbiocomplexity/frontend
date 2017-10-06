export class Dashboard {
  //heading = 'Welcome to the Montage App';
  // firstName = 'John';
  // lastName = 'Doe';
  // previousValue = this.fullName;

  //Getters can't be directly observed, so they must be dirty checked.
  //However, if you tell Aurelia the dependencies, it no longer needs to dirty check the property.
  //To optimize by declaring the properties that this getter is computed from, uncomment the line below
  //as well as the corresponding import above.
  //@computedFrom('firstName', 'lastName')
  // get fullName() {
  //   return `${this.firstName} ${this.lastName}`;
  // }

  // submit() {
  //   this.previousValue = this.fullName;
  //   // eslint-disable-next-line no-alert
  //   alert(`Welcome, ${this.fullName}!`);
  // }

  // canDeactivate() {
  //   if (this.fullName !== this.previousValue) {
  //     // eslint-disable-next-line no-alert
  //     return confirm('Are you sure you want to leave?');
  //   }
  // }
}
