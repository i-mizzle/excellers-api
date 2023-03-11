import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import LimitProfile, { LimitProfileDocument } from '../model/limit-profile.model';

export async function createLimitProfile (input: DocumentDefinition<LimitProfileDocument>) {
    try {
        return LimitProfile.create(input)
    } catch (error: any) {
        throw new Error(error);
    }
}

export async function findLimitProfile(
    query: FilterQuery<LimitProfileDocument>,
    options: QueryOptions = { lean: true }
) {
    return LimitProfile.findOne(query, {}, options)
}

export async function findAllLimitProfiles(
    perPage: number,
    page: number,
    options: QueryOptions = { lean: true }
) {
    const total = await LimitProfile.find().countDocuments()
    const limitProfiles = await LimitProfile.find({}, {}, options)
        .skip((perPage * page) - perPage)
        .limit(perPage)

    return {
        total,
        data: limitProfiles
    }
}

export async function findAndUpdate(
    query: FilterQuery<LimitProfileDocument>,
    update: UpdateQuery<LimitProfileDocument>,
    options: QueryOptions
) {
    return LimitProfile.findOneAndUpdate(query, update, options)
}
