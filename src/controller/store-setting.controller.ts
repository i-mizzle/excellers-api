import { Request, Response } from "express";
import { get, omit } from "lodash";
import * as response from "../responses/index";
import log from "../logger";
import { createStoreSetting, findAndUpdateStoreSetting, findStoreSetting } from "../service/store-setting.service";
import { findStore } from "../service/store.service";


export const createUpdateStoreSettingHandler = async (req: Request, res: Response) => {
    try {
        const input = req.body
        // check if storeSetting exists
        const storeSetting = await findStoreSetting({store: input.store})
        let updated = null
        if(storeSetting) {
            updated = await findAndUpdateStoreSetting({_id: storeSetting._id}, input, {new: true})
        } else {
            updated = await createStoreSetting(input)
        }

        return response.ok(res, updated)
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export const findStoreSettingHandler = async (req: Request, res: Response) => {
    try {
        const storeId = req.params.storeId;
        const store = await findStore({_id: storeId})

        if(!store){
            return response.notFound(res, {message: 'store not found'})
        }
        const storeSetting = await findStoreSetting({store: storeId})

        if(!storeSetting) {
            return response.notFound(res, {message: 'store setting not found'})
        }

        return response.ok(res, {...storeSetting, ...{storeDetails: store}})
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

// export async function updateUserHandler (req: Request, res: Response) {
//     try {
//         const storeId = req.params.storeId;
//         const store = await findStore({_id: storeId})
//         const update = req.body

//         if(!store) {
//             return response.notFound(res, {message: 'Store not found'})
//         }
//         const updatedStore = await findAndUpdateStore({ _id: storeId }, update, { new: true })
//         return response.ok(res, updatedStore)
//     } catch (error: any) {
//         log.error(error)
//         return response.error(res, error)
//     }
// }