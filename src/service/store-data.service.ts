import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import StoreData, { StoreDataDocument } from '../model/store-data.model';

export async function createStoreData (input: DocumentDefinition<StoreDataDocument>) {
    return StoreData.create(input)
}

export async function findMultipleStoreData(
    query: FilterQuery<StoreDataDocument>,
    perPage?: number,
    page?: number
) {
    let data = StoreData.find(query).lean().sort({ 'createdAt' : -1 })
    if(perPage && page) {
        data = StoreData.find(query).lean().sort({ 'createdAt' : -1 }).skip((perPage * page) - perPage)
    }
    
    return data
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