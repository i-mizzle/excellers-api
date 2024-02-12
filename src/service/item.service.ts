import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import Item, { ItemDocument } from '../model/item.model';

export async function createItem (input: DocumentDefinition<ItemDocument>) {
    return Item.create(input)
}

export async function findItems(
    query: FilterQuery<ItemDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await Item.find(query, {}, options).countDocuments()
    let enquiries = null
    if(perPage===0&&page===0){
        enquiries = await Item.find(query, {}, options).populate(expand)
    } else {
        enquiries = await Item.find(query, {}, options).populate(expand)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        enquiries 
    }
}

export async function findItem(
    query: FilterQuery<ItemDocument>,
    expand?: string,
    options: QueryOptions = { lean: true }
) {
    return Item.findOne(query, {}, options).populate(expand)
}

export async function findAndUpdateItem(
    query: FilterQuery<ItemDocument>,
    update: UpdateQuery<ItemDocument>,
    options: QueryOptions
) {
    return Item.findOneAndUpdate(query, update, options)
}