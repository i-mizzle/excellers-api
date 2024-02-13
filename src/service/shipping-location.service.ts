import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import ShippingLocation, { ShippingLocationDocument } from '../model/shipping-location.model';


export async function createShippingLocation (input: DocumentDefinition<ShippingLocationDocument>) {
    return ShippingLocation.create(input)
}

export async function findShippingLocations(
    query: FilterQuery<ShippingLocationDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await ShippingLocation.find(query, {}, options).countDocuments()
    let locations = null
    if(perPage===0&&page===0){
        locations = await ShippingLocation.find(query, {}, options).populate(expand)
    } else {
        locations = await ShippingLocation.find(query, {}, options).populate(expand)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        locations 
    }
}

export async function findShippingLocation(
    query: FilterQuery<ShippingLocationDocument>,
    expand?: string,
    options: QueryOptions = { lean: true }
) {
    return ShippingLocation.findOne(query, {}, options).populate(expand)
}

export async function findAndUpdateShippingLocation(
    query: FilterQuery<ShippingLocationDocument>,
    update: UpdateQuery<ShippingLocationDocument>,
    options: QueryOptions
) {
    return ShippingLocation.findOneAndUpdate(query, update, options)
}