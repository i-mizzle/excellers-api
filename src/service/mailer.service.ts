'use strict';
const mailgun = require("mailgun-js");
const inlineCSS = require('inline-css');
// const config = require("config");
import fs from 'fs';
import path from 'path';
import config from 'config';

import { OrderNotificationTemplate } from '../static/email-templates/order-notification-template';
import { OrderStatusNotificationTemplate } from '../static/email-templates/order-status-notification-template';
import { UserOrderNotificationTemplate } from '../static/email-templates/user-order-notification-template';
import { NewEnquiryNotificationTemplate } from '../static/email-templates/new-enquiry-notification-template';

const mailgunConfig: any = config.get('mailgun');

const mg = mailgun({
    apiKey: mailgunConfig.API_KEY, 
    domain: mailgunConfig.DOMAIN,
    // host: 'api.eu.mailgun.net'
});

interface MailParams {
    mailTo: string,
}

export interface OrderNotificationMailParams extends MailParams {
    orderBy: {
        name: string
        email: string
        phone: string
    }
    items: any[]
    total: string
    deliveryType: string
    paymentMethod: string
    deliveryAddress?: string
    // activationCode?: string
}

export interface OrderStatusNotificationMailParams extends MailParams {
    orderBy: {
        name: string
        email: string
        phone: string
    }
    items: any[]
    total: string
    deliveryType: string
    paymentMethod: string
    deliveryAddress?: string
    newStatus: string
    // activationCode?: string
}

export interface EnquiryEmailParams extends MailParams {
    name: string
    email: string
    phone: string
    enquiry: string
}

interface BackupMailParams extends MailParams {
    firstName: string
    exportDir: string
}


export async function sendOrderNotification (mailParams: OrderNotificationMailParams) {
    try {
        const template = OrderNotificationTemplate(mailParams);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'Excellers <no-reply@excellers.com.ng>',
            to: mailParams.mailTo,
            subject: 'New Order on Excellers ecommerce',
            // template: 'email_confirmation',
            text: `There's a new order on excellers`,
            html: html,
            // "",
            // "h:X-Mailgun-Variables": JSON.stringify({
            //     firstName: mailParams.firstName,
            //     confirmationUrl: mailParams.confirmationUrl
            // })
        };

        await mg.messages().send(data);
        console.log('Sent!');
        return {
            error: false,
            errorType: '',
            data: {message: `mail sent to ${mailParams.mailTo}`}
        }
    } catch (error) {
        console.log('error in mailer function ', error)
        return {
            error: true,
            errorType: 'error',
            data: error
        }
    }
}

export async function sendOrderNotificationToUser (mailParams: OrderNotificationMailParams) {
    try {
        const template = UserOrderNotificationTemplate(mailParams);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'Nadabakehouse <no-reply@nadabakehouse.com>',
            to: mailParams.mailTo,
            subject: 'Your new Order on Nadabakehouse ecommerce',
            // template: 'email_confirmation',
            text: `There's a new order on nadabakehouse`,
            html: html,
            // "",
            // "h:X-Mailgun-Variables": JSON.stringify({
            //     firstName: mailParams.firstName,
            //     confirmationUrl: mailParams.confirmationUrl
            // })
        };

        await mg.messages().send(data);
        console.log('Sent!');
        return {
            error: false,
            errorType: '',
            data: {message: `mail sent to ${mailParams.mailTo}`}
        }
    } catch (error) {
        console.log('error in mailer function ', error)
        return {
            error: true,
            errorType: 'error',
            data: error
        }
    }
}

export async function sendOrderStatusUpdateNotification (mailParams: OrderStatusNotificationMailParams) {
    try {
        const template = OrderStatusNotificationTemplate(mailParams);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'Nadabakehouse <no-reply@nadabakehouse.com>',
            to: mailParams.mailTo,
            subject: 'Your order has been updated',
            // template: 'email_confirmation',
            text: `There's a new order on nadabakehouse`,
            html: html,
            // "",
            // "h:X-Mailgun-Variables": JSON.stringify({
            //     firstName: mailParams.firstName,
            //     confirmationUrl: mailParams.confirmationUrl
            // })
        };

        await mg.messages().send(data);
        console.log('Sent!');
        return {
            error: false,
            errorType: '',
            data: {message: `mail sent to ${mailParams.mailTo}`}
        }
    } catch (error) {
        console.log('error in mailer function ', error)
        return {
            error: true,
            errorType: 'error',
            data: error
        }
    }
}

export async function sendEnquiryNotification (mailParams: EnquiryEmailParams) {
    try {
        const template = NewEnquiryNotificationTemplate(mailParams);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'Nadabakehouse <no-reply@nadabakehouse.com>',
            to: mailParams.mailTo,
            subject: 'New Enquiry from Nadabakehouse Website',
            // template: 'email_confirmation',
            text: `There's a new enquiry on nadabakehouse website`,
            html: html,
            // "",
            // "h:X-Mailgun-Variables": JSON.stringify({
            //     firstName: mailParams.firstName,
            //     confirmationUrl: mailParams.confirmationUrl
            // })
        };

        await mg.messages().send(data);
        console.log('Sent!');
        return {
            error: false,
            errorType: '',
            data: {message: `mail sent to ${mailParams.mailTo}`}
        }
    } catch (error) {
        console.log('error in mailer function ', error)
        return {
            error: true,
            errorType: 'error',
            data: error
        }
    }
}


export const sendBackupsEmail = async (mailParams: BackupMailParams) => {
    const files = fs.readdirSync(mailParams.exportDir).map(file => ({
        filename: file,
        path: path.join(mailParams.exportDir, file)
    }));
    const date = new Date().toISOString().slice(0, 10);

    const data = {
        from: 'Vaatia College Platforms <no-reply@vaatiacollege.com>',
        to: mailParams.mailTo,
        subject: `VCM database dumps for ${config.get('environment')} - ${date}`,
        text: `Please find the exported MongoDB collections attached for ${config.get('environment')} environment.`,
        attachment: files.map(file => fs.createReadStream(file.path))  // Attach file streams
    };

    mg.messages().send(data, (error: any, body: any) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', body);
        }
    });
};



