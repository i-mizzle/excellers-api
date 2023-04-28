import { Request, Response } from "express";
import { createInvoice, findInvoice, findInvoices } from "../service/invoice.service";
import * as response from '../responses'
import User from "../model/user.model";
import { get } from "lodash";
import { findPrice } from "../service/price.service";
import { generateCode } from "../utils/utils";
import { getJsDate } from "../utils/utils";

export const createInvoiceHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body
        const invoiceCode = generateCode(18, false).toUpperCase()

        // const invoiceInput = {
        //     user: userId,
        //     invoiceCode: invoiceCode,
        //     amount: invoiceAmount,
        //     expiry: addMinutesToDate(new Date(), 1440), // 1 day
        //     invoiceFor: invoiceItemType,
        //     invoiceItem: booking.data._id
        // }

        const pricing = await findPrice({slug: body.price})

        if(!pricing) {
            return response.notFound(res, {message: 'price not found'})
        }

        const invoice = await createInvoice({...body, ...{
            amount: pricing.price, 
            invoiceCode: invoiceCode,
            expiry: getJsDate(body.expiry)
        }})

        return response.ok(res, invoice)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getInvoicesHandler = async (req: Request, res: Response) => {
    try {
        const user: any = get(req, 'user')
        const queryObject: any = req.query;
        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        console.log(expand)

        let invoicesQuery: any = {user: user?._id}

        if(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMINISTRATOR' ) {
            invoicesQuery = {}
        }
        
        const invoices = await findInvoices(invoicesQuery, resPerPage, page, expand)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: invoices.total,
            invoices: invoices.invoices
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getInvoiceHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const invoiceId = get(req, 'params.invoiceId');

        const ObjectId = require('mongoose').Types.ObjectId;

        let invoice = null
        if(ObjectId.isValid(invoiceId)) {
            invoice = await findInvoice({_id: invoiceId}, expand)
        } else {
            invoice = await findInvoice({invoiceCode: invoiceId}, expand)
        }

        if(!invoice) {
            return response.notFound(res, {message: 'invoice not found'})
        }

        return response.ok(res, invoice)
        
    } catch (error:any) {
        return response.error(res, error)
    }
}