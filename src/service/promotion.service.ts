import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import Promotion, { PromotionDocument } from '../model/promotion.model';

export async function createPromotion (input: DocumentDefinition<PromotionDocument>) {
    return Promotion.create(input)
}

export async function findPromotions (
    query: FilterQuery<PromotionDocument>,
    perPage: number,
    page: number,
    options: QueryOptions = { lean: true },
    expand?: string,
) {
    const total = await Promotion.find(query, {}, options).countDocuments()
    let promotions = null
    if(perPage===0&&page===0){
        promotions = await Promotion.find(query, {}, options).populate(expand)
    } else {
        promotions = await Promotion.find(query, {}, options).populate(expand)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        promotions 
    }
}

export async function findPromotion (
    query: FilterQuery<PromotionDocument>,
    expand?: string,
    options: QueryOptions = { lean: true }
) {
    return Promotion.findOne(query, {}, options).populate(expand)
}

export async function findAndUpdatePromotion (
    query: FilterQuery<PromotionDocument>,
    update: UpdateQuery<PromotionDocument>,
    options: QueryOptions
) {
    return Promotion.findOneAndUpdate(query, update, options)
}

// export async function deletePromotion(
//     query: FilterQuery<PromotionDocument>
// ) {
//     return Promotion.deleteOne(query)
// }

