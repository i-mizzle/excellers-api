import { Request, Response } from "express"
import { get } from "lodash";
import { UserDocument } from "../model/user.model";
import * as response from "../responses"
import { initializePurchase, initializePurchaseViaTransfer, initializeTokenizedCharge, verifyCharge, verifyTransaction } from "../service/integrations/flutterwave.service";

import { createTransaction, findAndUpdateTransaction, findTransaction } from "../service/transaction.service"
import { findAndUpdate, findUser, validatePassword } from "../service/user.service";
import { generateCode, parseResponse } from "../utils/utils";
import config from 'config';
import { findAndUpdateInvoice, findInvoice } from "../service/invoice.service";


export const initializePaymentHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const invoiceCode = req.body.invoiceCode

        const invoice = await findInvoice({invoiceCode})
        if(!invoice) {
            return response.notFound(res, {message: "invoice not found"})
        }

        if(new Date() > new Date(invoice.expiry)) {
            return response.notFound(res, {message: "invoice has expired and can no longer be paid for, please create booking again"})
        }

        const transactionReference = generateCode(18, false)
        const transactionProcessor = req.body.paymentChannel === 'ONLINE' ? 'FLUTTERWAVE' : 'CASHIER'

        // CREATE TRANSACTION FIRST
        const newTransaction = await createTransaction({
            transactionReference,
            user: userId,
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
            const transaction = await findTransaction({transactionReference: verification.data.txRef})
            const invoice = await findInvoice(transaction.invoice)

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

        const transaction = await findTransaction({transactionReference: req.body.data.txRef})

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