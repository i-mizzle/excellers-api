import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import Banner, { BannerDocument } from '../model/banner.model';

export async function createBanner (input: DocumentDefinition<BannerDocument>) {
    return Banner.create(input)
}

export async function findBanner(
    query: FilterQuery<BannerDocument>,
    options: QueryOptions = { lean: true }
) {
    return Banner.findOne(query, {}, options)
}

export async function findBanners(
    query: FilterQuery<BannerDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await Banner.find(query, {}, options).countDocuments()
    const banners = await Banner.find(query, {}, options).select('-body').populate(expand)
        .sort({ 'createdAt' : -1 })
        .skip((perPage * page) - perPage)
        .limit(perPage);
    return {
        total,
        banners: banners
    }
}

export async function findAndUpdateBanner(
    query: FilterQuery<BannerDocument>,
    update: UpdateQuery<BannerDocument>,
    options: QueryOptions
) {
    return Banner.findOneAndUpdate(query, update, options)
}

export async function deleteBanner(
    query: FilterQuery<BannerDocument>
) {
    return Banner.deleteOne(query)
}