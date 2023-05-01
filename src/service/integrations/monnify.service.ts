import { UserDocument } from "../../model/user.model";
import { formatPhoneNumber, parseResponse } from "../../utils/utils";
import { createLimitProfile } from "../limit-profile.service";
import { findAndUpdateTransaction, findTransactions } from "../transaction.service";
import mongoose from "mongoose";

const requestPromise = require("request-promise");
const config = require('config')

const getAuthorization = async () => {
    try {
        const url = `${config.monnify.BASE_URL}/api/v1/auth/login`
        const encodedHeader = Buffer.from(`${config.monnify.API_KEY}:${config.monnify.SECRET}}`).toString('base64')

        const requestHeaders = {
            Authorization: `Basic ${encodedHeader.replace(/={1,2}$/, '')}`
        }

        console.log('headers for auth request ...', requestHeaders)

        const verb = 'POST'

        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: null };
        
        let response = await requestPromise(requestOptions);
        response = parseResponse(response)

        console.log('authorization response ... ', response)
        
        if(response.requestSuccessful) {
            return {
                error: false, 
                errorType: "", 
                data: response.responseBody.accessToken
            }
        } else {
            return {
                error: true, 
                errorType: "error", 
                data: response
            }
        }
    } catch (error: any) {
        
        return {
            error: true, 
            errorType: "error", 
            // data: error
            data: JSON.parse(error.response.body).error_description
        }
    }
}

interface WalletLimitObject {
    limitProfileName: String
    singleTransactionValue: Number,
    dailyTransactionVolume: Number
    dailyTransactionValue: Number
}

export const createLimit = async (input: WalletLimitObject) => {
    try {
        const url = `${config.monnify.BASE_URL}/api/v1/limit-profile/`
        const requestBody = {
            limitProfileName: input.limitProfileName,
            singleTransactionValue: input.singleTransactionValue,
            dailyTransactionVolume: input.dailyTransactionVolume,
            dailyTransactionValue: input.dailyTransactionValue
        }
        const verb = 'POST'

        let response = null;
        const access = await getAuthorization() 
        if(access.error) {
            return {
                error: true, 
                errorType: "error", 
                data: access.data
            }
        }

        const requestHeaders = {
            Authorization: `Bearer ${access.data}`,
            "Content-Type": "application/json"
        }

        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(requestBody) };
        response = await requestPromise(requestOptions);

        
        response = parseResponse(response);

        if (!response.requestSuccessful) {
            return {
                error: true, 
                errorType: "error", 
                data: response.responseBody
            }
        }

        // Save created limit details to DB
        await createLimitProfile({
            limitProfileCode: response.responseBody.limitProfileCode,
            limitProfileName: response.responseBody.limitProfileName,
            singleTransactionValue: response.responseBody.singleTransactionValue,
            dailyTransactionVolume: response.responseBody.dailyTransactionVolume,
            dailyTransactionValue: response.responseBody.dailyTransactionValue,
        })
        
        return {
            error: false,
            errorType: '',
            data: response.responseBody
        }
        
    } catch (error: any) {
        return {
            error: true, 
            errorType: "error", 
            data: parseResponse(error.response.body).responseMessage
        }
    }
}

/**
 * Changes the limit profile assigned to a wallet/reserved account
 */
interface UpdateWalletLimitProfileObject {
    accountReference: String,
    limitProfileCode: String
}

export const updateWalletLimit = async (input: UpdateWalletLimitProfileObject) => {
    try {
        const url = `${config.monnify.BASE_URL}/api/v1/bank-transfer/reserved-accounts/limit`
        const requestBody = {
            accountReference: input.accountReference,
            limitProfileCode: input.limitProfileCode
        }

        const verb = 'POST'

        let response = null;
        const access = await getAuthorization() 
        if(access.error) {
            return {
                error: true, 
                errorType: "error", 
                data: access.data
            }
        }

        const requestHeaders = {
            Authorization: `Bearer ${access.data}`,
            "Content-Type": "application/json"
        }

        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(requestBody) };
        response = await requestPromise(requestOptions);

        console.log('HEADERS FOR LIMIT =====>', requestHeaders)
        console.log('RESPONSE FOR LIMIT =====>', response)

        response = parseResponse(response);

        if (!response.requestSuccessful) {
            return {
                error: true, 
                errorType: "error", 
                data: response.responseBody
            }
        }
        
        return {
            error: false,
            errorType: '',
            data: response.responseBody
        }
        
    } catch (error: any) {
        return {
            error: true, 
            errorType: "error", 
            data: parseResponse(error.response.body).responseMessage
        }
    }
}

