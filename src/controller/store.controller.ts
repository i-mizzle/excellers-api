import { Request, Response } from "express";
import { get, omit } from "lodash";
import * as response from "../responses/index";
import log from "../logger";
import { createStore, findAndUpdateStore, findStore, findStores } from "../service/store.service";
import { findAndUpdateUser, findUser } from "../service/user.service";

export const createStoreHandler = async (req: Request, res: Response) => {
    try {
        const input = req.body
        const store = await createStore(input)
        const creator = await findUser({_id: store.createdBy})

        if(creator && (!creator.store || creator.store === '')) {
            const storeId = store._id
            await findAndUpdateUser({_id: creator._id}, {store: storeId}, {new: true})
        }

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

export const getStoresHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        // const filters = parseOrderFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; 
        const page = +queryObject.page || 1; 
        let expand = queryObject.expand || null

        const stores = await findStores({}, resPerPage, page, expand)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: stores.total,
            stores: stores.stores
        }

        return response.ok(res, responseObject)
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