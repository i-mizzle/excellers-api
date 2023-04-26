import { Request, Response } from "express";
import { createEnquiry, findAndUpdateEnquiry, findEnquiries, findEnquiry } from "../service/enquiry.service"
import * as response from '../responses'
import { get } from "lodash";

export const createEnquiryHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body

        const enquiry = await createEnquiry({...body, ...{createdBy: userId}})
        return response.created(res, enquiry)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getEnquiriesHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const resPerPage = +queryObject.perPage || 25; 
        const page = +queryObject.page || 1; 
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const enquiries = await findEnquiries( { deleted: false }, resPerPage, page, expand)
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

        let update = req.body

        const enquiry = await findEnquiry({_id: enquiryId})
        if(!enquiry) {
            return response.notFound(res, {message: 'enquiry not found'})
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