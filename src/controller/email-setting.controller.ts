import { Request, Response } from "express"
import { createEmailSetting, findAndUpdateEmailSetting, findEmailSetting, findEmailSettings } from "../service/email-setting.service"
import * as response from '../responses'
import { get } from "lodash"
import { slugify } from "../utils/utils"
import { sendAffiliateApprovalConfirmation, sendEmailConfirmation, sendEnquiryConfirmation, sendFlightBookingConfirmation, sendInvitation, sendPackageBookingConfirmation, sendPasswordResetEmail } from "../service/mailer.service"

export const createEmailSettingHandler = async (req: Request, res: Response) => {
    try {
        const body = req.body
        const emailSetting = await createEmailSetting({...body, ...{slug: slugify(body.name)}})

        return response.created(res, emailSetting)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getEmailSettingsHandler = async (req: Request, res: Response) => {
    try {
        const emailSettings = await findEmailSettings({deleted:false})
        const responseObject = {
            total: emailSettings.total,
            emailSettings: emailSettings.emailSettings
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getEmailSettingHandler = async (req: Request, res: Response) => {
    try {

        const settingId = get(req, 'params.settingId');

        const ObjectId = require('mongoose').Types.ObjectId;

        let setting = null

        if(ObjectId.isValid(settingId)) {
            setting = await findEmailSetting({_id: settingId})
        } else {
            setting = await findEmailSetting({slug: settingId})
        }

        if(!setting || setting === null) {
            return response.notFound(res, {message: 'setting not found'})
        }

        return response.ok(res, {emailSetting: setting})        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updateEmailSettingHandler = async (req: Request, res: Response) => {
    try {
        const updateObject = req.body
        if(updateObject.allowedVariables){
            return response.badRequest(res, {message: 'Sorry, you cannot update allowedVariables field.'})
        }

        const settingId = get(req, 'params.settingId');

        const ObjectId = require('mongoose').Types.ObjectId;

        let setting = null

        if(ObjectId.isValid(settingId)) {
            setting = await findEmailSetting({_id: settingId})
        } else {
            setting = await findEmailSetting({slug: settingId})
        }

        if(!setting || setting === null) {
            return response.notFound(res, {message: 'setting not found'})
        }

        const updated = await findAndUpdateEmailSetting({_id: setting._id, deleted:false}, updateObject, {new: true})

        return response.ok(res, {message: `email setting for '${setting.name}' updated successfully`, emailSetting: updated})        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const testEmailSettingHandler = async (req: Request, res: Response) => {
    try {
        const body = req.body

        const settingId = get(req, 'params.settingId');

        const ObjectId = require('mongoose').Types.ObjectId;

        let setting = null

        if(ObjectId.isValid(settingId)) {
            setting = await findEmailSetting({_id: settingId})
        } else {
            setting = await findEmailSetting({slug: settingId})
        }

        if(!setting || setting === null) {
            return response.notFound(res, {message: 'setting not found'})
        }

        if(setting.slug === 'email-confirmation') {
            await sendEmailConfirmation({
                mailTo: body.recipientEmail,
                firstName: body.variables.firstName,
                activationCode: "eduwgtd78423ryhde2q"
            })
        }

        if(setting.slug === 'admin-invitation') {
            await sendInvitation({
                mailTo: body.recipientEmail,
                firstName: body.variables.firstName,
                activationCode: "eduwgtd78423ryhde2q"
            })
        }

        if(setting.slug === 'affiliate-approval-confirmation') {
            await sendAffiliateApprovalConfirmation({
                mailTo: body.recipientEmail,
                firstName: body.variables.firstName
            })
        }

        if(setting.slug === 'password-reset-request') {
            await sendPasswordResetEmail({
                mailTo: body.recipientEmail,
                firstName: body.variables.firstName,
                resetCode: "eduwgtd78423ryhde2q"
            })
        }

        if(setting.slug === 'enquiry-confirmation') {
            await sendEnquiryConfirmation({
                mailTo: body.recipientEmail,
                firstName: body.variables.firstName,
                // resetCode: "eduwgtd78423ryhde2q"
            })
        }

        if(setting.slug === 'flight-booking-notification') {
            await sendFlightBookingConfirmation({
                mailTo: body.recipientEmail,
                firstName: body.variables.firstName,
                invoiceCode: body.invoiceCode,
                airline: body.airline,
                bookingCode: body.bookingCode,
                origin: body.origin,
                destination: body.destination,
                outboundDepartureDate: body.outboundDepartureDate,
                outboundDepartureTime: body.outboundDepartureTime,
                outboundArrivalDate: body.outboundArrivalDate,
                outboundArrivalTime: body.outboundArrivalTime,
                inboundDepartureDate: body.inboundDepartureDate,
                inboundDepartureTime: body.inboundDepartureTime,
                inboundArrivalDate: body.inboundArrivalDate,
                inboundArrivalTime: body.inboundArrivalTime
            })
        }

        if(setting.slug === 'package-booking-notification') {
            await sendPackageBookingConfirmation({
                mailTo: body.recipientEmail,
                firstName: body.variables.firstName,
                invoiceCode: body.variables.invoiceCode,
                packageName: body.variables.packageName,
                bookingCode: body.variables.bookingCode,
            })
        }

        // const updated = await findAndUpdateEmailSetting({_id: setting._id, deleted:false}, updateObject, {new: true})

        return response.ok(res, {message: `email sent to  '${body.recipientEmail}`})        
    } catch (error:any) {
        return response.error(res, error)
    }
}