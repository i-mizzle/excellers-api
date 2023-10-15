'use strict';
const mailgun = require("mailgun-js");
const inlineCSS = require('inline-css');
// const config = require("config");

import config from 'config';
import { UserEmailConfirmationTemplate } from '../static/email-templates/user-email-confirmation';
import { PasswordResetEmailTemplate } from '../static/email-templates/password-reset-email-template';
import { AffiliateApprovalConfirmationTemplate } from '../static/email-templates/affiliate-confirmation-template';
import { AffiliateWalletNotificationTemplate } from '../static/email-templates/affiliate-wallet-notification-template';
import { AdminInvitationTemplate } from '../static/email-templates/admin-invitation-template';
import { FlightBookingNotificationTemplate } from '../static/email-templates/flight-booking-notification-template';
import { findEmailSetting } from './email-setting.service';
import { EnquiryConfirmationEmailTemplate } from '../static/email-templates/enquiry-confirmation-template';

const mailgunConfig: any = config.get('mailgun');

const mg = mailgun({
    apiKey: mailgunConfig.API_KEY, 
    domain: mailgunConfig.DOMAIN,
    host: 'api.eu.mailgun.net'
});

interface MailParams {
    mailTo: string,
}

export interface SubscriptionConfirmationMailParams extends MailParams {
    firstName: string
}

export interface EnquiryConfirmationMailParams extends MailParams {
    firstName: string
}

export interface AffiliateApprovalMailParams extends MailParams {
    firstName: string
    activationCode?: String
}

export interface WalletCreationMailParams extends MailParams {
    firstName: string
    accountName: string
    accountNumber: string
    bank: string
}

export interface ConfirmationMailParams extends MailParams {
    firstName: string
    activationCode?: string
}

export interface InvitationMailParams extends MailParams {
    firstName: string
    activationCode?: string
}

export interface PasswordResetMailParams extends MailParams {
    firstName: string
    resetCode: string
}

export interface FlightBookingNotificationMailParams extends MailParams {
    firstName: string
    airline: string
    // invoiceUrl: string
    invoiceCode: string
    bookingCode: string
    origin: string
    destination: string
    outboundDepartureDate: string
    outboundDepartureTime: string
    outboundArrivalDate: string
    outboundArrivalTime: string
    inboundDepartureDate?: string
    inboundDepartureTime?: string
    inboundArrivalDate?: string
    inboundArrivalTime?: string
}

export async function sendEmailConfirmation (mailParams: ConfirmationMailParams) {
    try {
        const emailSettings = await findEmailSetting({slug: 'email-confirmation'})
        
        if(!emailSettings) {
            return
        }

        const template = UserEmailConfirmationTemplate(mailParams, emailSettings);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'GeoTravels <no-reply@bcf.ng>',
            to: mailParams.mailTo,
            subject: emailSettings.mailSubject || 'Welcome to GeoTravels',
            // template: 'email_confirmation',
            text: `Validate your email using this link - ${emailSettings.emailAction.buttonUrl + mailParams?.activationCode}`,
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

export async function sendInvitation (mailParams: InvitationMailParams) {
    try {
        const emailSettings = await findEmailSetting({slug: 'admin-invitation'})
        
        if(!emailSettings) {
            return
        }
        const template = AdminInvitationTemplate(mailParams, emailSettings);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'GeoTravels <no-reply@bcf.ng>',
            to: mailParams.mailTo,
            subject: emailSettings.mailSubject || `You've been invited to GeoTravels Admin`,
            // template: 'admin_invitation',
            // "h:X-Mailgun-Variables": JSON.stringify({
            //     firstName: mailParams.firstName,
            //     invitationUrl: mailParams.invitationUrl
            // })
            text: `Follow this link to accept your invitation to Geotravels - ${emailSettings.emailAction.buttonUrl + mailParams?.activationCode}`,
            html: html,
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
        const emailSettings = await findEmailSetting({slug: 'password-reset-request'})
        
        if(!emailSettings) {
            return
        }

        const template = PasswordResetEmailTemplate(mailParams, emailSettings);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'GeoTravels <no-reply@bcf.ng>',
            to: mailParams.mailTo,
            subject: emailSettings.mailSubject || `Reset your Geotravels password`,
            text: `Follow this link to reset your password - ${emailSettings.emailAction.buttonUrl + mailParams?.resetCode}`,
            html: html,
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

export async function sendEnquiryConfirmation (mailParams: EnquiryConfirmationMailParams) {
    try {
        const emailSettings = await findEmailSetting({slug: 'enquiry-confirmation'})
        
        if(!emailSettings) {
            return
        }

        const template = EnquiryConfirmationEmailTemplate(mailParams, emailSettings);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'GeoTravels <no-reply@bcf.ng>',
            to: mailParams.mailTo,
            subject: emailSettings.mailSubject || `Enquiry received`,
            text: `Your enquiry has been received`,
            html: html,
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
        const emailSettings = await findEmailSetting({slug: 'affiliate-approval-confirmation'})
        
        if(!emailSettings) {
            return
        }
        const template = AffiliateApprovalConfirmationTemplate(mailParams, emailSettings);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'GeoTravels <no-reply@bcf.ng>',
            to: mailParams.mailTo,
            subject: emailSettings.mailSubject || 'Your Affiliate account has been approved',
            text: `Your account has been approved`,
            html: html,
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
        const template = AffiliateWalletNotificationTemplate(mailParams);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'GeoTravels <no-reply@bcf.ng>',
            to: mailParams.mailTo,
            subject: 'Your Geotravel Affiliate Wallet has been created',
            // template: 'password_reset',
            // "h:X-Mailgun-Variables": JSON.stringify({
            //     firstName: mailParams.firstName,
            // })
            text: `Please log in to your geo travel account to see your affiliate wallet details`,
            html: html,
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

export async function sendFlightBookingConfirmation (mailParams: FlightBookingNotificationMailParams) {
    try {
        const emailSettings = await findEmailSetting({slug: 'flight-booking-notification'})
        
        if(!emailSettings) {
            return
        }

        const template = FlightBookingNotificationTemplate(mailParams, emailSettings);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'GeoTravels <no-reply@bcf.ng>',
            to: mailParams.mailTo,
            // subject: 'Your flight booking has been created',
            subject: emailSettings.mailSubject || 'Your flight booking has been created',
            text: ``,
            html: html,
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

export async function sendSubscriptionConfirmation (mailParams: SubscriptionConfirmationMailParams) {
    try {
        const data = {
            from: 'GeoTravels <no-reply@bcf.ng>',
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


