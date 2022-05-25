// This api will come in the next version

import { AuthConfig } from 'angular-oauth2-oidc';

export const auth0Config: AuthConfig = {
  // Url of the Identity Provider
  issuer: 'https://tcb-auth0poc.us.auth0.com/',

  // URL of the SPA to redirect the user to after login
  // redirectUri: window.location.origin
  //   + ((localStorage.getItem('useHashLocationStrategy') === 'true')
  //     ? '/#/index.html'
  //     : '/index.html'),

  redirectUri: window.location.origin + '/home',

  // URL of the SPA to redirect the user after silent refresh
  silentRefreshRedirectUri: window.location.origin + '/home',

  // The SPA's id. The SPA is registerd with this id at the auth-server
  clientId: 'y1MJggUfbCZprLZ5DRksEewVhX5EFN9V',

  dummyClientSecret: 'CHJGxVYt7q87uDXunkqhsxgIM2Me5uIjxvN0-L8NPxWS4-ODB220NF8JRJl8tWd6',

  // set the scope for the permissions the client should request
  // The first three are defined by OIDC. The 4th is a usecase-specific one
  scope: 'openid profile email voucher offline_access',

  showDebugInformation: true,

  strictDiscoveryDocumentValidation: false,

  oidc: false,

  // timeoutFactor: 0.01,
};
