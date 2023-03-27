import { v4 as uuidv4 } from 'uuid';
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { UserDocument } from '../model/user.model';
import Invoice, { InvoiceDocument } from '../model/invoice.model';
import Package, { PackageDocument } from '../model/package.model';
import { TripDocument } from '../model/trip.model';
import Booking from '../model/booking.model';

interface CreateInvoiceInput {
    user?: UserDocument["_id"];
    invoiceCode: string;
    expiry: Date
    amount: number;
    invoiceFor: string,
    invoiceItem: PackageDocument["_id"] | TripDocument["_id"]
}

export const createInvoice = async (
    input: CreateInvoiceInput) => {
    try {
        const invoice = await Invoice.create(input)

        return invoice
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function findInvoices(
    query: FilterQuery<InvoiceDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await Invoice.find(query, {}, options).countDocuments()
    let invoices = null
    let expandQuery = null
    if(expand) {
        expandQuery = { path: expand, model: Package }
    }
    if(perPage===0&&page===0){
        invoices = await Invoice.find(query, {}, options)
    } else {
        invoices = await Invoice.find(query, {}, options).populate(expandQuery)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage)
    }

    return {
        total,
        invoices
    }
}

export async function findInvoice(
    query: FilterQuery<InvoiceDocument>,
    expand?: string,
    options: QueryOptions = { lean: true }
) {
    try {
        
        let expandQuery = null
        if(expand) {
            const testInvoice = await Invoice.findOne(query, {}, options)
            let model: any = Package
            if (testInvoice!.invoiceFor === 'FLIGHT') {
                model = Booking
            }
            expandQuery = { 
                path: expand, 
                model
            }
        }
        const invoice = await Invoice.findOne(query, {}, options).populate(expandQuery)
        
        return invoice
    } catch (error: any) {
        throw new Error(error)

    }
}

export async function findAndUpdateInvoice(
    query: FilterQuery<InvoiceDocument>,
    update: UpdateQuery<InvoiceDocument>,
    options: QueryOptions
) {

    try {
        return Invoice.findOneAndUpdate(query, update, options)
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: JSON.parse(error.error).message
        } 
    }
}