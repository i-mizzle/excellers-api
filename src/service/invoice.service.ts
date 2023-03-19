import { v4 as uuidv4 } from 'uuid';
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { UserDocument } from '../model/user.model';
import Invoice, { InvoiceDocument } from '../model/invoice.model';
import { PackageDocument } from '../model/package.model';
import { TripDocument } from '../model/trip.model';

interface CreateInvoiceInput {
    user: UserDocument["_id"];
    createdBy: UserDocument["_id"];
    invoiceCode: string;
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
    if(perPage===0&&page===0){
        invoices = await Invoice.find(query, {}, options)
    } else {
        invoices = await Invoice.find(query, {}, options).populate(expand)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        invoices
    }
}

export async function findPackage(
    query: FilterQuery<InvoiceDocument>,
    expand?: string,
    options: QueryOptions = { lean: true }
) {
    try {
        const invoice = await Invoice.findOne(query, {}, options).populate(expand)
        
        return invoice
    } catch (error: any) {
        throw new Error(error)

    }
}

export async function findAndUpdatePackage(
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