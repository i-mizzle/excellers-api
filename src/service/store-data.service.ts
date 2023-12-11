import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import StoreData, { StoreDataDocument } from '../model/store-data.model';

export async function createStoreData (input: DocumentDefinition<StoreDataDocument>) {
    return StoreData.create(input)
}

export async function findMultipleStoreData(
    query: FilterQuery<StoreDataDocument>,
    page?: number,
    perPage?: number,
) {
    let data = null
    const total = await StoreData.find(query).countDocuments()
    if(perPage && page) {
        data = await StoreData.find(query).lean()
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage)
    } else {
        data = await StoreData.find(query).lean().sort({ 'createdAt' : -1 })
    }
    
    return {
        total,
        data
    }

}

export async function findStoreData(
    query: FilterQuery<StoreDataDocument>,
    options: QueryOptions = { lean: true }
) {
    return StoreData.findOne(query, {}, options)
}

export async function findAndUpdateStoreData(
    query: FilterQuery<StoreDataDocument>,
    update: UpdateQuery<StoreDataDocument>,
    options: QueryOptions
) {
    return StoreData.findOneAndUpdate(query, update, options)
}

export async function deleteStoreData(
    query: FilterQuery<StoreDataDocument>
) {
    return StoreData.deleteOne(query)
}