import axios from "axios";
import { StringDate } from "../../utils/types"
import { formatPhoneNumber, parseResponse } from "../../utils/utils"
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
    Authorization: config.bizgem.PUBLIC_KEY
}

export const validateBvn = async (input: BizgemBvnValidationInterface) => {
    try {
        console.log('validating... ', `${config.bizgem.BASE_URL}/kyc/bvn`)
        // const url = `${config.bizgem.BASE_URL}/kyc/bvn`
        // const verb = 'POST'

        const requestBody = {
            bvn:input.bvn,
            firstName: input.firstName,
            lastName: input.lastName,
            reference: input.reference,
            dateOfBirth: input.dob
        }

        // const requestHeaders = {
        //     Authorization: config.bizgem.PUBLIC_KEY
        // }

        // console.log('requestHeaders... ', requestHeaders)


        // let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(requestBody) };
        // let response = null
        
        // response = await requestPromise(requestOptions);
        // response = parseResponse(response);

        // console.log('-----> Validation response ----->', response)
        // if(response.responseCode !== '00') {
        //     console.log('errored... ')
        //     throw new Error(response.responseMessage)
        // }

        // return {
        //     error: false, 
        //     errorType: "", 
        //     data: response.responseBody.accessToken
        // }

        const response = await axios.post(`${config.bizgem.BASE_URL}/kyc/bvn`, requestBody, { headers })
        console.log(response)
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

        const requestHeaders = {
            Authorization: `${config.bizgem.PUBLIC_KEY}`,
            "Content-Type": "application/json"
        }

        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(requestBody) };
        let response = null
        
        response = await requestPromise(requestOptions);
        response = parseResponse(response);

        if(response.responseCode !== '00') {
            throw new Error(response.responseMessage)
        }

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

export interface BizgemCreateVirtualAccountInterface {
    firstName: string
    lastName: string
    address?: string 
    phoneNumber: string
    bvn: string
    dob: string
}

export const createVirtualAccount = async (input: BizgemCreateVirtualAccountInterface) => {
    try {
        console.log('creating virtual account... ')
        const url = `${config.bizgem.BASE_URL}/virtual-account/create`
        const verb = 'POST'

        const channels = await getChannelBankCodes()
        const selectedChannel = channels.data[0]

        const requestBody = {
            firstName: input.firstName,
            lastName: input.lastName,
            address: input.address,
            phoneNumber: input.phoneNumber,
            accountParent: config.bizgem.BASE_WALLET,
            bvn: input.bvn,
            channelBankCode: selectedChannel.bankCode,
            dob: input.dob
        }

        const requestHeaders = {
            Authorization: `${config.bizgem.PUBLIC_KEY}`,
            "Content-Type": "application/json"
        }

        let requestOptions = { uri: url, method: verb, headers: requestHeaders, body: JSON.stringify(requestBody) };
        let response = null
        
        response = await requestPromise(requestOptions);
        response = parseResponse(response);

        console.log('-----> virtual account creation response ----->', response)

        if(response.responseCode !== '00') {
            // return {
            //     error: true, 
            //     errorType: "error", 
            //     data: response
            // }
            throw new Error(response.responseMessage)
        }

        return {
            error: false, 
            errorType: "", 
            data: {...response.data, ...{channel: selectedChannel} }
        }
        
    } catch (error: any) {
        console.error('--->BIZGEM VIRTUAL ACCT CREATION ERROR BLOCK --->', error.response.data)  
        throw new Error(error.response.data.message)
    }
}

const getVirtualAccountTransactions = () => {
    try {
        
    } catch (error) {
        
    }
}

const validateAccountNumber = () => {
    try {
        
    } catch (error) {
        
    }
}

const transferFunds = () => {
    try {
        
    } catch (error) {
        
    }
}

const checkTransactionStatus = () => {
    try {
        
    } catch (error) {
        
    }
}



