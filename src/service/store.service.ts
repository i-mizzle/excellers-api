import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import Store, { StoreDocument } from '../model/store.model';
import { UserDocument } from "../model/user.model";

// interface CreateTripInput {
//     createdBy: UserDocument["_id"];
//     title: string
//     description?: string
//     origin : OriginDestination
//     destination : OriginDestination
//     price: number,
//     lockDownPrice: number,
//     startDate: StringDate,
//     endDate: StringDate
// }

interface StoreInput {
    createdBy?: UserDocument['_id'];
    name: string;
    address: string;
    city: string;
    state: string;
}

export const createStore = async (
    input: StoreInput) => {
    try {
        const trip = await Store.create(input)

        return trip
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function findStores(
    query: FilterQuery<StoreDocument>,
    perPage: number,
    page: number,
    options: QueryOptions = { lean: true }
) {
    const total = await Store.find(query, {}, options).countDocuments()
    let stores = null
    if(perPage===0&&page===0){
        stores = await Store.find(query, {}, options)
    } else {
        stores = await Store.find(query, {}, options)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        stores
    }
}

export async function findStore(
    query: FilterQuery<StoreDocument>,
    options: QueryOptions = { lean: true }
) {
    try {
        const trip = await Store.findOne(query, {}, options)
        
        return trip
    } catch (error: any) {
        throw new Error(error)

    }
}

export async function findAndUpdateStore(
    query: FilterQuery<StoreDocument>,
    update: UpdateQuery<StoreDocument>,
    options: QueryOptions
) {

    try {
        return Store.findOneAndUpdate(query, update, options)
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: JSON.parse(error.error).message
        } 
    }
}