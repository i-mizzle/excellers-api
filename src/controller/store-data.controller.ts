import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { createStoreData, deleteStoreData, findAndUpdateStoreData, findMultipleStoreData, findStoreData } from "../service/store-data.service";
import { createStore } from "../service/store.service";
import { createUser, findAllUsers, findAndUpdateUser } from "../service/user.service";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import * as Papa from 'papaparse';
import { getJsDate, returnDocuments } from "../utils/utils";
import { createCategory, findCategory } from "../service/category.service";
import { createItem, findItem } from "../service/item.service";
import { createVariant } from "../service/item-variant.service";
import { ItemVariantDocument, Recipe } from "../model/item-variant.model";

const parseFilters = (query: any) => {
    const { minDateCreated, maxDateCreated, type, name, amount, channel, status, transactionReference } = query; 

    const filters: any = {}; 

    if (type) {
        filters["document.type"] = type; 
    } 
    
    if (name) {
        filters["document.name"] = { $regex: new RegExp(name, 'i') }; // 'i' for case-insensitive matching 
    }
    
    if (amount) {
        filters["document.amount"] = amount
    }
    
    if (channel) {
        filters["document.channel"] = channel
    }
    
    if (status) {
        filters["document.status"] = status
    }
    
    if (transactionReference) {
        filters["document.transactionReference"] = { $regex: new RegExp(transactionReference, 'i') }; // 'i' for case-insensitive matching 
    }

    if (minDateCreated && !maxDateCreated) {
        filters.createdAt = { $gte: (getJsDate(minDateCreated)) }; 
    }

    if (maxDateCreated && !minDateCreated) {
        filters.createdAt = { $lte: getJsDate(maxDateCreated) }; 
    }

    if (minDateCreated && maxDateCreated) {
        filters.date = { $gte: getJsDate(minDateCreated), $lte: getJsDate(maxDateCreated) };
    }
  
    return filters

}


// export const updateStoreIdsHandler = async (req: Request, res: Response) => {
//     try {
//         const allStoreData = await findMultipleStoreData({})
//         let updated = 0
//         // let createdData
//         await Promise.all(allStoreData.map(async (item: any) => {
//             item.store = '65565f5f01f9fe28b8505d64'
//             await findAndUpdateStoreData({_id: item._id}, item, {new: true})
//             updated += 1
//             // }
//         }))

//         const allUsers = await findAllUsers({}, 5000, 1) 

//         await Promise.all(allUsers.data.map(async (item: any) => {
//             item.store = '65565f5f01f9fe28b8505d64'
//             await findAndUpdateUser({_id: item._id}, item, {new: true})
//             updated += 1
//             // }
//         }))

