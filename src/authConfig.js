// let config;
let myBaseUrl;
if (window.location.hostname === 'localhost' || process.env.NODE_ENV.match(/dev/i)
) {
  myBaseUrl = process.env.BackendUrl;
} else {
  myBaseUrl = process.env.AuthProductionBaseURL;
}

const config = {
  httpInterceptor: true,
  loginOnSignup: true,
  baseUrl: myBaseUrl,
  // loginRedirect: '#/',
  // logoutRedirect: '#/',
  // signupRedirect: '#/login',
  // loginUrl: '/auth/login',
  // signupUrl: '/auth/signup',
  // profileUrl: '/auth/me',
  // loginRoute: '/login',
  // signupRoute: '/signup',
  tokenRoot: false,
  tokenPrefix: 'ndssl',
  responseTokenProp: 'access_token',
  unlinkUrl: '/auth/unlink/',
  unlinkMethod: 'get',
  authHeader: 'Authorization',
  authToken: 'Bearer',
  withCredentials: true,
  platform: 'browser',
  storage: 'localStorage',
  providers: {
    google: {
      name: 'google',
      url: '/auth/google',
      clientId: process.env.GoogleClientId
    }
    // ,
    // linkedin:{
    //     clientId:'778mif8zyqbei7'
    // },
    // facebook:{
    //     clientId:'1452782111708498'
    // }
  },
  // The API specifies that new users register at the POST /users enpoint.
  // signupUrl: 'users',
  // Logins happen at the POST /sessions/create endpoint.
  // loginUrl: 'sessions/create',
  // The API serves its tokens with a key of id_token which differs from
  // aureliauth's standard.
  tokenName: 'id_token',
  // Once logged in, we want to redirect the user to the welcome view.
  loginRedirect: '/dashboard'
};

// let configForProduction = {
//   tokenPrefix: 'ndssl',
//   providers: {
//     google: {
//       clientId: process.env.GoogleClientId
//     }
// ,
// linkedin:{
//     clientId:'7561959vdub4x1'
// },
// facebook:{
//     clientId:'1653908914832509'
// }

// },
// baseUrl: process.env.AuthProductionBaseURL,
// The API specifies that new users register at the POST /users enpoint.
// signupUrl: 'users',
// Logins happen at the POST /sessions/create endpoint.
// loginUrl: 'sessions/create',
// The API serves its tokens with a key of id_token which differs from
// aureliauth's standard.
// tokenName: 'id_token',
// Once logged in, we want to redirect the user to the welcome view.
//   loginRedirect: '/dashboard'
// };

export default config;
