import { Request, Response } from "express";
import { createEnquiry, findAndUpdateEnquiry, findEnquiries, findEnquiry } from "../service/enquiry.service"
import * as response from '../responses'
import { get } from "lodash";
import { addMinutesToDate, generateCode, getJsDate } from "../utils/utils";
import { findPrice } from "../service/price.service";
import { createInvoice } from "../service/invoice.service";

const parseEnquiryFilters = (query: any) => {
    const { enquiryType, status, maritalStatus, name, email, phone, nationality, invoice, appointment, visaEnquiryCountry, travelHistory } = query; 

    const filters: any = {}; 

    if (enquiryType) {
        filters.enquiryType = enquiryType
    } 
    
    if (status) {
        filters.status = status
    }

    if (maritalStatus) {
        filters.maritalStatus = maritalStatus
    }
    
    if (name) {
        filters.name = name; 
    }
    
    if (email) {
        filters.email = email; 
    }
        
    if (phone) {
        filters.phone = phone; 
    }
        
    if (invoice) {
        filters.invoice = invoice; 
    }
  
    if (nationality) {
        filters.nationality = nationality 
    }
  
    if (appointment) {
        filters.appointment = appointment; 
    }
  
    if (visaEnquiryCountry) {
        filters.visaEnquiryCountry = visaEnquiryCountry; 
    }
  
    if (travelHistory) {
        filters.travelHistory = travelHistory; 
    }
  
    return filters

}


export const createEnquiryHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        let body = req.body

        let enquiryPrice = null

        if(body.enquiryType === 'VISA' && body.price && body.price !== '') {
            enquiryPrice = await findPrice({_id: body.price})
        }

        if(body.enquiryType === 'VISA' && body.price && body.price !== '' && !enquiryPrice) {
            return response.ok(res, {message: 'price not found'})
        }
        
        if(body.dateOfBirth && body.dateOfBirth !== '') {
            body = {...body, ...{dateOfBirth: getJsDate(body.dateOfBirth)}}
        }

        const enquiry = await createEnquiry({...body, ...{createdBy: userId}})
        
        if(body.enquiryType === 'VISA' && body.price && body.price !== '' && enquiryPrice ) {
            const invoiceItemType = 'ENQUIRY'       
            const invoiceCode = generateCode(18, false).toUpperCase()
            
            const invoiceInput = {
                user: userId,
                invoiceCode: invoiceCode,
                amount: +enquiryPrice.price,
                expiry: addMinutesToDate(new Date(), 1440), // 1 day
                invoiceFor: invoiceItemType,
                invoiceItem: enquiry._id
            }
    
            const invoice = await createInvoice(invoiceInput)

            // update with the invoice

            const updatedEnquiry = await findAndUpdateEnquiry({_id: enquiry._id}, {invoice: invoice._id}, {new: true})
            return response.created(res, updatedEnquiry)
        }

        
        return response.created(res, enquiry)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getEnquiriesHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const filters = parseEnquiryFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; 
        const page = +queryObject.page || 1; 
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const enquiries = await findEnquiries( {...filters, ...{ deleted: false }}, resPerPage, page, expand)
        // return res.send(post)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: enquiries.total,
            enquiries: enquiries.enquiries
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getEnquiryHandler = async (req: Request, res: Response) => {
    try {
        const enquiryId = get(req, 'params.enquiryId');
        const queryObject: any = req.query;
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const enquiry = await findEnquiry({ _id: enquiryId, deleted: false }, expand)

        if(!enquiry) {
            return response.notFound(res, {message: 'enquiry not found'})
        }

        return response.ok(res, enquiry)
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updateEnquiryHandler = async (req: Request, res: Response) => {
    try {
        const enquiryId = get(req, 'params.enquiryId');
        const userId = get(req, 'user._id');
        let update = req.body

        const enquiry = await findEnquiry({_id: enquiryId})
        if(!enquiry) {
            return response.notFound(res, {message: 'enquiry not found'})
        }

        if(update.note && update.note !== '') {
            const enquiryNotes = enquiry.notes || []
            
            enquiryNotes.push({
                noteBy: userId,
                note: update.note,
                createdDate: new Date()
            })

            update.notes = enquiryNotes
        }

        await findAndUpdateEnquiry({_id: enquiry._id}, update, {new: true})

        return response.ok(res, {message: 'enquiry updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deleteEnquiryHandler = async (req: Request, res: Response) => {
    try {
        const enquiryId = get(req, 'params.enquiryId');

        const enquiry = await findEnquiry({enquiryId})
        if(!enquiry) {
            return response.notFound(res, {message: 'enquiry not found'})
        }

        await findAndUpdateEnquiry({_id: enquiry._id}, {deleted: true}, {new: true})

        return response.ok(res, {message: 'enquiry deleted successfully'})
        
        
    } catch (error:any) {
        return response.error(res, error)
    }
}