// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const ACData = require('adaptivecards-templating'); 
const AdaptiveCards = require('adaptivecards'); 
const {
   
    CardFactory, TeamsInfo,
    
} = require('botbuilder');

// Import required pckages
const path = require('path');
const express = require('express');

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
//const { BotFrameworkAdapter } = require('botbuilder');
const { BotFrameworkAdapter, UserState, MemoryStorage } = require('botbuilder');

// index.js is used to setup and configure your bot
const memoryStorage = new MemoryStorage();
const userState = new UserState(memoryStorage);
const conversationReferences = {};
// Create the main dialog.


// Import bot definitions
const { BotActivityHandler } = require('./botActivityHandler');
const { userInfo } = require('os');

// Read botFilePath and botFileSecret from .env file.
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: process.env.BotId,
    appPassword: process.env.BotPassword
});

adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

// Create bot handlers
const botActivityHandler = new BotActivityHandler(userState,conversationReferences);

// Create HTTP server.
const server = express();
const port = process.env.port || process.env.PORT || 3978;
server.listen(port, () => 
    console.log(`\Bot/ME service listening at https://localhost:${port}`)
);

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Process bot activity
        await botActivityHandler.run(context);
    });
});

function getCustomer(id){

    return fetch("http://localhost:8080/api/customers/${id}",
            {
                method: 'GET',
                headers: {
                    "accept": "application/json",
                    //"authorization": "bearer " + data
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
            .then((customer) => {
                return customer;
            });
}

//Reference: https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-proactive-message?view=azure-bot-service-4.0&tabs=javascript

server.get('/api/notify', async (req, res) => {
    
    for (const conversationReference of Object.values(conversationReferences)) {
        await adapter.continueConversation(conversationReference, async (context) => {
            // If you encounter permission-related errors when sending this message, see
            // https://aka.ms/BotTrustServiceUrl            
            var CustomerLoad = 
                {
                    "type": "AdaptiveCard",
                    "body": [
                        {
                            "type": "TextBlock",
                            "size": "Large",
                            "weight": "Bolder",
                            "text": "You are assigned to a new customer!"
                        },
                        {
                            "type": "TextBlock",
                            "size": "Default",
                            "weight": "Default",
                            "text": "Get to know your customer, here is some details."
                        },
                        {
                            "type": "ColumnSet",
                            "columns": [
                                {
                                    "type": "Column",
                                    "items": [
                                        {
                                            "type": "Image",
                                            "style": "Person",
                                            "url": "${profileImage}",
                                            "size": "Small"
                                        }
                                    ],
                                    "width": "auto"
                                },
                                {
                                    "type": "Column",
                                    "items": [
                                        {
                                            "type": "TextBlock",
                                            "weight": "Bolder",
                                            "size":"Medium",
                                            "text": "${firstName} ${lastName}",
                                            "wrap": true
                                        },
                                        {
                                            "type": "TextBlock",
                                            "spacing": "None",
                                            "text": "${address}, ${city}",
                                            "isSubtle": true,
                                            "wrap": true
                                        },
                                        {
                                            "type": "TextBlock",
                                            "spacing": "None",
                                            "text": "${name}, ${abbreviation}",
                                            "$data":"${state}",
                                            "isSubtle": true,
                                            "wrap": true
                                        }
                                    ],
                                    "width": "stretch"
                                }
                            ]
                        },
                        {
                            "type": "TextBlock",
                            "text": "Recent Orders:",
                            "weight": "Bolder",
                            "wrap": true
                        },
                        {
                            "type": "FactSet",
                            "weight": "Default",
                            "facts": [
                                {
                                    "$data": "${orders}",
                                    "title": "${productName}: $ ${itemCost}",
                                    "value": "${itemCost}"
                                }
                            ]
                        }
                    ],
                    "actions": [
                       
                        {
                            "type": "Action.OpenUrl",
                            "title": "View more details",
                            "url": "${viewUrl}"
                        }
                    ],
                    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                    "version": "1.3"
                };
           
            // Create a Template instance from the template
            var template = new ACData.Template(CustomerLoad);
            
            // Expand the template with your `$root` data object.
            // This binds it to the data and produces the final Adaptive Card payload

            let customer = await getCustomer(1);
               

            var ManagerCardLoad = template.expand({
             $root: customer
                 //{
            //     "id": 1,
            //     "firstName": "Ted",
            //     "lastName": "James",
            //     "profileImage":"https://pbs.twimg.com/profile_images/3647943215/d7f12830b3c17a5a9e4afcc370e3a37e_400x400.jpeg",
            //     "gender": "male",
            //     "address": "1234 Anywhere St.",
            //     "city": " Phoenix ",
            //     "state": {
            //       "abbreviation": "AZ",
            //       "name": "Arizona"
            //     },
            //     "orders": [
            //       { "productName": "Basketball", "itemCost": 7.99 },
            //       { "productName": "Shoes", "itemCost": 199.99 }
            //     ],
            //     "latitude": 33.299,
            //     "longitude": -111.963
            //   }
              
            });
            var adaptiveCard = new AdaptiveCards.AdaptiveCard();
            adaptiveCard.parse(ManagerCardLoad);
            
            await context.sendActivity({ attachments: [CardFactory.adaptiveCard(adaptiveCard)] });
        });
    }

    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.write('<html><body><h1>Proactive messages have been sent.</h1></body></html>');
    res.end();
});