import axios from "axios";
import { StringDate } from "../../utils/types"
import { formatPhoneNumber, months, parseResponse } from "../../utils/utils"
const requestPromise = require("request-promise");
const config = require('config')
interface BizgemBvnValidationInterface {
    dob: StringDate,
    firstName: string,
    lastName: string,
    bvn: string,
    reference: string
}

const headers = {
    "Content-Type": "application/json",
    Authorization: config.bizgem.SECRET_KEY
}

export const validateBvn = async (input: BizgemBvnValidationInterface) => {
    try {
        console.log('validating... ', `${config.bizgem.BASE_URL}/kyc/bvn`)

        const dob = input.dob.split('-')

        const requestBody = {
            bvn:input.bvn,
            firstName: input.firstName,
            lastName: input.lastName,
            reference: input.reference,
            dateOfBirth: `${dob[0]}-${months[dob[1] as keyof typeof months]}-${dob[2]}`
        }

        console.log('rqst .... ', requestBody)

        const response = await axios.post(`${config.bizgem.BASE_URL}/kyc/bvn`, requestBody, { headers })
        // console.log(response)
        return {
            error: false,
            data: response.data,
            errorType: '',
        }
    } catch (error: any) {
        console.error('--->BIZGEM BVN VALIDATION ERROR BLOCK --->', error.response.data)  
        throw new Error(error.response.data.message)
    }
}

const getChannelBankCodes = async () => {
    try {
        console.log('fetching channel codes... ')
        const url = `${config.bizgem.BASE_URL}/virtual-account/channel-codes`
        const verb = 'POST'

        const requestBody = {
            requestType: "FETCH_ALL"
        }

        let requestOptions = { uri: url, method: verb, headers: headers, body: JSON.stringify(requestBody) };
        let response = null
        
        response = await requestPromise(requestOptions);
        response = parseResponse(response);

        if(response.responseCode !== '00') {
            throw new Error(response.responseMessage)
        }

        console.log('CHANNELS ->0> ', response.data)

        return {
            error: false, 
            errorType: "", 
            data: response.data
        }
    } catch (error: any) {
        console.error('--->BIZGEM BVN VALIDATION ERROR BLOCK --->', error.response.data)  
        throw new Error(error.response.data.message)
    }
}

interface BizgemWalletCreationInterface {
    bvn: string
    dob: string
    email: string
    firstName: string
    lastName: string
    phoneNumber: string
}

const createWallet = async (input: BizgemWalletCreationInterface) => {
    try {
        console.log('creating wallet... ', `${config.bizgem.BASE_URL}/wallet/create`)

        const dob = input.dob.split('-')

        const requestBody = {
            bvn: input.dob,
            dob: `${dob[2]}-${dob[1]}-${dob[0]}`,
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            phoneNumber: input.phoneNumber,
            countryCode: "234",
            currency: "NGN"
        }

        console.log('wallet creation rqst .... ', requestBody)

        const response = await axios.post(`${config.bizgem.BASE_URL}/wallet/create`, requestBody, { headers })
        // console.log(response)
        return {
            error: false,
            data: response.data,
            errorType: '',
        }
    } catch (error: any) {
        console.error('--->BIZGEM BVN VALIDATION ERROR BLOCK --->', error.response.data)  
        throw new Error(error.response.data.message)
    }
}

export interface BizgemCreateVirtualAccountInterface {
    firstName: string
    lastName: string
    address?: string 
    phoneNumber: string
    email: string
    bvn: string
    dob: string
}

export const createVirtualAccount = async (input: BizgemCreateVirtualAccountInterface) => {
    try {
        console.log('creating virtual account... ')
        const wallet = await createWallet({
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phoneNumber: input.phoneNumber,
            bvn: input.bvn,
            dob: input.dob
        })
        const url = `${config.bizgem.BASE_URL}/virtual-account/create`
        const verb = 'POST'

        const channels = await getChannelBankCodes()
        const selectedChannel = channels.data[0]

        const requestBody = {
            firstName: input.firstName,
            lastName: input.lastName,
            address: input.address,
            phoneNumber: input.phoneNumber,
            accountParent: wallet.data.accountNumber,
            bvn: input.bvn,
            channelBankCode: selectedChannel.bankCode,
            dob: input.dob
        }

        console.log('RQST_BODY -> ', requestBody)

        let requestOptions = { uri: url, method: verb, headers: headers, body: JSON.stringify(requestBody) };
        let response = null
        
        response = await requestPromise(requestOptions);
        response = parseResponse(response);

        console.log('-----> virtual account creation response ----->', response)

        if(response.responseCode !== '00') {
            return {
                error: true, 
                errorType: "error", 
                data: response
            }
            // throw new Error(response.responseMessage)
        } else {
            return {
                error: false, 
                errorType: "", 
                data: {...response, ...{channel: selectedChannel} }
            }
        }

        
    } catch (error: any) {
        console.error('--->BIZGEM VIRTUAL ACCT CREATION ERROR BLOCK --->', error.response.data)  
        throw new Error(error.response.data.message)
    }
}

interface BizgemWalletTransactionsInterface {
    startDate: string,
    endDate: string,
    accountNumber: string,
    searchItem: string,
    page: number
}

