import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { UserDocument } from "../model/user.model";
import { StringDate } from "../utils/types";
import { getJsDate } from "../utils/utils";
import PackageDeal, { PackageDealDocument } from "../model/package-deal.model";
import { PackageDocument } from "../model/package.model";

interface CreateDealInput {
    createdBy: UserDocument['_id'];
    dealItemType: string,
    dealCode: string,
    package: PackageDocument['_id'],
    discountValue: number,
    discountType: string,
    title: string
    description: string,
    startDate: StringDate,
    endDate: StringDate
    active?: Boolean
}


export const createPackageDeal = async (
    input: CreateDealInput) => {
        try {
        const deal = await PackageDeal.create({
            createdBy: input.createdBy,
            title: input.title,
            description: input.description,
            package:input.package,
            dealCode: input.dealCode,
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

export async function findPackageDeals(
    query: FilterQuery<PackageDealDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await PackageDeal.find(query, {}, options).countDocuments()
    let deals = null
    if(perPage===0&&page===0){
        deals = await PackageDeal.find(query, {}, options).populate(expand)
    } else {
        deals = await PackageDeal.find(query, {}, options).populate(expand)
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

export async function findPackageDeal(
    query: FilterQuery<PackageDealDocument>,
    expand: string,
    options: QueryOptions = { lean: true },
) {
    try {
        const deal = await PackageDeal.findOne(query, {}, options).populate(expand)
        
        return deal
    } catch (error: any) {
        throw new Error(error)

    }
}

export async function findAndUpdatePackageDeal(
    query: FilterQuery<PackageDealDocument>,
    update: UpdateQuery<PackageDealDocument>,
    options: QueryOptions
) {

    try {
        return PackageDeal.findOneAndUpdate(query, update, options)
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: JSON.parse(error.error).message
        } 
    }
}