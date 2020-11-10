import { Injectable } from '@angular/core';
import * as microsoftTeams from '@microsoft/teams-js';

// Based on https://github.com/OfficeDev/msteams-tabs-sso-sample-nodejs/blob/master/src/static/scripts/ssoDemo.js
// Most of the original code is left below (including using the fetch API) to keep it consistent with
// the original source. Keep in mind that Angular's HttpClient could be used in place of fetch() if desired.

@Injectable({ providedIn: 'root' })
export class TeamsAuthService {

    login() {
        try {
            microsoftTeams.initialize();
            microsoftTeams.getContext(context => {
                alert(context.channelId);
                if (context) {
                    // In-line code
                    this.getClientSideToken()
                        .then((clientSideToken) => {
                            return this.getServerSideToken(clientSideToken);
                        })
                        .then((serverSideToken) => {
                            return this.useServerSideToken(serverSideToken);
                        })
                        .catch((error) => {
                            if (error === "invalid_grant") {
                                alert('invalid grant');
                                this.display(`Error: ${error} - user or admin consent required`);
                                // Display in-line button so user can consent
                                // let button = this.display("Consent", "button");
                                // button.onclick = (() => {
                                //     this.requestConsent()
                                //         .then((result) => {
                                //             // Consent succeeded - use the token we got back
                                //             let accessToken = JSON.parse(result as string).accessToken;
                                //             this.display(`Received access token ${accessToken}`);
                                //             this.useServerSideToken(accessToken);
                                //         })
                                //         .catch((error) => {
                                //             this.display(`ERROR ${error}`);
                                //             // Consent failed - offer to refresh the page
                                //             button.disabled = true;
                                //             let refreshButton = this.display("Refresh page", "button");
                                //             refreshButton.onclick = (() => { window.location.reload(); });
                                //         });
                                // });
                            } else {
                                // Something else went wrong
                                this.display(`Error from web service: ${error}`);
                            }
                        });
                }
            });
        }
        catch (e) {
            console.log(e);
        }
    }

    // 1. Get auth token
    // Ask Teams to get us a token from AAD
    getClientSideToken() {

        return new Promise((resolve, reject) => {

            this.display("1. Get auth token from Microsoft Teams");

            microsoftTeams.authentication.getAuthToken({
                successCallback: (result) => {
                    this.display(result)
                    resolve(result);
                },
                failureCallback: function (error) {
                    reject("Error getting token: " + error);
                }
            });

        });

    }

    // 2. Exchange that token for a token with the required permissions
    //    using the web service (see /auth/token handler in app.js)
    getServerSideToken(clientSideToken) {

        this.display("2. Exchange for server-side token");

        return new Promise((resolve, reject) => {

            microsoftTeams.getContext((context) => {

                fetch(window.location.origin + '/api/auth/token', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'tid': context.tid,
                        'token': clientSideToken
                    }),
                    mode: 'cors',
                    cache: 'default'
                })
                    .then((response) => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            reject((response as any).error);
                        }
                    })
                    .then((responseJson) => {
                        if (responseJson.error) {
                            reject(responseJson.error);
                        } else {
                            const serverSideToken = responseJson;
                            this.display(serverSideToken);
                            resolve(serverSideToken);
                        }
                    });
            });
        });
    }

    // 3. Get the server side token and use it to call the Graph API
    useServerSideToken(data) {

        this.display("3. Call https://graph.microsoft.com/v1.0/me/ with the server side token");

        return fetch("https://graph.microsoft.com/v1.0/me/",
            {
                method: 'GET',
                headers: {
                    "accept": "application/json",
                    "authorization": "bearer " + data
                },
                mode: 'cors',
                cache: 'default'
            })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw (`Error ${response.status}: ${response.statusText}`);
                }
            })
            .then((profile) => {
                this.display(JSON.stringify(profile, undefined, 4));
            });

    }

    // Show the consent pop-up
    requestConsent() {
        return new Promise((resolve, reject) => {
            microsoftTeams.authentication.authenticate({
                url: window.location.origin + "/authstart",
                width: 600,
                height: 535,
                successCallback: (result) => {
                    let data = localStorage.getItem(result);
                    localStorage.removeItem(result);
                    resolve(data);
                },
                failureCallback: (reason) => {
                    reject(JSON.stringify(reason));
                }
            });
        });
    }

    // Add text to the display in a <p> or other HTML element
    display(text) {
        console.log(text);
    }

}
