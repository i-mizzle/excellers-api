import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import StoreData, { StoreDataDocument } from '../model/store-data.model';

export async function createStoreData (input: DocumentDefinition<StoreDataDocument>) {
    return StoreData.create(input)
}

export async function findMultipleStoreData(query: FilterQuery<StoreDataDocument>) {
    return StoreData.find(query).lean();
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