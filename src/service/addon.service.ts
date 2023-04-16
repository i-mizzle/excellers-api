import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { UserDocument } from "../model/user.model";
import { StringDate } from "../utils/types";
import { generateCode, getJsDate } from "../utils/utils";
import mongoose from "mongoose";
import Addon, { AddonDocument } from "../model/addon.model";

interface CreateAddonInput {
    createdBy: UserDocument['_id'];
    price: number,
    name: string
    description?: string,
}


export const createAddon = async (
    input: CreateAddonInput) => {
        try {
        const addon = await Addon.create(input)
        return addon
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function findAddons(
    query: FilterQuery<AddonDocument>,
    perPage: number,
    page: number,
    options: QueryOptions = { lean: true }
) {
    const total = await Addon.find(query, {}, options).countDocuments()
    let addons = null
    if(perPage===0&&page===0){
        addons = await Addon.find(query, {}, options)
    } else {
        addons = await Addon.find(query, {}, options)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        addons
    }
}

export async function findAddon(
    query: FilterQuery<AddonDocument>,
    options: QueryOptions = { lean: true }
) {
    try {
        const addon = await Addon.findOne(query, {}, options)
        
        return addon
    } catch (error: any) {
        throw new Error(error)

    }
}

export async function findAndUpdateAddon(
    query: FilterQuery<AddonDocument>,
    update: UpdateQuery<AddonDocument>,
    options: QueryOptions
) {

    try {
        return Addon.findOneAndUpdate(query, update, options)
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: JSON.parse(error.error).message
        } 
    }
}