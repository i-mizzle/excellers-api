import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import PostComment, { PostCommentDocument } from '../model/post-comment.model';

export async function createPostComment (input: DocumentDefinition<PostCommentDocument>) {
    return PostComment.create(input)
}

export async function findPostComment(
    query: FilterQuery<PostCommentDocument>,
    options: QueryOptions = { lean: true }
) {
    return PostComment.findOne(query, {}, options)
}

export async function findPostComments(
    query: FilterQuery<PostCommentDocument>,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await PostComment.find(query, {}, options).countDocuments()
    const postComments = await PostComment.find(query, {}, options).select('-body').populate(expand)
        .sort({ 'createdAt' : -1 })
    return {
        total,
        comments: postComments
    }
}

export async function findAndUpdatePostComment(
    query: FilterQuery<PostCommentDocument>,
    update: UpdateQuery<PostCommentDocument>,
    options: QueryOptions
) {
    return PostComment.findOneAndUpdate(query, update, options)
}

// export async function deletePost(
//     query: FilterQuery<PostDocument>
// ) {
//     return Post.deleteOne(query)
// }