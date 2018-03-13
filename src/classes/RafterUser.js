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
  checkExpired(decoded) {
    console.log('check expired');
    let d = new Date();
    let checkd = d.valueOf() / 1000;
    //console.log(checkd);
    if (checkd > decoded.exp) {
      //console.log('expired');
      return false;
    } return true;
  }
}
