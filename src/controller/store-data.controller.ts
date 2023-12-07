import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { createStoreData, deleteStoreData, findAndUpdateStoreData, findMultipleStoreData, findStoreData } from "../service/store-data.service";
import { createStore } from "../service/store.service";
import { createUser, findAllUsers, findAndUpdateUser } from "../service/user.service";


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


export const updateStoreIdsHandler = async (req: Request, res: Response) => {
    try {
        const allStoreData = await findMultipleStoreData({})
        let updated = 0
        // let createdData
        await Promise.all(allStoreData.map(async (item: any) => {
            item.store = '65565f5f01f9fe28b8505d64'
            await findAndUpdateStoreData({_id: item._id}, item, {new: true})
            updated += 1
            // }
        }))

        const allUsers = await findAllUsers({}, 5000, 1) 

        await Promise.all(allUsers.data.map(async (item: any) => {
            item.store = '65565f5f01f9fe28b8505d64'
            await findAndUpdateUser({_id: item._id}, item, {new: true})
            updated += 1
            // }
        }))

        return response.ok(res, {message: `${updated} store data updated`}) 
    } catch (error: any) {
        return response.error(res, error)
    }
}
export const pushSanitizeDataHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body
        let updated = 0
        let created = 0
        // let createdData
        await Promise.all(body.data.map(async (item: any) => {
            // const existingItem = await findStoreData({localId: item.id})
            // if(existingItem && existingItem.document !== item.doc) {
            //     await findAndUpdateStoreData({_id: existingItem._id}, {document: item.doc}, {new: true})
            //     updated += 1
            // } else {
            if(item.document.type === 'user') {
                console.log('skipping a user')
                // await createUser({
                //     email: item.document.email,
                //     username: item.document.username,
                //     name: item.document.name,
                //     phone: item.document.phone,
                //     idNumber:item.document.idNumber,
                //     permissions: item.document.permissions,
                //     password: item.document.password,
                //     passwordChanged: item.document.passwordChanged,
                //     userType: 'ADMIN'
                // })
            } else if (item.document.document === 'business') {
                console.log('creating a store')

                await createStore({
                    name: item.document.name,
                    address: item.document.address,
                    city: item.document.location,
                    state: item.document.state
                })
            } else {
                console.log('creating other')

                await createStoreData({
                    // localId: item.localId,
                    documentType: item.document.document,
                    createdBy: userId,
                    store: body.store,
                    document: item.document
                })
            }
            created += 1
            // }
        }))

        return response.ok(res, {message: `store data pushed successfully. ${created} created, ${updated} updated`}) 
    } catch (error: any) {
        return response.error(res, error)
    }
}

export const pushDataHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body
        let updated = 0
        let created = 0
        let createdData
        await Promise.all(body.data.map(async (item: any) => {
            // const existingItem = await findStoreData({localId: item.id})
            // if(existingItem && existingItem.document !== item.doc) {
            //     await findAndUpdateStoreData({_id: existingItem._id}, {document: item.doc}, {new: true})
            //     updated += 1
            // } else {
            createdData = await createStoreData({
                localId: item.id,
                documentType: item.document,
                createdBy: userId,
                store: body.store,
                document: item.doc
            })
            created += 1
            // }
        }))

        return response.ok(res, {message: `store data pushed successfully. ${created} created, ${updated} updated`, data: createdData}) 
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
        // const docType = req.params.documentType
        const storeId = req.params.storeId
        const itemId = req.params.itemId
        const update = req.body.document
        
        const storeData = await findStoreData({store: storeId, _id: itemId})

        if(!storeData) {
            return response.notFound(res, {message: 'item not found'})
        }

        const updated = await findAndUpdateStoreData({_id: storeData._id}, {document: update}, {new: true})
        return response.ok(res, {
            message: 'store data updated successfully', 
            data: updated
        }) 
    } catch (error: any) {
        return response.error(res, error)
    }
}

export const deleteDataItemHandler = async (req: Request, res: Response) => {
    try {
        // const docType = req.params.documentType
        const storeId = req.params.storeId
        const itemId = req.params.itemId
        
        const storeData = await findStoreData({store: storeId, _id: itemId})

        if(!storeData) {
            return response.notFound(res, {message: 'item not found'})
        }

        await deleteStoreData({_id: storeData._id})

        return response.ok(res, {
            message: 'store data deleted successfully', 
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