export const getVirtualAccountTransactions = async (input: BizgemWalletTransactionsInterface) => {
    try {
        const url = "virtual-account/read-transaction"
        console.log('fetching wallet transaction... ', `${config.bizgem.BASE_URL}/${url}`)


        const requestBody = {
            startDate: input.startDate,
            endDate: input.endDate,
            accountNumber: input.accountNumber,
            searchItem: input.searchItem || '',
            page: input.page
        }

        console.log('wallet transactions request .... ', requestBody)

        const response = await axios.post(`${config.bizgem.BASE_URL}/${url}`, requestBody, { headers })
        console.log(response.data)

        if(response.data.responseCode !== '00') {
            return {
                error: true,
                data: response.data.responseMessage,
                errorType: 'badRequest',
            }
        }

        return {
            error: false,
            data: response.data,
            errorType: '',
        }
    } catch (error: any) {
        console.error('--->BIZGEM VIRTUAL ACCT TRANSACTIONS ERROR BLOCK --->', error.response.data)  
        // throw new Error(error.response.data.message)
        return {
            error: true,
            data: error.response.data.message,
            errorType: 'badRequest',
        }
    }
}

interface BizgemWalletBalanceInterface {
    accountNumber: string
}

export const getVirtualAccountBalance = async (input: BizgemWalletBalanceInterface) => {
    try {
        const url = "wallet/balance-enquiry"
        console.log('fetching wallet balance... ', `${config.bizgem.BASE_URL}/${url}`)


        const requestBody = input

        console.log('wallet balance request .... ', requestBody)

        const response = await axios.post(`${config.bizgem.BASE_URL}/${url}`, requestBody, { headers })
        console.log(response.data)

        if(response.data.responseCode !== '00') {
            return {
                error: true,
                data: response.data.responseMessage,
                errorType: 'badRequest',
            }
        }

        return {
            error: false,
            data: response.data,
            errorType: '',
        }
    } catch (error: any) {
        console.error('--->BIZGEM WALLET ERROR BLOCK --->', error.response.data)  
        // throw new Error(error.response.data.message)
        return {
            error: true,
            data: error.response.data.message,
            errorType: 'badRequest',
        }
    }
}

interface bizgemValidateAccountNumberInterface {
        accountBankCode: string,
        accountNumber: string
}

export const validateAccountNumber = async (input: bizgemValidateAccountNumberInterface) => {
    try {
        const url = "virtual-account/name-enquiry"
        console.log('fetching banks list... ', `${config.bizgem.BASE_URL}/${url}`)

        const requestBody = input

        const response = await axios.post(`${config.bizgem.BASE_URL}/${url}`, requestBody, { headers })
        console.log(response.data)

        if(response.data.responseCode !== '00') {
            return {
                error: true,
                data: response.data.responseMessage,
                errorType: 'badRequest',
            }
        }

        return {
            error: false,
            data: response.data,
            errorType: '',
        }
    } catch (error: any) {
        console.error('--->BIZGEM WALLET ERROR BLOCK --->', error.response.data)  
        // throw new Error(error.response.data.message)
        return {
            error: true,
            data: error.response.data.message,
            errorType: 'badRequest',
        }
    }
}

export const getBanksList = async () => {
    try {
        const url = "virtual-account/bank-list"
        console.log('fetching banks list... ', `${config.bizgem.BASE_URL}/${url}`)

        const requestBody = {
            readAll: "YES"
        }

        const response = await axios.post(`${config.bizgem.BASE_URL}/${url}`, requestBody, { headers })
        console.log(response.data)

        if(response.data.responseCode !== '00') {
            return {
                error: true,
                data: response.data.responseMessage,
                errorType: 'badRequest',
            }
        }

        return {
            error: false,
            data: response.data.data,
            errorType: '',
        }
    } catch (error: any) {
        console.error('--->BIZGEM WALLET ERROR BLOCK --->', error.response.data)  
        // throw new Error(error.response.data.message)
        return {
            error: true,
            data: error.response.data.message,
            errorType: 'badRequest',
        }
    }
}

export interface BizgemFundsTransferInterface {
    amount: string,
    bankName: string,
    bankCode: string,
    creditAccountName: string,
    creditAccountNumber: string,
    debitAccountName: string,
    debitAccountNumber: string,
    narration: string,
    sessionId: string,
    reference: string
}

export const transferFunds = async (input: BizgemFundsTransferInterface) => {
    try {
        const url = "virtual-account/inter-bank-fund-transfer"
        console.log('fetching wallet balance... ', `${config.bizgem.BASE_URL}/${url}`)

        const requestBody = input

        console.log('wallet balance request .... ', requestBody)

        const response = await axios.post(`${config.bizgem.BASE_URL}/${url}`, requestBody, { headers })
        console.log(response.data)

        if(response.data.responseCode !== '00') {
            return {
                error: true,
                data: response.data.responseMessage,
                errorType: 'badRequest',
            }
        }

        return {
            error: false,
            data: response.data,
            errorType: '',
        }
    } catch (error: any) {
        console.error('--->BIZGEM WALLET ERROR BLOCK --->', error.response.data)  
        // throw new Error(error.response.data.message)
        return {
            error: true,
            data: error.response.data.message,
            errorType: 'badRequest',
        }
    }
}

const checkTransactionStatus = () => {
    try {
        
    } catch (error) {
        
    }
}



