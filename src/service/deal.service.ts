import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import Deal, { DealDocument } from "../model/deal.model";
import { UserDocument } from "../model/user.model";
import { StringDate } from "../utils/types";
import { generateCode, getJsDate } from "../utils/utils";
import mongoose from "mongoose";

interface CreateDealInput {
    createdBy: UserDocument['_id'];
    dealItemType: string,
    dealItem: mongoose.Document['_id'],
    discountValue: number,
    discountType: string,
    title: string
    description: string,
    startDate: StringDate,
    endDate: StringDate
    active?: Boolean
}


export const createDeal = async (
    input: CreateDealInput) => {
        try {
        const deal = await Deal.create({
            createdBy: input.createdBy,
            title: input.title,
            description: input.description,
            dealItemType: input.dealItemType,
            dealItem:input.dealItem,
            discountValue: input.discountValue,
            discountType: input.discountType,
            startDate: getJsDate(input.startDate),
            endDate: getJsDate(input.endDate),
            active: input.active || true
        })
        return deal
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function findDeals(
    query: FilterQuery<DealDocument>,
    perPage: number,
    page: number,
    options: QueryOptions = { lean: true }
) {
    const total = await Deal.find(query, {}, options).countDocuments()
    let deals = null
    if(perPage===0&&page===0){
        deals = await Deal.find(query, {}, options)
    } else {
        deals = await Deal.find(query, {}, options)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        deals
    }
}

export async function findDeal(
    query: FilterQuery<DealDocument>,
    options: QueryOptions = { lean: true }
) {
    try {
        const deal = await Deal.findOne(query, {}, options)
        
        return deal
    } catch (error: any) {
        throw new Error(error)

    }
}

export async function findAndUpdateDeal(
    query: FilterQuery<DealDocument>,
    update: UpdateQuery<DealDocument>,
    options: QueryOptions
) {

    try {
        return Deal.findOneAndUpdate(query, update, options)
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: JSON.parse(error.error).message
        } 
    }
}