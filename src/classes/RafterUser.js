export class RafterUser {
  constructor() {
  }

  rafterLogout() {
    //console.log('going to log you out');
    localStorage.removeItem('rafterToken');
    localStorage.removeItem('rafterUser');
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'test') {
      //console.log('is this a test?');
      window.location.reload();
    }
  }
}
