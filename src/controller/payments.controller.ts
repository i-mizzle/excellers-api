import { Request, Response } from "express"
import { get } from "lodash";
import { UserDocument } from "../model/user.model";
import * as response from "../responses"
import { initializePurchase, verifyTransaction } from "../service/integrations/flutterwave.service";

import { createTransaction, findAndUpdateTransaction, findTransaction } from "../service/transaction.service"
import { generateCode, parseResponse } from "../utils/utils";
import config from 'config';
import { findAndUpdateInvoice, findInvoice } from "../service/invoice.service";
import { findAndUpdateBooking, findBooking } from "../service/booking.service";
import { findAndUpdatePackageBooking, findPackageBooking } from "../service/package-booking.service";
import { findAndUpdateEnquiry } from "../service/enquiry.service";
import { findAffiliateMarkup } from "../service/affiliate-markup.service";
import { findUser } from "../service/user.service";


export const initializePaymentHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const invoiceCode = req.body.invoiceCode

        const user = await findUser({_id: userId})
        let userType = ""
        if(user) {
            userType = user.userType
        }

        const invoice = await findInvoice({invoiceCode}, 'user')
        
        if(!invoice) {
            return response.notFound(res, {message: "invoice not found"})
        }

        let invoiceBooking = null
        let affiliateSplit = null
        if(invoice.invoiceFor === 'FLIGHT') {
            invoiceBooking = await findBooking({_id: invoice.invoiceItem})
        }
        if(invoice.invoiceFor === 'PACKAGE') {
            invoiceBooking = await findPackageBooking({_id: invoice.invoiceItem})
        }

        if(invoiceBooking && invoiceBooking.affiliateBooking === true) {
            affiliateSplit = await findAffiliateMarkup({user: invoiceBooking.bookedBy})
        }

        // TO DO
        // Get split type and value
        // calculate how much the affiliate gets
        // send the request with a split with charge type: flat_subaccount

        // let split


            // {
            //   id: "RS_A8EB7D4D9C66C0B1C75014EE67D4D663",
            //   // If you want the subaccount to get 4200 naira only
            //   // Subaccount gets: 4200
            //   // You get: 6000 - 4200 - 60 = 1740
            //   transaction_charge_type: "flat_subaccount",
            //   transaction_charge: 4200,
            // },

       
        if(new Date() > new Date(invoice.expiry)) {
            return response.notFound(res, {message: "invoice has expired and can no longer be paid for, please create booking again"})
        }

        const transactionReference = generateCode(18, false)
        const transactionProcessor = req.body.paymentChannel === 'ONLINE' ? 'FLUTTERWAVE' : 'CASHIER'

        // CREATE TRANSACTION FIRST
        const newTransaction = await createTransaction({
            transactionReference,
            user: userId,
            userType: userType,
            invoice: invoice._id,
            amount: invoice.amount,
            processor: transactionProcessor,
            channel: req.body.paymentChannel
        })

        const input = {
            transactionReference: newTransaction.transactionReference,
            amount: invoice!.amount,
            customerName: req.body.customer.name,
            customerEmail: req.body.customer.email,
            customerPhone: req.body.customer.phone,
            redirectUrl: req.body.redirectUrl,
            meta: {
                transactionReference: transactionReference
            }
        }

        // if(affiliateSplit) {
        //     input.subaccounts = [
        //         {
        //             id: "RS_A8EB7D4D9C66C0B1C75014EE67D4D663",
        //             transaction_charge_type: "flat_subaccount",
        //             transaction_charge: 4200,
        //         },
        //     ]
        // }

        const purchaseObject = await initializePurchase(input)
        return response.ok(res, purchaseObject.data)

    } catch (error) {
        return response.error(res, error)
    }
}

export const verifyTransactionHandler = async (req: Request, res: Response) => {
    try {
        const transactionReference = get(req, 'params.flwTransactionId');
        const input = {
            transactionReference: transactionReference
        }
        const verification = await verifyTransaction(input)
        
        if (verification.error) {
            return response.parseFlutterwaveError(res, verification)
        } else {
            const transaction = await findTransaction({transactionReference: verification.data.txRef}, '')
            const invoice = await findInvoice(transaction!.invoice)

            if(!invoice || !transaction) {
                return response.error(res, {message: 'error updating transaction'})
            }
            
            // update the transaction
            const transactionStatus = verification.data.processorResponse.toUpperCase()
            const channelResponse = verification.data

            const updateObject = {
                status: transactionStatus,
                processorData: channelResponse
            }

            await findAndUpdateTransaction({ _id: transaction._id }, updateObject, { new: true })

            const invoiceUpdate = {
                status: transaction.amount === invoice.amount ? 'PAID' : 'PART_PAID'
            }

            await findAndUpdateInvoice({_id: invoice._id}, invoiceUpdate, {new: true})

            if (invoice.invoiceFor === 'FLIGHT') {
                await findAndUpdateBooking({_id: invoice.invoiceItem}, {paymentStatus: invoiceUpdate.status}, {new: true})
            }

            if (invoice.invoiceFor === 'PACKAGE') {
                await findAndUpdatePackageBooking({_id: invoice.invoiceItem}, {paymentStatus: invoiceUpdate.status}, {new: true})
            }

            if (invoice.invoiceFor === 'ENQUIRY') {
                await findAndUpdateEnquiry({_id: invoice.invoiceItem}, {paymentStatus: invoiceUpdate.status}, {new: true})
            }

            return response.ok(res, verification.data)
        }
        
    } catch (error) {
        return response.error(res, error)
    }
}

export const flutterwaveWebhookHandler = async (req: Request, res: Response) => {
    try {
        const flutterwaveConfig: any = config.get('flutterwave') 
        if (!req.headers['verif-hash'] || req.headers['verif-hash'] !== flutterwaveConfig.WEBHOOK_HASH) {
            return response.error(res, {message: 'Hash not provided or invalid'})
        } 

        const transaction = await findTransaction({transactionReference: req.body.data.txRef}, '')

        if(!transaction) {
            return response.error(res, {message: 'transaction not found'})
        }
        
        // update the transaction
        const transactionStatus = req.body.data.status.toUpperCase()
        const channelResponse = req.body.data

        const updateObject = {
            status: transactionStatus,
            processorData: channelResponse
        }

        await findAndUpdateTransaction({ _id: transaction._id }, updateObject, { new: true })

        
        if(req.body.data.status === 'successful') {
            const invoice = await findInvoice(transaction.invoice)

            if(!invoice) {
                return response.error(res, {message: 'invoice not found'})
            }
            
            const invoiceUpdate = {
                status: transaction.amount === invoice.amount ? 'PAID' : 'PART_PAID'
            }
            await findAndUpdateInvoice({_id: invoice._id}, invoiceUpdate, {new: true})
        }

        return response.ok(res, {data:'Transaction updated successfully'})
    } catch (error) {
        console.log(error)
        response.error(res, error)
    }

}