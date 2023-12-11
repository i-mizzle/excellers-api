import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import StoreSetting, { StoreSettingDocument } from "../model/store-setting.model"; 

export const createStoreSetting = async (
    input: StoreSettingDocument
) => {
    try {
        const setting = await StoreSetting.create(input)

        return setting
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function findStoreSetting(
    query: FilterQuery<StoreSettingDocument>,
    options: QueryOptions = { lean: true }
) {
    try {
        const trip = await StoreSetting.findOne(query, {}, options)
        
        return trip
    } catch (error: any) {
        throw new Error(error)

    }
}

export async function findAndUpdateStoreSetting(
    query: FilterQuery<StoreSettingDocument>,
    update: UpdateQuery<StoreSettingDocument>,
    options: QueryOptions
) {

    try {
        return StoreSetting.findOneAndUpdate(query, update, options)
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: JSON.parse(error.error).message
        } 
    }
}