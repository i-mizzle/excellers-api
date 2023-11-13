import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { createStoreData, findAndUpdateStoreData, findMultipleStoreData, findStoreData } from "../service/store-data.service";


const parseFilters = (query: any) => {
    const { minDateCreated, maxDateCreated, type } = query; 

    const filters: any = {}; 

    // if (type) {
    //     filters.enquiryType = enquiryType
    // } 

    if (type) {
        filters["document.type"] = type; 
    } 
    
    // if (status) {
    //     filters.status = status
    // }

    // if (maritalStatus) {
    //     filters.maritalStatus = maritalStatus
    // }
    
    // if (name) {
    //     filters.name = name; 
    // }
    
    // if (email) {
    //     filters.email = email; 
    // }
        
    // if (phone) {
    //     filters.phone = phone; 
    // }
        
    // if (invoice) {
    //     filters.invoice = invoice; 
    // }
  
    // if (nationality) {
    //     filters.nationality = nationality 
    // }
  
    // if (appointment) {
    //     filters.appointment = appointment; 
    // }
  
    // if (visaEnquiryCountry) {
    //     filters.visaEnquiryCountry = visaEnquiryCountry; 
    // }
  
    // if (travelHistory) {
    //     filters.travelHistory = travelHistory; 
    // }

    // if (minDateCreated && !maxDateCreated) {
    //     filters.createdAt = { $gte: (getJsDate(minDateCreated)) }; 
    // }

    // if (maxDateCreated && !minDateCreated) {
    //     filters.createdAt = { $lte: getJsDate(maxDateCreated) }; 
    // }

    // if (minDateCreated && maxDateCreated) {
    //     filters.date = { $gte: getJsDate(minDateCreated), $lte: getJsDate(maxDateCreated) };
    // }
  
    return filters

}


export const pushDataHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body
        let updated = 0
        let created = 0
        await Promise.all(body.data.map(async (item: any) => {
            console.log('items in map => => ', item)
            // const existingItem = await findStoreData({localId: item.id})
            // if(existingItem && existingItem.document !== item.doc) {
            //     await findAndUpdateStoreData({_id: existingItem._id}, {document: item.doc}, {new: true})
            //     updated += 1
            // } else {
            await createStoreData({
                localId: item.id,
                documentType: item.document,
                createdBy: userId,
                store: body.store,
                document: item.doc
            })
            created += 1
            // }
        }))

        return response.ok(res, {message: `store data pushed successfully. ${created} created, ${updated} updated`}) 
    } catch (error: any) {
        return response.error(res, error)
    }
}

export const pullDataHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const filters = parseFilters(queryObject)
        // const userId = get(req, 'user._id');
        const docType = req.params.documentType
        const storeId = req.params.storeId

        const storeData = await findMultipleStoreData({...filters, ...{store: storeId, documentType: docType}})
        return response.ok(res, {
            message: 'store data pulled successfully', 
            data: storeData
        }) 
    } catch (error: any) {
        return response.error(res, error)
    }
}

export const pullSingleDataItemHandler = async (req: Request, res: Response) => {
    try {
        // const queryObject: any = req.query;
        // const filters = parseFilters(queryObject)
        // const userId = get(req, 'user._id');
        const docType = req.params.documentType
        const storeId = req.params.storeId
        const itemId = req.params.itemId
        
        const storeData = await findStoreData({store: storeId, documentType: docType, _id: itemId})

        if(!storeData) {
            return response.notFound(res, {message: 'item not found'})
        }
        return response.ok(res, {
            message: 'store data pulled successfully', 
            data: storeData
        }) 
    } catch (error: any) {
        return response.error(res, error)
    }
}

export const updateDataItemHandler = async (req: Request, res: Response) => {
    try {
        const docType = req.params.documentType
        const storeId = req.params.storeId
        const itemId = req.params.itemId
        const update = req.body
        
        const storeData = await findStoreData({store: storeId, documentType: docType, _id: itemId})

        if(!storeData) {
            return response.notFound(res, {message: 'item not found'})
        }

        const updated = await findAndUpdateStoreData({_id: storeData._id}, update, {new: true})
        return response.ok(res, {
            message: 'store data updates successfully', 
            data: updated
        }) 
    } catch (error: any) {
        return response.error(res, error)
    }
}

export const updateMultipleDataItemHandler = async (req: Request, res: Response) => {
    try {
        const docType = req.params.documentType
        const storeId = req.params.storeId
        const itemId = req.params.itemId
        const update = req.body

        const storeData = await findStoreData({store: storeId, documentType: docType, _id: itemId})
        if(!storeData) {
            return response.notFound(res, {message: 'item not found'})
        }
        let updatedItems: any = []
        await Promise.all(update.documents.map(async (item: any) => {
            const updated = await findAndUpdateStoreData({_id: storeData._id}, item, {new: true})
            updatedItems.push(updated)
        }))
        
        return response.ok(res, {
            message: `${updatedItems.length} updated successfully'`, 
            data: updatedItems
        }) 
    } catch (error: any) {
        return response.error(res, error)
    }
}