interface ReserveAccountObject {
    accountReference: string,
    customerEmail: string,
    customerBvn: string,
    customerName: string,
    // limitProfileCode: string,
    // userId: UserDocument["_id"]
}

export const reserveAccount = async (input: ReserveAccountObject) => {
    try {
        const url = `${config.monnify.BASE_URL}/api/v2/bank-transfer/reserved-accounts`
        const requestBody = {
            accountReference: input.accountReference,
            accountName: input.customerName,
            currencyCode: "NGN",
            contractCode: config.monnify.CONTRACT_CODE,
            customerEmail: input.customerEmail,
            bvn: input.customerBvn,
            customerName: input.customerName,
            getAllAvailableBanks: false,
            preferredBanks: ["035"],
            restrictPaymentSource: false,
            // limitProfileCode: input.limitProfileCode, // this line adds a limit to the account
        }
        const verb = 'POST'

        let reservationResponse = null;
        const access = await getAuthorization() 
        if(access.error) {
            return {
                error: true, 
                errorType: "error", 
                data: access.data
            }
        }

        const requestHeaders = {
            Authorization: `Bearer ${access.data}`,
            "Content-Type": "application/json"
        }

        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(requestBody) };
        reservationResponse = await requestPromise(requestOptions);

        console.log('HEADERS FOR RESERVATION =====>', requestHeaders)
        console.log('RESPONSE FOR RESERVATION =====>', reservationResponse)

        reservationResponse = parseResponse(reservationResponse);

        if (!reservationResponse.requestSuccessful) {
            return {
                error: true, 
                errorType: "error", 
                data: reservationResponse.responseBody
            }
        }

        return {
            error: false,
            errorType: '',
            data: reservationResponse.responseBody
        }
        
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: parseResponse(error.response.body).responseMessage
        }
    }
}

interface AccountTransactionsInput {
    accountReference: string
    pageSize: number
    page: number
}

export const getAccountTransactions = async (input: AccountTransactionsInput) => {
    try {
        const url = `${config.monnify.BASE_URL}/api/v1/bank-transfer/reserved-accounts/transactions?accountReference=${input.accountReference}&page=${input.page}&size=${input.pageSize}`
        const verb = 'GET'
        const access = await getAuthorization() 
        
        if(access.error) {
            return {
                error: true, 
                errorType: "error", 
                data: access.error
            }
        }
        
        const requestHeaders = {
            Authorization: `Bearer ${access.data}`,
            "Content-Type": "application/json"
        }
        
        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: null };
        let response = null
        
        response = await requestPromise(requestOptions);
        response = parseResponse(response);

        if (!response.requestSuccessful) {
            return {
                error: true, 
                errorType: "error", 
                data: response.responseBody
            }
        }

        const transactionsData = {
            page: response.responseBody.number + 1,
            perPage: response.responseBody.size,
            total: response.responseBody.totalElements,
            transactions: response.responseBody.content
        }
        
        return {
            error: false,
            errorType: '',
            data: transactionsData
        }
        
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: parseResponse(error.response.body).responseMessage
        }
    }
}

interface AccountBalanceObject {
    user: string
    accountNumber: string
    accountReference: string
}

export const getAccountBalance = async (input: AccountBalanceObject) => {
    try {
        let income = 0
        const transactions = await getAccountTransactions({
            accountReference: input.accountReference,
            page: 0,
            pageSize: 1000000000
        })

        if (transactions.error) {
            return {
                error: true, 
                errorType: "error", 
                data: "Sorry, wallet balance cannot be retrieved at the moment"
            }
        }

        transactions.data.transactions.forEach((transaction: any) => {
            if(transaction.completed) {
                const actualAmount = transaction.amount - transaction.fee
                income += actualAmount
            }
        })
        
        let expenditure = 0
        let rolledBack = 0
        const expenses = await findTransactions({user: mongoose.Types.ObjectId(input.user)}, 0, 1000000000, '')
        expenses.data.forEach((expense: any) => {
            if(expense.status === 'SUCCESSFUL' && expense.source === 'MONNIFY_WALLET') {
                expenditure += expense.amount
            }

            if(expense.status === 'ROLLED_BACK' && expense.source === 'MONNIFY_WALLET') {
                rolledBack += expense.amount
            }
        })


        return {
            error: false,
            errorType: "",
            data: {
                walletIncome: income,
                walletExpenditure: expenditure < 0 ? 0 : expenditure,
                balance: income - (expenditure - rolledBack)
            }
        }
        
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: parseResponse(error.response.body).responseMessage
        }
    }
}

// const getPayafrikWalletBalance = async (input: AccountBalanceObject) => {
//     try {
//         const url = `${config.monnify.BASE_URL}/api/v2/disbursements/wallet-balance?accountNumber=${input.accountNumber}`
//         const verb = 'GET'

