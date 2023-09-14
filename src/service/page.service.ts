import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import Page, { PageDocument } from '../model/page.model';

export async function createPage (input: DocumentDefinition<PageDocument>) {
    return Page.create(input)
}

export async function findPage(
    query: FilterQuery<PageDocument>,
    options: QueryOptions = { lean: true }
) {
    return Page.findOne(query, {}, options)
}

export async function findPages(
    query: FilterQuery<PageDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await Page.find(query, {}, options).countDocuments()
    const posts = await Page.find(query, {}, options).select('-body').populate(expand)
        .sort({ 'createdAt' : -1 })
        .skip((perPage * page) - perPage)
        .limit(perPage);
    return {
        total,
        pages: posts
    }
}

export async function findAndUpdatePage(
    query: FilterQuery<PageDocument>,
    update: UpdateQuery<PageDocument>,
    options: QueryOptions
) {
    return Page.findOneAndUpdate(query, update, options)
}

export async function deletePage(
    query: FilterQuery<PageDocument>
) {
    return Page.deleteOne(query)
}