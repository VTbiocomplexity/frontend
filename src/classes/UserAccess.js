export class UserAccess {
  constructor(appState) {
    this.appState = appState;
  }

  run(routingContext, next) {
    // if we need to authenticate / authorize, verify the logged in users roles here.
    return this.appState.getRoles().then((userRoles) => {
      if (routingContext.config.auth) {
        console.log('I am entering a route that requires auth');
        console.log(`These are my roles: ${userRoles}`);
        console.log(`The main route is: ${routingContext.fragment}`);

        if (routingContext.fragment === '/dashboard' || routingContext.params.childRoute === 'user-account' ||
        routingContext.params.childRoute === 'rafter') {
          // console.log('I am only trying to go to the main dashboard or user account');
          return next();
        }

        // console.log('The child route is: ' + routingContext.params.childRoute);
        // if (routingContext.params.childRoute === 'user-account') {
        //   return next();
        // }

        for (let i = 0; i < userRoles.length; i += 1) {
          console.log(routingContext.params.childRoute);
          console.log(userRoles[i].toLowerCase());
          // in this case the user is only in one role at a time.
          if (routingContext.params.childRoute === userRoles[i].toLowerCase()) {
            return next();
          }
        }
        return next.cancel();
      }
      // console.log('this route does not require auth, so let them go through');
      return next();
    });
  }
}