//         return response.ok(res, {message: `${updated} store data updated`}) 
//     } catch (error: any) {
//         return response.error(res, error)
//     }
// }
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
        const perPage = +queryObject.perPage
        const page = queryObject.page

        const storeData = await findMultipleStoreData({...filters, ...{store: storeId, documentType: docType}}, page, perPage)

        return response.ok(res, {
            message: 'store data pulled successfully', 
            total: storeData.total,
            data: storeData.data
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

const orderItems = (order: any) => {
    console.log(order)
    let orderItemsString = ''

    if(order?.orderItems && order?.orderItems?.length > 0) {
        order?.orderItems?.forEach((item: any, itemIndex: number) => {
            orderItemsString += `${item.quantity} unit(s) of ${item.itemName} at ${item.price}`
            if(itemIndex < order.orderItems.length - 1){
                orderItemsString += ', '
            }
        })
    }
    return orderItemsString
}

export const exportDataToPdfHandler = async (req: Request, res: Response) => {
    try {
        const docType = req.params.documentType
        const storeId = req.params.storeId
        
        const storeData = await findMultipleStoreData({store: storeId, documentType: docType})
        if(!storeData) {
            return response.notFound(res, {message: 'item not found'})
        }

        const timeStamp = `${new Date().toDateString()} - ${new Date().toLocaleTimeString()}`
        const fileName = `nadabake ${docType}s exported ${timeStamp}.pdf`
        const pdfDoc = new PDFDocument();
        pdfDoc.pipe(fs.createWriteStream(fileName));
    
        // Customize your PDF content based on your data
        storeData?.data?.forEach((item: any) => {
            pdfDoc.text(`Transaction reference: ${item.document.transactionReference}`);
            pdfDoc.text(`Order: ${item.order.document.orderAlias}`);
            pdfDoc.text(`Order items: ${item.order.document.orderAlias}`);
            pdfDoc.text('------------------------');
        });

        // "transaction reference": item.transactionReference,
        // order: item.order.document.orderAlias,
        // "order items": orderItems(item.order.document),
        // channel: item.channel,
        // "received by": item.receivedBy.name,
        // amount: item.amount,
        // "time stamp": `${new Date(item?.dateCreated).toDateString()} - ${new Date(item?.dateCreated).toLocaleTimeString()}`

        pdfDoc.end(); 
        res.sendFile(fileName, { root: __dirname }); 
    } catch (error) {
        console.error(error);
        return response.error(res, error)
    }
  }

export const exportDataToCsvHandler = async (req: Request, res: Response) => {
    try {
        const docType = req.params.documentType
        const storeId = req.params.storeId
        
        const storeData = await findMultipleStoreData({store: storeId, documentType: docType})
        if(!storeData) {
            return response.notFound(res, {message: 'item not found'})
        }

        let data: any = []

        if(docType === 'payment') {
            data = returnDocuments(storeData?.data).map((item: any) => {
                return {
                    "transaction reference": item.transactionReference,
                    order: item?.order?.document?.orderAlias || '',
                    "order items": orderItems(item.order.document),
                    channel: item.channel,
                    "received by": item.receivedBy.name,
                    amount: item.amount,
                    "time stamp": `${new Date(item?.dateCreated).toDateString()} - ${new Date(item?.dateCreated).toLocaleTimeString()}`
                }
            });
        }
        const csvString = Papa.unparse(data, { header: true });

        res.setHeader('Content-Disposition', 'attachment; filename=output.csv');
        res.setHeader('Content-Type', 'text/csv');
        res.status(200).send(csvString);
    } catch (error) {
        console.error(error);
        return response.error(res, error)
    }
}

export const transformCategoriesHandler = async (req: Request, res: Response) => {
    try {
        const storeId = req.params.storeId
        
        const storeData = await findMultipleStoreData({
            store: storeId,
            documentType: 'item-category',
            $or: [
                { transformed: { $exists: false } }, // Does not have "transformed" key
                { transformed: false } // "transformed" is equal to false
            ]
        })
        
        let transformed = 0

        await Promise.all(storeData.data.map(async (item: any)=>{  
            // create the category
            await createCategory({
                store: storeId,
                name: item.document.name,
                description: item.document.description,
                type: item.document.type
            })
            // set a flag that shows it has been transformed
            await findAndUpdateStoreData({_id: item._id}, {transformed: true}, {new: true})
            transformed += 1
        }))
        
        // res.status(200).send(csvString);
        return response.ok(res, {
            message: `successfully transformed ${transformed} categories`,
        })
    } catch (error) {
        console.error(error);
        return response.error(res, error)
    }
}

export const transformStoreItemsHandler = async (req: Request, res: Response) => {
    try {
        const docType = req.params.documentType
        const storeId = req.params.storeId
        
        const storeData = await findMultipleStoreData({
            store: storeId,
            documentType: 'item',
            $or: [
                { transformed: { $exists: false } }, // Does not have "transformed" key
                { transformed: false } // "transformed" is equal to false
            ]
        })
        
        let transformed = 0

        await Promise.all(storeData.data.map(async (item: any)=>{  
            if(item.document.type === 'store') {
                // get the category
                let categoryId = null
                const category = await findCategory({name: item.document.category.name, type: item.document.category.type})
                if(category) {
                    categoryId = category._id
                }
                // create the item
                await createItem({
                    store: storeId,
                    sku: item.document.sku,
                    name: item.document.name,
                    category: categoryId,
                    description: item.document.description,
                    lowStockAlertCount: item.document.lowStockAlertCount,
                    type: item.document.type,
                    deleted: false,
                    stockUnit: item.document.stockUnit,
                    currentStock: item.document.currentStock,
                })
    
                await findAndUpdateStoreData({_id: item._id}, {transformed: true}, {new: true})
            }
            // set a flag that shows it has been transformed
            transformed += 1
        }))
        
        // res.status(200).send(csvString);
        return response.ok(res, {
            message: `successfully transformed ${transformed} store items`,
        })
    } catch (error) {
    console.error(error);
    return response.error(res, error)
    }
}

export const transformSaleItemsHandler = async (req: Request, res: Response) => {
    try {
        const docType = req.params.documentType
        const storeId = req.params.storeId
        
        const storeData = await findMultipleStoreData({
            store: storeId,
            documentType: 'item',
            $or: [
                { transformed: { $exists: false } }, // Does not have "transformed" key
                { transformed: false } // "transformed" is equal to false
            ]
        })
        
        let transformed = 0

        await Promise.all(storeData.data.map(async (item: any)=>{  
            if(item.document.type === 'sale') {
                // get the category
                let categoryId = null
                const category = await findCategory({name: item.document.category.name, type: item.document.category.type})
                if(category) {
                    categoryId = category._id
                }
                // create the item
                const newItem = await createItem({
                    store: storeId,
                    sku: item.document.sku,
                    name: item.document.name,
                    category: categoryId,
                    description: item.document.description,
                    lowStockAlertCount: item.document.lowStockAlertCount || 5,
                    type: item.document.type,
                    deleted: false,
                    stockUnit: item.document.stockUnit,
                    currentStock: item.document.currentStock,
                })
    
                // create the item variants and update the item variants array with each created variant
                // if (item.document.type === 'sale') {
                const createdVariants = []
                await Promise.all(item.document.variants.map(async (variant: any) => {
                    const newVariantPayload: any = {
                        item: newItem._id,
                        name: variant.name,
                        sku: variant.sku,
                        description: variant.description,
                        saleUnit: variant.saleUnit,
                        lowStockAlertCount: variant.lowStockAlertCount || 5,
                        currentStock: variant.currentStock,
                    }
                    const variantRecipeItems: any = []
                    variant.input.forEach(async(inputItem: any) => {
                        const recipeItem = await findItem({name: inputItem.name, type: 'store'})
                        let recipeItemId = recipeItem ? recipeItem._id : ''
                        newVariantPayload.recipe.push({
                            item: recipeItemId,
                            measure: inputItem.measure
                        })
                    })
                    newVariantPayload.recipe = variantRecipeItems
                    const newVariant = await createVariant(newVariantPayload)
                    createdVariants.push(newVariant._id)
                }))
                // } 
            }
            // set a flag that shows it has been transformed
            await findAndUpdateStoreData({_id: item._id}, {transformed: true}, {new: true})
            transformed += 1
        }))
        
        // res.status(200).send(csvString);
        return response.ok(res, {
            message: `successfully transformed ${transformed} items`,
        })
    } catch (error) {
    console.error(error);
    return response.error(res, error)
    }
}