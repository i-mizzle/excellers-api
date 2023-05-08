import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import Post, { PostDocument } from '../model/post.model';

export async function createPost (input: DocumentDefinition<PostDocument>) {
    return Post.create(input)
}

export async function findPost(
    query: FilterQuery<PostDocument>,
    options: QueryOptions = { lean: true }
) {
    return Post.findOne(query, {}, options)
}

export async function findPosts(
    query: FilterQuery<PostDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await Post.find(query, {}, options).countDocuments()
    const posts = await Post.find(query, {}, options).select('-body').populate(expand)
        .sort({ 'createdAt' : -1 })
        .skip((perPage * page) - perPage)
        .limit(perPage);
    return {
        total,
        posts: posts
    }
}

export async function findAndUpdate(
    query: FilterQuery<PostDocument>,
    update: UpdateQuery<PostDocument>,
    options: QueryOptions
) {
    return Post.findOneAndUpdate(query, update, options)
}

export async function deletePost(
    query: FilterQuery<PostDocument>
) {
    return Post.deleteOne(query)
}