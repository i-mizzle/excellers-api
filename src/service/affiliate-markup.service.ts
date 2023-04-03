import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose"
import AffiliateMarkup, { AffiliateMarkupDocument } from "../model/affiliate-markup.model"
import { UserDocument } from "../model/user.model"

interface AffiliateMarkupInput {
    markupType: string
    markup: number
    approvedBy: UserDocument["_id"]
    user: UserDocument["_id"]
}

export const createAffiliateMarkup = async (input: AffiliateMarkupInput) => {
    try {
        const affiliateMarkup = await AffiliateMarkup.create(input)
        return affiliateMarkup
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function findAffiliateMarkup(
    query: FilterQuery<AffiliateMarkupDocument>,
    options: QueryOptions = { lean: true }
) {
    try {
        const markup = await AffiliateMarkup.findOne(query, {}, options)
        
        return markup
    } catch (error: any) {
        throw new Error(error)

    }
}

export async function findAndUpdateAffiliateMarkup(
    query: FilterQuery<AffiliateMarkupDocument>,
    update: UpdateQuery<AffiliateMarkupDocument>,
    options: QueryOptions
) {

    try {
        return AffiliateMarkup.findOneAndUpdate(query, update, options)
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: JSON.parse(error.error).message
        } 
    }
}