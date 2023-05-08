import { Request, Response } from "express";
import { get } from "lodash";
import * as response from '../responses'
import { getJsDate } from "../utils/utils";
import { createPostComment, findAndUpdatePostComment, findPostComment, findPostComments } from "../service/post-comment.service";

export async function createPostCommentHandler (req: Request, res: Response) {
    try {
        const postId = get(req, 'params.postId');
        const user: any = get(req, 'user')

        const body = req.body
        if(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMINISTRATOR' ) {
            body.adminComment = true
        } else {
            body.adminComment = false
        }

        const postComment = await createPostComment({...body, ...{post: postId}})
        return response.created(res, postComment)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export async function publishPostCommentHandler (req: Request, res: Response) {
    const postCommentId = get(req, 'params.postCommentId');

    const post = await findPostComment({ _id: postCommentId });
    if (!post) {
        return response.notFound(res, { message: `post comment not found` })
    }

    const updatedPost = await findAndUpdatePostComment({_id: postCommentId }, {published: true}, { new: true })
    return response.ok(res, updatedPost)
}

export async function getPostCommentsHandler(req: Request, res: Response) {
    const postId = get(req, 'params.postId');
    const user: any = get(req, 'user')
    const queryObject: any = req.query;
    const resPerPage = +queryObject.perPage || 25; // results per page
    const page = +queryObject.page || 1; // Page 

    let expand = queryObject.expand || null

    if(expand && expand.includes(',')) {
        expand = expand.split(',')
    }
    
    let postCommentsQuery: any = {post: postId, published: true, deleted: false}

    if(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMINISTRATOR' ) {
        postCommentsQuery = {post: postId, deleted: false}
    }
    
    const postComments = await findPostComments(postCommentsQuery, expand);

    const responseObject = {
        total: postComments.total,
        comments: postComments.comments
    }
    return response.ok(res, responseObject)

}

export async function deletePostCommentHandler (req: Request, res: Response) {
    const postCommentId = get(req, 'params.postCommentId');
    const userId = get(req, 'user._id');

    const comment = await findPostComment({ _id: postCommentId });
    if (!comment) {
        return response.notFound(res, { message: `comment not found` })
    }

    // if (String(post.user) !== userId) {
    //     return response.conflict(res, { message: `Post with id: ${postId} was not created by you` })
    // }

    // await deletePost({ postId });
    await findAndUpdatePostComment({_id: postCommentId }, {deleted: true}, { new: true })
    return response.ok(res, {message: 'comment deleted successfully'});
}