//         let balanceResponse = null;
//         const access = await getAuthorization() 
        
//         if(access.error) {
//             return {
//                 error: true, 
//                 errorType: "error", 
//                 data: access.error
//             }
//         }

//         const requestHeaders = {
//             Authorization: `Bearer ${access.data}`,
//             "Content-Type": "application/json"
//         }

//         let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: null };
//         let response = null
        
//         balanceResponse = await requestPromise(requestOptions);
//         console.log('HEADERS FOR WALLET BALANCE =====>', requestHeaders)
//         balanceResponse = parseResponse(balanceResponse);
//         console.log('RESPONSE FOR WALLET BALANCE =====>', requestHeaders)

//         if (!balanceResponse.requestSuccessful) {
//             return {
//                 error: true, 
//                 errorType: "error", 
//                 data: balanceResponse.responseBody
//             }
//         }

//         return {
//             error: false,
//             errorType: '',
//             data: balanceResponse.responseBody
//         }
        
//     } catch (error: any) {
//         return {
//             error: true,
//             errorType: 'error',
//             data: parseResponse(error.response.body).responseMessage
//         }
//     }
// }

export const getTransferBanks = async () => {
    try {
        const url = `${config.monnify.BASE_URL}/api/v1/banks`
        const verb = 'GET'

        let response = null;
        const access = await getAuthorization() 
        
        if(access.error) {
            return {
                error: true, 
                errorType: "error", 
                data: access.error
            }
        }

        const requestHeaders = {
            Authorization: `Bearer ${access.data}`,
            "Content-Type": "application/json"
        }

        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: null };
        
        response = await requestPromise(requestOptions);
        response = parseResponse(response);

        if (!response.requestSuccessful) {
            return {
                error: true, 
                errorType: "error", 
                data: response.responseBody
            }
        }

        return {
            error: false,
            errorType: '',
            data: response.responseBody
        }
        
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: parseResponse(error.response.body).responseMessage
        }
    }
}

interface ValidateBankAccountObject {
    accountNumber: string,
    bankCode: string
}

export const validateBankAccount = async (input: ValidateBankAccountObject) => {
    try {
        const url = `${config.monnify.BASE_URL}/api/v1/disbursements/account/validate?accountNumber=${input.accountNumber}&bankCode=${input.bankCode}`
        const verb = 'GET'

        let response = null;
        const access = await getAuthorization() 
        
        if(access.error) {
            return {
                error: true, 
                errorType: "error", 
                data: access.error
            }
        }

        const requestHeaders = {
            Authorization: `Bearer ${access.data}`,
            "Content-Type": "application/json"
        }

        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: null };
        
        response = await requestPromise(requestOptions);
        response = parseResponse(response);

        if (!response.requestSuccessful) {
            return {
                error: true, 
                errorType: "error", 
                data: response.responseBody
            }
        }

        return {
            error: false,
            errorType: '',
            data: response.responseBody
        }
        
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: parseResponse(error.response.body).responseMessage
        }
    }
}

export const getTransferStatus = async (transactionReference: string) => {
    try {
        const url = `${config.monnify.BASE_URL}/api/v2/disbursements/single/summary?reference=${transactionReference}`
        const verb = 'GET'

        let response = null;
        const access = await getAuthorization() 
        
        if(access.error) {
            return {
                error: true, 
                errorType: "error", 
                data: access.error
            }
        }

        const requestHeaders = {
            Authorization: `Bearer ${access.data}`,
            "Content-Type": "application/json"
        }

        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: null };
        
        response = await requestPromise(requestOptions);
        response = parseResponse(response);

        if (!response.requestSuccessful) {
            return {
                error: true, 
                errorType: "error", 
                data: response.responseBody
            }
        }

        let transactionStatus = response.responseBody.status
        if(response.responseBody.status==='SUCCESS') {
            transactionStatus = 'SUCCESSFUL'
        }

        await findAndUpdateTransaction(
            {transactionReference: transactionReference},
            {
                status: transactionStatus, 
                channelResponse: response.responseBody
            },
            { new: true }
        )

        return {
            error: false,
            errorType: '',
            data: response.responseBody
        }
        
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: parseResponse(error.response.body).responseMessage
        }
    }
}

export interface BvnVerificationData {
    bvn: string,
    name: string,
    dob: string,
    phone: string,
    userId: string
}

