'use strict';
const mailgun = require("mailgun-js");
const inlineCSS = require('inline-css');
// const config = require("config");

import config from 'config';
import { UserEmailConfirmationTemplate } from '../static/email-templates/user-email-confirmation';
import { PasswordResetEmailTemplate } from '../static/email-templates/password-reset-email-template';

const mailgunConfig: any = config.get('mailgun');

const mg = mailgun({
    apiKey: mailgunConfig.API_KEY, 
    domain: mailgunConfig.DOMAIN,
    host: 'api.eu.mailgun.net'
});

interface MailParams {
    mailTo: String,
}

interface AffiliateApprovalMailParams extends MailParams {
    firstName: String
}

interface WalletCreationMailParams extends MailParams, AffiliateApprovalMailParams {
    accountName: String
    accountNumber: String
    bank: String
}

export interface ConfirmationMailParams extends MailParams {
    firstName: String
    confirmationUrl: String
}

interface InvitationMailParams extends MailParams {
    firstName: String
    invitationUrl: String
}

export interface PasswordResetMailParams extends MailParams {
    firstName: String
    resetUrl: String
}

export async function sendEmailConfirmation (mailParams: ConfirmationMailParams) {
    console.log('MAILGUN --->', mg)
    try {
        const template = UserEmailConfirmationTemplate(mailParams);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'GeoTravels <no-reply@bcf.ng>',
            to: mailParams.mailTo,
            subject: 'Welcome to GeoTravels',
            // template: 'email_confirmation',
            text: `Validate your email using this link - ${mailParams.confirmationUrl}`,
            html: html,
            // "",
            // "h:X-Mailgun-Variables": JSON.stringify({
            //     firstName: mailParams.firstName,
            //     confirmationUrl: mailParams.confirmationUrl
            // })
        };
        console.log(mg)
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

export async function sendInvitation (mailParams: InvitationMailParams) {
    try {
        const data = {
            from: 'GeoTravels <no-reply@geotravels.com>',
            to: mailParams.mailTo,
            subject: `You've been invited to GeoTravels Admin`,
            template: 'admin_invitation',
            "h:X-Mailgun-Variables": JSON.stringify({
                firstName: mailParams.firstName,
                invitationUrl: mailParams.invitationUrl
            })
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

export async function sendPasswordResetEmail (mailParams: PasswordResetMailParams) {
    try {
        const template = PasswordResetEmailTemplate(mailParams);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'GeoTravels <no-reply@geotravels.com>',
            to: mailParams.mailTo,
            subject: 'Reset your password',
            text: `Reset your password using this link - ${mailParams.resetUrl}`,
            html: html,
            "h:X-Mailgun-Variables": JSON.stringify({
                firstName: mailParams.firstName,
                resetUrl: mailParams.resetUrl
            })
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

export async function sendAffiliateApprovalConfirmation (mailParams: AffiliateApprovalMailParams) {
    try {
        const data = {
            from: 'GeoTravels <no-reply@geotravels.com>',
            to: mailParams.mailTo,
            subject: 'Your Affiliate account has been approved',
            template: 'password_reset',
            "h:X-Mailgun-Variables": JSON.stringify({
                firstName: mailParams.firstName,
            })
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

export async function sendWalletCreationNotification (mailParams: WalletCreationMailParams) {
    try {
        const data = {
            from: 'GeoTravels <no-reply@geotravels.com>',
            to: mailParams.mailTo,
            subject: 'Your Affiliate account has been approved',
            template: 'password_reset',
            "h:X-Mailgun-Variables": JSON.stringify({
                firstName: mailParams.firstName,
            })
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

export async function sendSubscriptionConfirmation (mailParams: AffiliateApprovalMailParams) {
    try {
        const data = {
            from: 'GeoTravels <no-reply@geotravels.com>',
            to: mailParams.mailTo,
            subject: 'Your Affiliate account has been approved',
            template: 'password_reset',
            "h:X-Mailgun-Variables": JSON.stringify({
                firstName: mailParams.firstName,
            })
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


