import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { UserDocument } from "../model/user.model";
import { StringDate } from "../utils/types";
import { getJsDate } from "../utils/utils";
import GeneralDeal, { GeneralDealDocument } from "../model/general-deal.model";

interface CreateDealInput {
    createdBy: UserDocument['_id'];
    dealCode: string,
    originalPrice: number,
    dealPrice: string,
    title: string
    description: string,
    startDate: StringDate,
    endDate: StringDate
    active?: Boolean
}


export const createGeneralDeal = async (
    input: CreateDealInput) => {
        try {
        const deal = await GeneralDeal.create({...input, ...{
            startDate: getJsDate(input.startDate),
            endDate: getJsDate(input.endDate),
        }})
        return deal
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function findGeneralDeals(
    query: FilterQuery<GeneralDealDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await GeneralDeal.find(query, {}, options).countDocuments()
    let deals = null
    if(perPage===0&&page===0){
        deals = await GeneralDeal.find(query, {}, options).populate(expand)
    } else {
        deals = await GeneralDeal.find(query, {}, options).populate(expand)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    console.log(deals)

    return {
        total,
        deals
    }
}

export async function findGeneralDeal(
    query: FilterQuery<GeneralDealDocument>,
    expand?: string,
    options: QueryOptions = { lean: true },
) {
    try {
        const deal = await GeneralDeal.findOne(query, {}, options).populate(expand)
        
        return deal
    } catch (error: any) {
        throw new Error(error)

    }
}

export async function findAndUpdateGeneralDeal(
    query: FilterQuery<GeneralDealDocument>,
    update: UpdateQuery<GeneralDealDocument>,
    options: QueryOptions
) {

    try {
        return GeneralDeal.findOneAndUpdate(query, update, options)
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: JSON.parse(error.error).message
        } 
    }
}