import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import Price, { PriceDocument } from '../model/price.model';

export async function createPrice (input: DocumentDefinition<PriceDocument>) {
    return Price.create(input)
}

export async function findPrices(
    query: FilterQuery<PriceDocument>,
    options: QueryOptions = { lean: true }
) {
    return Price.find(query, {}, options)
}

export async function findPrice(
    query: FilterQuery<PriceDocument>,
    options: QueryOptions = { lean: true }
) {
    return Price.findOne(query, {}, options)
}

export async function findAndUpdatePrice(
    query: FilterQuery<PriceDocument>,
    update: UpdateQuery<PriceDocument>,
    options: QueryOptions
) {
    return Price.findOneAndUpdate(query, update, options)
}

export async function deletePrice(
    query: FilterQuery<PriceDocument>
) {
    return Price.deleteOne(query)
}