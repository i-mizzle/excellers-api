import { Request, Response } from "express";
import * as response from '../responses'
import { findWallet } from "../service/naira-wallet.service";
import { getBanksList, transferFunds, validateAccountNumber } from "../service/integrations/bizgem.service";
import { get } from "lodash";
import { generateCode } from "../utils/utils";

export const getBanksHandler = async (req: Request, res: Response) => {
    try {
        const banks = await getBanksList()

        if(!banks || banks.error === true) {
            return response.handleErrorResponse(res, banks)
        }

        return response.ok(res, {banks: banks.data})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const validateBankAccountHandler = async (req: Request, res: Response) => {
    try {
        const body = req.body
        const accountDetails = await validateAccountNumber({
            accountBankCode: body.bankCode,
            accountNumber: body.accountNumber
        })

        if(!accountDetails || accountDetails.error === true) {
            return response.handleErrorResponse(res, accountDetails)
        }

        return response.ok(res, {
            accountName: accountDetails.data.accountName,
            accountNumber: accountDetails.data.accountNumber,
            bankCode: accountDetails.data.bankCode,
            sessionId: accountDetails.data.sessionId
        })
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const fundsTransferHandler = async (req: Request, res: Response) => {
    try {
        const body = req.body
        const userId = get(req, 'user._id');
        
        const wallet = await findWallet({_id: body.wallet})
        
        if(!wallet) {
            return response.notFound(res, {message: 'wallet not found'})
        }

        if(userId !== wallet.user.toString()) {
            return response.conflict(res, {message: 'you can only perform a transfer frm your own wallet'})
        }

        const transactionReference = generateCode(18,false).toUpperCase()

        const transfer = await transferFunds({
            amount: (body.amount/100).toString(),
            bankName: body.bankName,
            bankCode: body.bankCode,
            creditAccountName: body.accountName,
            creditAccountNumber: body.accountNumber,
            debitAccountName: wallet.accountName,
            debitAccountNumber: wallet.accountParent,
            narration: body.narration && body.narration !== '' ? body.narration : transactionReference,
            sessionId: body.sessionId,
            reference: transactionReference
        })

        if(!transfer || transfer.error === true) {
            return response.handleErrorResponse(res, transfer)
        }

        return response.ok(res, {message: 'transfer initiated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}