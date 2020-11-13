const ACData = require('adaptivecards-templating'); 
const AdaptiveCards = require('adaptivecards'); 

// Function returns an adaptive card for a customer
exports.getCard = function (customer) {

    var CustomerLoad =
    {
        "type": "AdaptiveCard",
        "body": [
            {
                "type": "ColumnSet",
                "columns": [
                    // {
                    //     "type": "Column",
                    //     "items": [
                    //         {
                    //             "type": "Image",
                    //             "style": "Person",
                    //             "url": "#",
                    //             "size": "Small"
                    //         }
                    //     ],
                    //     "width": "auto"
                    // },
                    {
                        "type": "Column",
                        "items": [
                            {
                                "type": "TextBlock",
                                "weight": "Bolder",
                                "size": "Medium",
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
                                "$data": "${state}",
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
    var ManagerCardLoad = template.expand({
        $root: customer
    });
    var adaptiveCard = new AdaptiveCards.AdaptiveCard();
    adaptiveCard.parse(ManagerCardLoad);

    return adaptiveCard;

}