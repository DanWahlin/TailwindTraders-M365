// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
    TurnContext,
    MessageFactory,
    TeamsInfo,
    TeamsActivityHandler,
    CardFactory,
    ActionTypes
} = require('botbuilder');
const CustomerService = require('./services/customers');

const WELCOMED_USER = 'welcomedUserProperty';

class BotActivityHandler extends TeamsActivityHandler {
    constructor(userState, conversationReferences) {
        super();

        this.welcomedUserProperty = userState.createProperty(WELCOMED_USER);
        this.userState = userState;
        this.conversationReferences = conversationReferences;

        this.onConversationUpdate(async (context, next) => {
            this.addConversationReference(context.activity);
            this.userState = userState;
            await next();
        });

        this.onMembersAdded(async (context, next) => {

            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {

                    await this.sendIntroCard(context);
                }
            }

            await next();
        });

        this.onMessage(async (context, next) => {

            const didBotWelcomedUser = await this.welcomedUserProperty.get(context, false);

            const userName = context.activity.from.name;
            // if (didBotWelcomedUser === false) {
            //     await context.sendActivity(`Hi ${userName}.`);
            //     await this.welcomedUserProperty.set(context, true);
            // }

            const text = context.activity.text.toLowerCase();
            console.log('Message received: ', text);
            switch (text) {
                case 'hello':
                case 'hi':
                    await context.sendActivity(`Hi ${userName}. You don't have any new notifications.`);
                    break;
                case 'latest customer':
                case 'customer':
                    const customerService = new CustomerService();
                    const customer = await customerService.getLatestCustomer();
                    const customerCard = require('./cards/customerCard');
                    const card = customerCard.getCard(customer);
                    await context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });
                    break;
                case 'intro':
                case 'help':
                    await this.sendIntroCard(context);
                    break;
                default:
                    await context.sendActivity(`You said "${context.activity.text}"`);
            }
            await next();
        });



    }
    
    addConversationReference(activity) {
        const conversationReference = TurnContext.getConversationReference(activity);
        this.conversationReferences[conversationReference.conversation.id] = conversationReference;
    }

    async run(context) {
        await super.run(context);

        // Save state changes
        await this.userState.saveChanges(context);
    }

    async sendIntroCard(context) {
        const card = CardFactory.heroCard(
            'Welcome to the Tailwind Traders Notification Bot!',
            'I will inform you everytime you are assigned to a new customer. You can also review the dashboard, customer list and get more details about me.',
            ['https://techcommunity.microsoft.com/t5/image/serverpage/image-id/62311iD9059E979F04D74B?v=1.0'],
            [
                {
                    type: ActionTypes.OpenUrl,
                    title: 'Dashboard',
                    value: 'https://docs.microsoft.com/en-us/azure/bot-service/?view=azure-bot-service-4.0'
                },
                {
                    type: ActionTypes.OpenUrl,
                    title: 'Customer list',
                    value: 'https://stackoverflow.com/questions/tagged/botframework'
                },
                {
                    type: ActionTypes.OpenUrl,
                    title: 'Learn more about the bot',
                    value: 'https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-deploy-azure?view=azure-bot-service-4.0'
                }
            ]
        );

        await context.sendActivity({ attachments: [card] });
    }

}


module.exports = BotActivityHandler;

