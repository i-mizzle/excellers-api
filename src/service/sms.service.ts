'use strict';
const requestPromise = require("request-promise");
const config = require("config");

interface MessageObject {
    recipient: String
    messageBody: String
}

/**
 * DEPRECATED - This method integrates with the payafrik API v1
 * @param messageObject 
 * @returns 
 */

export const sendMessage = async (messageObject: MessageObject) => {
    let url = `https://api.payafrik.io/notifications/send/sms/`;
    let verb = "POST";
    let smsResponse = null;        
    // set the message and send, if it's sent, update in notifications object as sent or set as failed
    let requestHeaders = {
        "Content-Type": "application/json",
        "X-PFK-TOKEN": config.payafrik.X_PFK_TOKEN
    };
    let requestBody = {
        recipient: messageObject.recipient,
        message: messageObject.messageBody
    }
    let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(requestBody) };
    try {
        smsResponse = await requestPromise(requestOptions);
        return true
    } catch (error) {
        console.log("SEND SMS Error ====>", error);
        return false
    }
}

export const sendMessageV2 = async (messageObject: MessageObject) => {
    // Set your app credentials
    const credentials = {
        apiKey: config.africasTalking.API_KEY,
        username: config.africasTalking.USERNAME,
    }

    // Initialize the SDK
    const AfricasTalking = require('africastalking')(credentials);

    // Get the SMS service
    const sms = AfricasTalking.SMS;

    function sendMessage() {
        const options = {
            // Set the numbers you want to send to in international format
            to: [messageObject.recipient],
            // Set your message
            message: messageObject.messageBody
            // Set your shortCode or senderId
            // from: 'PAYAFRIK'
        }

        // That’s it, hit send and we’ll take care of the rest
        sms.send(options)
            .then(console.log)
            .catch(console.log);
    }

    try {
        sendMessage();        
    } catch (error) {
        console.log(error)
    }

}
