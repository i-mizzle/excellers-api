import { Request, Response } from "express";
import { get, omit } from "lodash";
import * as response from "../responses/index";
import log from "../logger";
import { createStore, findAndUpdateStore, findStore } from "../service/store.service";

export const createStoreHandler = async (req: Request, res: Response) => {
    try {
        const input = req.body
        const store = await createStore(input)

        return response.created(res, store)
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export const getStoreDetailsHandler = async (req: Request, res: Response) => {
    try {
        const storeId = req.params.storeId;
        const store = await findStore({_id: storeId})

        if(!store) {
            return response.notFound(res, {message: 'Store not found'})
        }

        return response.ok(res, store)
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function updateUserHandler (req: Request, res: Response) {
    try {
        const storeId = req.params.storeId;
        const store = await findStore({_id: storeId})
        const update = req.body

        if(!store) {
            return response.notFound(res, {message: 'Store not found'})
        }
        const updatedStore = await findAndUpdateStore({ _id: storeId }, update, { new: true })
        return response.ok(res, updatedStore)
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}