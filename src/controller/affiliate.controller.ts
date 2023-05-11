import { Request, Response } from "express";
import { get } from "lodash";
import { findAndUpdateUser, findUser } from "../service/user.service";
import * as response from '../responses'
import { createAffiliateMarkup, findAffiliateMarkup } from "../service/affiliate-markup.service";
import { sendAffiliateApprovalConfirmation, sendWalletCreationNotification } from "../service/mailer.service";
import { reserveAccount } from "../service/integrations/monnify.service";
import { generateCode, months, parseDateForMonnify } from "../utils/utils";
import { createSubAccount } from "../service/integrations/flutterwave.service";
import { createNairaWallet, findAndUpdateNairaWallet } from "../service/naira-wallet.service";
import { validateBvn } from "../service/integrations/bizgem.service";

export const approveAffiliateHandler = async (req: Request, res: Response) => {
    try {

        const affiliateId = get(req, 'params.userId')
        const userId = get(req, 'user._id');
        const body = req.body

        const affiliate = await findUser({_id: affiliateId})
        
        if(!affiliate) {
            return response.notFound(res, {message: "Affiliate not found"})
        }

        if(!affiliate.emailConfirmed) {
            return response.badRequest(res, {message: "Affiliate account email not confirmed yet. Email must be confirmed before account can be approved"})
        }

        const affiliateMarkup = await createAffiliateMarkup({
            markupType: body.markupType,
            markup: body.markup,
            approvedBy: userId,
            user: affiliateId
        })

        await findAndUpdateUser(
            {_id: affiliateId}, 
            {
                approvedAsAffiliate: true,
                affiliateMarkup: affiliateMarkup._id
            }, 
            {new: true} 
        )

        await sendAffiliateApprovalConfirmation({
            mailTo: affiliate.email,
            firstName: affiliate.firstName
        })

        return response.ok(res, {message: "Affiliate account has been approved successfully"})
        
    } catch (error: any) {
        
    }
}

export const verifyAffiliateBvnHandler = async (req: Request, res: Response) => {
    try {
        // const affiliateId = get(req, 'params.userId')
        const affiliateId = get(req, 'user._id');
        if(!affiliateId) {
            return
        }
        const bvn = req.body.bvn
        const dateOfBirth = req.body.dateOfBirth

        // if(affiliateId !== userId) {
        //     return response.forbidden(res, {message: "Sorry, you can only add your BVN to your own affiliate account"})
        // }

        const affiliate = await findUser({_id: affiliateId})
        
        if(!affiliate) {
            return response.notFound(res, {message: "Affiliate not found"})
        }

        if(!affiliate.approvedAsAffiliate) {
            return response.badRequest(res, {message: "Your account is not yet approved as an affiliate. you will be able to validate your BVN when the account is approved"})
        }

        const affiliateMarkup = await findAffiliateMarkup({user: affiliateId})

        if(!affiliateMarkup) {
            return response.error(res, {message: 'Sorry, there was a problem verifying your BVN, please contact support to assist in completing the process'}) 
        }

        console.log('affiliate markup, confirming bvn... ', affiliateMarkup)

        const bvnConfirmationRef = generateCode(18, false)

        const bvnConfirmation = await validateBvn({
            bvn,
            firstName: affiliate.firstName,
            lastName: affiliate.lastName,
            dob: dateOfBirth,
            reference: bvnConfirmationRef
        })

        if(!bvnConfirmation || bvnConfirmation.error === true) {
            return response.handleErrorResponse(res, bvnConfirmation)
        }

        let bvnValidated = false
        const dob = dateOfBirth.split('-')
        console.log('CONF DATA ======> ', bvnConfirmation.data)
        if(bvnConfirmation.data.birthdate === `${dob[0]}-${months[dob[1] as keyof typeof months]}-${dob[2]}` 
            && bvnConfirmation.data.firstName.toLowerCase().trim()  === affiliate.firstName.toLowerCase().trim() 
            && bvnConfirmation.data.lastName.toLowerCase().trim()  === affiliate.lastName.toLowerCase().trim()) {
            bvnValidated = true
        } else {
            return response.badRequest(res, {message: "Sorry, the BVN you supplied is not valid or does not match your information, please contact support"})
        }
        // if(bvnConfirmation.data.name.matchPercentage > 50 && bvnConfirmation.data.dateOfBirth === 'FULL_MATCH') {
        //     bvnValidated = true
        // }

        await findAndUpdateUser({_id: affiliateId}, {
            bvnValidated, 
            bvnValidationData: bvnConfirmation.data,
            bvnValidationReference: bvnConfirmationRef
        }, {new: true})


        const nairaWallet = await createNairaWallet({
            userId:affiliateId,
            // customerEmail: affiliate.email,
            bvn: bvn,
            firstName: affiliate.firstName,
            lastName: affiliate.firstName,
            address: affiliate.location,
            phoneNumber: affiliate.phone,
            dob: dateOfBirth
        })

        if(!nairaWallet || nairaWallet.error === true) {
            return response.error(res, {message: 'Sorry, there was a problem verifying your BVN, please contact support to assist in completing the process'})
        }

        // create flw sub
        const flwSubAccount = await createSubAccount({
            bankCode: nairaWallet.data.channel.bankCode,
            accountNumber: nairaWallet.data.accountNumber,
            accountName: nairaWallet.data.accountName,
            phone: affiliate.phone,
            splitType: affiliateMarkup.markupType,
            splitValue: affiliateMarkup.markup
        })

        if(!flwSubAccount || flwSubAccount.error === true) {
            return response.error(res, {message: 'Sorry, there was a problem verifying your BVN, please contact support to assist in completing the process'})
        }

        await findAndUpdateNairaWallet({_id: nairaWallet.data._id}, {flwSubAccountReference: flwSubAccount.data.account_reference}, {new: true})

        await sendWalletCreationNotification({
            accountName: nairaWallet.data.accountName,
            accountNumber: nairaWallet.data.accountNumber,
            bank: nairaWallet.data.bankName,
            firstName: affiliate.firstName,
            mailTo: affiliate.email
        })

        return response.ok(res, {message: 'Your BVN has been verified successfully'})

    } catch (error: any) {
        
    }
}

