## Remove Accepted App from AAD

Login to AAD, go Enterprise Apps, find your app, and delete it. Re-run the app and you should have to give consent again.

## npm Error for MSAL 1.1.1 - unable to resolve dependency tree

```
npm ERR! While resolving: tailwind-traders-m365@1.0.0
npm ERR! Found: tslib@2.0.3
npm ERR! node_modules/tslib
npm ERR!   tslib@"^2.0.0" from the root project
npm ERR!   tslib@"^2.0.0" from @angular/common@10.2.2
npm ERR!   node_modules/@angular/common
npm ERR!     @angular/common@"~10.2.1" from the root project
npm ERR!     peer @angular/common@">= 6.0.0" from @azure/msal-angular@1.1.1
npm ERR!     node_modules/@azure/msal-angular
npm ERR!       @azure/msal-angular@"^1.1.1" from the root project
npm ERR!   1 more (@angular/core)
npm ERR! 
npm ERR! Could not resolve dependency:
npm ERR! peer tslib@"^1.10.0" from @azure/msal-angular@1.1.1
npm ERR! node_modules/@azure/msal-angular
npm ERR!   @azure/msal-angular@"^1.1.1" from the root project
```