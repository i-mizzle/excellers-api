import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { findWallet, findWallets } from "../service/naira-wallet.service";
import { formatBizgemDate, getJsDate } from "../utils/utils";
import { getVirtualAccountBalance, getVirtualAccountTransactions } from "../service/integrations/bizgem.service";

const parseWalletFilters = (query: any) => {
    const { accountName, accountNumber, minDate, maxDate } = query; // assuming the query params are named 'name', 'price', 'startDate', and 'endDate'

    const filters: any = {}; // create an empty object to hold the filters
  
    if (accountName) {
      filters.accountName = accountName; 
    }
    
    if (accountNumber) {
      filters.accountNumber = accountNumber; 
    }
  
    if (minDate && !maxDate) {
        filters.createdAt = { $gte: (getJsDate(minDate)) }; 
    }

    if (maxDate && !minDate) {
        filters.createdAt = { $lte: getJsDate(maxDate) }; 
    }

    if (minDate && maxDate) {
        filters.date = { $gte: getJsDate(minDate), $lte: getJsDate(maxDate) };
    }

    return filters
}

export const getWalletsHandler = async (req: Request, res: Response) => {
    try {
        const user: any = get(req, 'user')
        const queryObject: any = req.query;
        const filters = parseWalletFilters(queryObject)

        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page
        const wallets = await findWallets(filters, resPerPage, page)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: wallets.total,
            wallets: wallets.wallets
        }

        return response.ok(res, responseObject)      
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getWalletHandler = async (req: Request, res: Response) => {
    try {
        let wallet = null
        const ObjectId = require('mongoose').Types.ObjectId;
        const walletId = get(req, 'params.walletId');
        if(ObjectId.isValid(walletId)) {
            wallet = await findWallet({_id: walletId})
        } else {
            wallet = await findWallet({accountNumber: walletId})
        }

        if(!wallet) {
            return response.notFound(res, {message: 'wallet not found'})
        }

        return response.ok(res, wallet)
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const transferFromWalletHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body

        // const enquiry = await createEnquiry({...body, ...{createdBy: userId}})
        // return response.created(res, enquiry)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getWalletBalanceHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        let wallet = null
        const ObjectId = require('mongoose').Types.ObjectId;
        const walletId = get(req, 'params.walletId');
        if(ObjectId.isValid(walletId)) {
            wallet = await findWallet({_id: walletId})
        } else {
            wallet = await findWallet({accountNumber: walletId})
        }

        if(!wallet) {
            return response.notFound(res, {message: 'wallet not found'})
        }

        const walletBalance = await getVirtualAccountBalance({
            accountNumber: wallet.accountParent
        })

        if(!walletBalance || walletBalance.error === true) {
            return response.handleErrorResponse(res, walletBalance)
        }

        return response.ok(res, {
            accountBalance: walletBalance.data.accountBalance,
            totalCredit: walletBalance.data.accountTotalCredit,
            totalDebit: walletBalance.data.accountTotalDebit,
            ledgerBalance: walletBalance.data.accountLedgerBalance,
            currency: walletBalance.data.accountCurrency,
        })
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getWalletTransactionsHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        let wallet = null
        const ObjectId = require('mongoose').Types.ObjectId;
        const walletId = get(req, 'params.walletId');
        if(ObjectId.isValid(walletId)) {
            wallet = await findWallet({_id: walletId})
        } else {
            wallet = await findWallet({accountNumber: walletId})
        }

        if(!wallet) {
            return response.notFound(res, {message: 'wallet not found'})
        }

        const walletTransactions = await getVirtualAccountTransactions({
            startDate: formatBizgemDate(wallet.createdAt),
            endDate: formatBizgemDate(new Date()),
            accountNumber: wallet.accountNumber,
            searchItem: queryObject.searchTerm,
            page: 1
        })

        if(!walletTransactions || walletTransactions.error === true) {
            return response.handleErrorResponse(res, walletTransactions)
        }

        return response.ok(res, {transactions: walletTransactions.data})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}