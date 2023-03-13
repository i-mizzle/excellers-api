// import { Request, Response } from "express"
// import { get } from "lodash";
// import { UserDocument } from "../model/user.model";
// import * as response from "../responses"
// import { initializePurchase, initializePurchaseViaTransfer, initializeTokenizedCharge, verifyCharge, verifyTransaction } from "../service/integrations/flutterwave.service";
// import { createSubscription } from "../service/subscription.service";
// import { createTicket } from "../service/ticket.service";
// import { findAndUpdateTransaction, findTransaction } from "../service/transaction.service"
// import { findAndUpdate, findUser, validatePassword } from "../service/user.service";
// import { parseResponse } from "../utils/utils";


// export const initializePaymentHandler = async (req: Request, res: Response) => {
//     try {
//         // const transactionReference = get(req, 'params.transaction');
//         const transactionReference = req.body.transactionReference;
//         const userId = get(req, 'user._id');
//         const user = await findUser({_id: userId})
//         const transaction = await findTransaction({transactionReference})
//         // console.log('the tx ===> ', transaction)
//         if (!transaction || transaction.status === 'SUCCESSFUL') {
//             return response.notFound(res, {message: "Transaction not found or has already been settled"})
//         }
        
//         const input = {
//             transactionReference: transactionReference,
//             amount: transaction!.amount,
//             customerName: user!.name,
//             customerEmail: user!.email,
//             customerPhone: user!.phone,
//             redirectUrl: req.body.redirectUrl
//         }

//         const purchaseObject = await initializePurchase(input)
//         return response.ok(res, purchaseObject.data)

//     } catch (error) {
//         return response.error(res, error)
//     }
// }

// export const verifyTransactionHandler = async (req: Request, res: Response) => {
//     try {
//         const transactionReference = get(req, 'params.transactionReference');
//         const input = {
//             transactionReference: transactionReference
//         }
//         const verification = await verifyTransaction(input)
        
//         if (verification.error) {
//             return response.parseFlutterwaveError(res, verification)
//         } else {
//             const transaction = await findTransaction({transactionReference: verification.data.tx_ref})
            
//             // update the transaction
//             const transactionStatus = verification.data.processor_response.toUpperCase()
//             const channelResponse = verification.data

//             const updateObject = {
//                 status: transactionStatus,
//                 processorData: channelResponse
//             }

//             await findAndUpdateTransaction({ _id: transaction._id }, updateObject, { new: true })
//             let ticket = null
//             let subscription = null

//             if(transaction.paymentFor === 'TICKET') {

//                 ticket = await createTicket({
//                     users: transaction.itemOwners,
//                     event: transaction.paymentItem,
//                     paymentReference: transaction.transactionReference,
//                     createdBy: transaction.createdBy
//                 })

//                 return response.ok(res, { ...verification.data, ...{ tickets: ticket.data }})
//             }
            
//             if(transaction.paymentFor === 'SUBSCRIPTION') {

//                 subscription = await createSubscription({
//                     users: transaction.itemOwners,
//                     paymentReference: transaction.transactionReference,
//                     subscribedBy: transaction.createdBy,
//                     subscriptionPlan: transaction.paymentItem
//                 })

//                 return response.ok(res, { ...verification.data, ...{ subscriptions: subscription.data }})
//             }

//             return response.ok(res, verification.data)


//         }
        
//     } catch (error) {
//         return response.error(res, error)
//     }
// }

// // export const initializePaymentViaTransferHandler = async (req: Request, res: Response) => {
// //     try {
// //         const input = req.body
// //         const userId = get(req, 'user._id');
// //         const user = await findUser({_id: userId}) 
// //         if (!user) {
// //             return response.notFound(res, { message: "User not found" })
// //         }

// //         const payload = {
// //             transactionReference: input.transactionReference,
// //             amount: input.amount,
// //             customerEmail: user.email,
// //             customerPhone: user.phone,
// //             currency:"NGN",
// //             narration: "Bill payment on payafrik",
// //          }

// //         const purchaseObject = await initializePurchaseViaTransfer(payload)
// //         if (purchaseObject.error) {
// //             return response.parseFlutterwaveError(res, purchaseObject)
// //         } else {
// //             return response.ok(res, purchaseObject.data.meta)
// //         }

// //     } catch (error) {
// //         return response.error(error)
// //     }
// // }

// // export const verifyChargeHandler = async (req: Request, res: Response) => {
// //     try {
// //         const input = req.body
// //         const userId = get(req, 'user._id');
// //         const user = await findUser({_id: userId}) 
// //         if (!user) {
// //             return response.notFound(res, { message: "User not found" })
// //         }

// //         const payload = {
// //             otp: input.otp,
// //             flutterwaveRef: input.flutterwaveRef
// //          }

