import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { createStoreData, findAndUpdateStoreData, findMultipleStoreData, findStoreData } from "../service/store-data.service";

export const pushDataHandler = async (req: Request, res: Response) => {
    try {
        // const userId = get(req, 'user._id');
        const body = req.body

        await Promise.all(body.data.map(async (item: any) => {
            console.log('items in map => => ', item)
            const existingItem = await findStoreData({localId: item.id})
            if(existingItem && existingItem.document !== item.doc) {
                findAndUpdateStoreData({_id: existingItem._id}, {document: item.doc}, {new: true})
            } else {
                createStoreData({
                    localId: item.id,
                    document: item.doc
                })
            }
        }))

        return response.ok(res, {message: 'store data pushed successfully'}) 
    } catch (error: any) {
        return response.error(res, error)
    }
}

export const pullDataHandler = async (req: Request, res: Response) => {
    try {
        // const userId = get(req, 'user._id');
        const storeData = await findMultipleStoreData({})
        return response.ok(res, {
            message: 'store data pulled successfully', 
            data: storeData
        }) 
    } catch (error: any) {
        return response.error(res, error)
    }
}