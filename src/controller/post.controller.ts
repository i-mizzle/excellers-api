import { Request, Response } from "express";
import { get } from "lodash";
import { createPost, findPost, findAndUpdate, deletePost, findPosts } from "../service/post.service";
import * as response from '../responses'
import { getJsDate } from "../utils/utils";


const parsePostFilters = (query: any) => {
    const { published, createdBy, title, authorName, minDate, maxDate } = query; 

    const filters: any = {}; 

    if (authorName) {
        filters["author.name"] = { $in: authorName }; 
    }
  
    if (title) {
      filters.amount = title 
    }
  
    if (createdBy) {
      filters.createdBy = createdBy
    }
  
    if (published) {
      filters.published = published
    }
  
    if (minDate) {
      filters.created = { $gte: (getJsDate(minDate)) }; 
    }
  
    if (maxDate) {
      filters.created = { $lte: getJsDate(maxDate) }; 
    }

    return filters
}

export async function createPostHandler (req: Request, res: Response) {
    try {
        const userId = get(req, 'user._id')
        const body = req.body

        if(!body.excerpt || body.excerpt === '') {
            body.excerpt = body.body.substr(0, 250)
        }

        const post = await createPost({ ...body, user: userId })
        // return res.send(post)
        return response.created(res, post)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export async function updatePostHandler (req: Request, res: Response) {
    const postId = get(req, 'params.postId');
    // const userId = get(req, 'user._id');
    const update = req.body;

    const post = await findPost({ _id: postId });
    if (!post) {
        return response.notFound(res, { message: `post not found` })
    }
    // if (String(post.user) !== userId) {
    //     return response.conflict(res, { message: `Post with id: ${postId} was not created by you` })
    // }
    const updatedPost = await findAndUpdate({_id: postId }, update, { new: true })
    return response.ok(res, updatedPost)
}

export async function getPostsHandler(req: Request, res: Response) {
    const user: any = get(req, 'user')
    const queryObject: any = req.query;
    const filters = parsePostFilters(queryObject)
    const resPerPage = +queryObject.perPage || 25; // results per page
    const page = +queryObject.page || 1; // Page 

    let expand = queryObject.expand || null

    if(expand && expand.includes(',')) {
        expand = expand.split(',')
    }
    
    let postsQuery: any = {published: true, deleted: false}

    if(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMINISTRATOR' ) {
        postsQuery = {deleted: false}
    }
    
    const posts = await findPosts({...postsQuery, ...filters}, resPerPage, page, expand);

    const responseObject = {
        page,
        perPage: resPerPage,
        total: posts.total,
        posts: posts.posts
    }
    return response.ok(res, responseObject)

}

export async function getPostHandler (req: Request, res: Response) {
    const user: any = get(req, 'user')
    const postId = get(req, 'params.postId');

    let postsQuery: any = {_id: postId, published: true, deleted: false}

    if(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMINISTRATOR' ) {
        postsQuery = {_id: postId, deleted: false}
    }

    const post = await findPost(postsQuery);
    if(!post) {
        return response.notFound(res, { message: `post not found` })
    } 
    return response.ok(res, post)
}

export async function deletePostHandler (req: Request, res: Response) {
    const postId = get(req, 'params.postId');
    const userId = get(req, 'user._id');

    const post = await findPost({ _id: postId });
    if (!post) {
        return response.notFound(res, { message: `Post with id: ${postId} was not found` })
    }

    // if (String(post.user) !== userId) {
    //     return response.conflict(res, { message: `Post with id: ${postId} was not created by you` })
    // }

    // await deletePost({ postId });
    await findAndUpdate({_id: postId }, {deleted: true}, { new: true })
    return response.ok(res, {message: 'post deleted successfully'});
}