// //         const verificationObject = await verifyCharge(payload)
// //         if (verificationObject.error) {
// //             return response.parseFlutterwaveError(res, verificationObject)
// //         } else {
// //             return response.ok(res, verificationObject)
// //         }
// //     } catch (error) {
// //         return response.error(error)
// //     }
// // }

// export const initializeTokenizedChargeHandler = async (req: Request, res: Response) => {
//     try {
//         const input = req.body
//         const userId = get(req, 'user._id');
//         const user = await findUser({_id: userId}) 
//         if (!user) {
//             return response.notFound(res, { message: "User not found" })
//         }

//         const payload = {
//             token: input.cardToken,
//             amount: input.amount,
//             customerEmail: user.email,
//             customerPhone: user.phone,
//             customerName: user.name,
//             transactionReference: input.transactionReference,
//             currency:"NGN",
//             narration: "Tokenized bill payment on payafrik",
//          }

//         const purchaseObject = await initializeTokenizedCharge(payload)
//         if (purchaseObject.error) {
//             return response.parseFlutterwaveError(res, purchaseObject)
//         } else {
//             return response.ok(res, purchaseObject.data)
//         }

//     } catch (error) {
//         return response.error(error)
//     }
// }

// export const savePaymentCardHandler = async (req: Request, res: Response) => {
//     try {
//         const cardObject = req.body.cardDetails
//         const userId = get(req, 'user._id');
//         const user = await findUser({_id: userId})

//         let userPaymentCards = user?.paymentCards || []
//         let cardPreviouslySaved = false

//         // Check if the card was already saved
//         if (user?.paymentCards && user?.paymentCards.length > 0) {
//             user.paymentCards.forEach((card) => {
//                 if (card.first_6digits === cardObject.first_6digits && card.last_4digits === cardObject.last_4digits ) {
//                     cardPreviouslySaved = true
//                 }
//             });
//         }

//         let updatedUser = null

//         if(cardPreviouslySaved) {
//             updatedUser = user
//         } else {
//             userPaymentCards.push(cardObject)
//             updatedUser = await findAndUpdate({ _id: userId }, {paymentCards: userPaymentCards}, { new: true })
//         }

//         return response.ok(res, updatedUser)
//     } catch (error) {
//         return response.error(res, error)
//     }
// }

// export const deletePaymentCardHandler = async (req: Request, res: Response) => {
//     try {
//         const body = req.body
//         const password = body.password
//         const cardToken = body.cardToken
//         const userId = get(req, 'user._id');
//         const userDetails = await findUser({_id: userId})

//         const validated = await validatePassword({email: userDetails!.email, password});
//         if (!validated) {
//             return response.unAuthorized(res, { message: "invalid username or password" })
//         }
        
//         const userCards = userDetails!.paymentCards

//         if(!userCards) {
//             return response.notFound(res, {message: "Payment card not found for this user"})
//         }
        
//         let cardObject = null
//         const updatedPaymentCards: UserDocument['paymentCards'] = []
//         await Promise.all(userCards.map(async (card: any) => {
//             if (card.token === cardToken) {
//                 cardObject = card
//             } else {
//                 updatedPaymentCards.push(card)
//             }
//         }))
        
//         if(!cardObject) {
//             return response.notFound(res, {message: "Payment card not found for this user"})
//         }

//         const updatedUser = await findAndUpdate({ _id: userId }, {paymentCards: updatedPaymentCards}, { new: true })

//         return response.ok(res, updatedUser)

//     } catch (error) {
//         return response.error(res, error)
//     }
// }

// // export const flutterwaveWebhookHandler = async (req: Request, res: Response) => {
// //     // if (!req.headers['verif-hash'] || req.headers['verif-hash'] !== config.flutterwave.WEBHOOK_HASH) {
// //     //     return response.error(res, {message: 'Hash not provided or invalid'})
// //     // } 

// //     try {
// //         if (input.status === 'successful') {
// //             const updatePayload = {
// //                 transactionStatus: 'SUCCESSFUL',
// //                 channelResponse: req.body
// //             }
// //             const transactionRef = req.body.txRef
// //             const user = {
// //                 name: req.body.customer.fullName || null,
// //                 email: req.body.customer.email || null
// //             }
// //             // const updateResponse = await transactionHelper.update(updatePayload, transactionRef, user)

// //             // Vebd Tokens
// //             if (updateResponse.error) {
// //                 return response[updateResponse.errorType](res, updateResponse.data);
// //             } else {
// //                 return response.ok(res, updateResponse.data);
// //             }
// //         }
// //     } catch (error) {
// //         console.log(error)
// //         response.error(res, error)
// //     }

// // }