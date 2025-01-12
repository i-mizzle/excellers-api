import { Request, Response } from "express"
import { get } from "lodash";
import * as response from "../responses"
import { initializePurchase, verifyTransaction } from "../service/integrations/flutterwave.service";
import { createTransaction, findAndUpdateTransaction, findTransaction } from "../service/transaction.service"
import { generateCode } from "../utils/utils";
import config from 'config';
import { findUser } from "../service/user.service";
import { findAndUpdateOrder, findOrder } from "../service/order.service";


export const receivePaymentHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        // const invoiceCode = req.body.invoiceCode

        const user = await findUser({_id: userId})
        if(!user){
            return response.notFound(res, {message: 'user not found'})
        }
        let userType = ""
        if(user) {
            userType = user.userType
        }

        const order = await findOrder({_id: req.body.order})
        if(!order) {
            return response.notFound(res, {message: 'order not found'})
        }

        if(req.body.status === 'successful') {
            await findAndUpdateOrder({_id: order._id}, {paymentStatus: 'PAID', status: 'COMPLETED'}, {new:true})
        }

        const transactionReference = generateCode(18, false)
        // const transactionProcessor = req.body.paymentChannel === 'ONLINE' ? 'FLUTTERWAVE' : 'CASHIER'

        // CREATE TRANSACTION FIRST
        const newTransaction = await createTransaction({
            transactionReference,
            createdBy: userId,
            order: req.body.order,
            amount: req.body.amount || order.total, 
            processor: 'cashier',
            status: req.body.status,
            channel: req.body.channel,
            receivingChannel: req.body.receivingChannel,
            store: user.store
        })


        return response.created(res, newTransaction)

    } catch (error) {
        return response.error(res, error)
    }
}

export const initializePaymentHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const invoiceCode = req.body.invoiceCode

        const user = await findUser({_id: userId})
        let userType = ""
        if(user) {
            userType = user.userType
        }

        const order = '' // await findInvoice({invoiceCode}, 'user')
        
        if(!order) {
            return response.notFound(res, {message: "invoice not found"})
        }
       
        // if(new Date() > new Date(invoice.expiry)) {
        //     return response.notFound(res, {message: "invoice has expired and can no longer be paid for, please create booking again"})
        // }

        const transactionReference = generateCode(18, false)
        const transactionProcessor = req.body.paymentChannel === 'ONLINE' ? 'FLUTTERWAVE' : 'CASHIER'

        // CREATE TRANSACTION FIRST
        const newTransaction = await createTransaction({
            transactionReference,
            createdBy: userId,
            order: '', //invoice._id,
            amount: 0, // order.amount,
            processor: transactionProcessor,
            channel: req.body.paymentChannel,
            store: req.body.store
        })

        const input = {
            transactionReference: newTransaction.transactionReference,
            amount: 0, //order!.amount,
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
        return response.created(res, purchaseObject.data)

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
        console.log('---> ---> ', verification)
        
        if (verification.error) {
            return response.parseFlutterwaveError(res, verification)
        } else {
            const transaction = await findTransaction({transactionReference: verification.data.txRef}, '')
            if(!transaction) {
                return response.notFound(res, {message: 'invoice transaction not found'})
            }
            const order = '' //await findInvoice(transaction!.invoice)

            if(!order || !transaction) {
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

            // const orderUpdate = {
            //     status: transaction.amount === order.amount ? 'PAID' : 'PART_PAID'
            // }

            // await findAndUpdateInvoice({_id: invoice._id}, invoiceUpdate, {new: true})

            // if (invoice.invoiceFor === 'FLIGHT') {
            //     await findAndUpdateBooking({_id: invoice.invoiceItem}, {paymentStatus: invoiceUpdate.status}, {new: true})
            // }

            // if (invoice.invoiceFor === 'PACKAGE') {
            //     await findAndUpdatePackageBooking({_id: invoice.invoiceItem}, {paymentStatus: invoiceUpdate.status}, {new: true})
            // }

            // if (invoice.invoiceFor === 'ENQUIRY') {
            //     await findAndUpdateEnquiry({_id: invoice.invoiceItem}, {paymentStatus: invoiceUpdate.status}, {new: true})
            // }

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

        
        // if(req.body.data.status === 'successful') {
        //     const invoice = await findInvoice(transaction.invoice)

        //     if(!invoice) {
        //         return response.error(res, {message: 'invoice not found'})
        //     }
            
        //     const invoiceUpdate = {
        //         status: transaction.amount === invoice.amount ? 'PAID' : 'PART_PAID'
        //     }
        //     await findAndUpdateInvoice({_id: invoice._id}, invoiceUpdate, {new: true})
        // }

        return response.ok(res, {data:'Transaction updated successfully'})
    } catch (error) {
        console.log(error)
        response.error(res, error)
    }

}