export const validateBvn = async (input: BvnVerificationData) => {
    try {
        console.log('validating... ')
        const url = `${config.monnify.BASE_URL}/api/v1/vas/bvn-details-match`
        const verb = 'POST'

        const requestBody = {
            bvn:input.bvn,
            name: input.name,
            dateOfBirth: input.dob,
            mobileNo: formatPhoneNumber(input.phone)
        }

        const access = await getAuthorization() 
        console.log('access ---> ', access)
        if(access.error) {
            return {
                error: true, 
                errorType: "error", 
                data: access.data
            }
        }

        const requestHeaders = {
            Authorization: `Bearer ${access.data}`,
            "Content-Type": "application/json"
        }

        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(requestBody) };
        let response = null
        
        response = await requestPromise(requestOptions);
        response = parseResponse(response);

        console.log('bvn verification response... ', response)

        if(!response.requestSuccessful) {
            return {
                error: true,
                errorType: 'badRequest',
                data: response.responseMessage
            }
        } else {
            let bvnVerified = false
            // Save matching and bvnVerified: true|false
            if(response.responseBody.name.matchPercentage > 50 && response.responseBody.dateOfBirth === 'FULL_MATCH') {
                bvnVerified = true
            }

            return {
                error: false,
                errorType: '',
                data: { bvnVerified, verificationData: response.responseBody }
            }
        }

    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: parseResponse(error.response.body).responseMessage
        }
    }
}

interface TransferFromWalletObject {
    amount: Number
    reference: string
    narration: string,
    destinationBankCode: string,
    destinationAccountNumber: string,
    sourceAccountNumber: string
}

export const transferFromWallet = async (input: TransferFromWalletObject) => {
    try {
        const url = `${config.monnify.BASE_URL}/api/v2/disbursements/single`
        const requestBody = {
            amount: input.amount,
            reference: input.reference,
            narration: input.narration,
            destinationBankCode: input.destinationBankCode,
            destinationAccountNumber: input.destinationAccountNumber,
            currency: "NGN",
            sourceAccountNumber: input.sourceAccountNumber
        }

        console.log(requestBody)
        const verb = 'POST'

        let response = null;
        const access = await getAuthorization() 
        if(access.error) {
            return {
                error: true, 
                errorType: "error", 
                data: access.data
            }
        }

        const requestHeaders = {
            Authorization: `Bearer ${access.data}`,
            "Content-Type": "application/json"
        }

        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(requestBody) };
        response = await requestPromise(requestOptions);

        console.log('HEADERS FOR RESERVATION =====>', requestHeaders)
        console.log('RESPONSE FOR RESERVATION =====>', response)

        // response = parseResponse(response);

        // if (!response.requestSuccessful) {
        //     return {
        //         error: true, 
        //         errorType: "error", 
        //         data: response.responseBody
        //     }
        // }

        // let transactionStatus = response.responseBody.status
        // if(response.responseBody.status==='SUCCESS') {
        //     transactionStatus = 'SUCCESSFUL'
        // }

        // await findAndUpdateTransaction(
        //     {transactionReference: input.reference},
        //     {
        //         status: transactionStatus, 
        //         channelResponse: response.responseBody
        //     },
        //     { new: true }
        // )
        
        return {
            error: false,
            errorType: '',
            data: response.responseBody
        }
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: parseResponse(error.response.body).responseMessage
        }
    }
}

// export const getTransferStatus = async (transactionReference: string) => {
//     try {
//         const url = `${config.monnify.BASE_URL}/api/v2/disbursements/single/summary?reference=${transactionReference}`
//         const requestBody = null
//         const verb = 'GET'

//         let response = null;
//         const access = await getAuthorization() 
//         if(access.error) {
//             return {
//                 error: true, 
//                 errorType: "error", 
//                 data: access.data
//             }
//         }

//         const requestHeaders = {
//             Authorization: `Bearer ${access.data}`,
//             "Content-Type": "application/json"
//         }

//         let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(requestBody) };
//         response = await requestPromise(requestOptions);

//         console.log('HEADERS FOR STATUS =====>', requestHeaders)
//         console.log('RESPONSE FOR STATUS =====>', response)

//         response = parseResponse(response);

//         if (!response.requestSuccessful) {
//             return {
//                 error: true, 
//                 errorType: "error", 
//                 data: response.responseBody
//             }
//         }

//         let transactionStatus = response.responseBody.status
//         if(response.responseBody.status==='SUCCESS') {
//             transactionStatus = 'SUCCESSFUL'
//         }

//         await findAndUpdateTransaction(
//             {transactionReference: input.reference},
//             {
//                 status: transactionStatus, 
//                 channelResponse: response.responseBody
//             },
//             { new: true }
//         )
        
//         return {
//             error: false,
//             errorType: '',
//             data: response.responseBody
//         }
//     } catch (error: any) {
//         return {
//             error: true,
//             errorType: 'error',
//             data: parseResponse(error.response.body).responseMessage
//         }
//     }
// }