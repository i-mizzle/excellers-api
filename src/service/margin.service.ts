import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import Margin, { MarginDocument } from '../model/margin.model';
import log from '../logger';

export async function createMargin (input: DocumentDefinition<MarginDocument>) {
    return Margin.create(input)
}

export async function findMargins(query: FilterQuery<MarginDocument>) {
    return Margin.find(query).lean();
}


export async function findMargin(
    query: FilterQuery<MarginDocument>,
    options: QueryOptions = { lean: true }
) {
    return Margin.findOne(query, {}, options)
}

export async function findAndUpdateMargin(
    query: FilterQuery<MarginDocument>,
    update: UpdateQuery<MarginDocument>,
    options: QueryOptions
) {
    return Margin.findOneAndUpdate(query, update, options)
}

export async function deleteMargin(
    query: FilterQuery<MarginDocument>
) {
    return Margin.deleteOne(query)
}

export const getMarginValue = async (flightType: string, flightPrice: number) => {
    try {
        const margin = await findMargin({flightType: flightType, active: true})
        // log.info('MARGIN -> -> ->') 
        // log.info(flightType)
        // log.info(flightPrice) 
        // log.info(margin)

        if(!margin) {
            return null
        }
        let marginValue = 0
        if (margin.marginType === 'PERCENTAGE') {
            marginValue = (margin.value/100) * flightPrice
        }
        if (margin.marginType === 'FLAT') {
            marginValue = margin.value/100
        }
        console.log('margin value ====== ', marginValue)
    
        return Math.trunc(marginValue)
    } catch (error) {
        log.error(error)
        return null
    }
}