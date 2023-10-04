import { Request, Response } from "express";
import { get } from "lodash";
import * as response from '../responses'
import { PostMeta, getJsDate, getPostMeta, slugify } from "../utils/utils";
import { createPage, findAndUpdatePage, findPage, findPages } from "../service/page.service";


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

export async function createPageHandler (req: Request, res: Response) {
    try {
        const userId = get(req, 'user._id')
        const body = req.body

        body.slug = slugify(body.title) + '-' + (new Date()).getTime()

        const meta: PostMeta = getPostMeta(body.body) 

        const post = await createPage({ ...body, ...{user: userId, meta} })
        // return res.send(post)
        return response.created(res, post)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export async function updatePageHandler (req: Request, res: Response) {
    const pageId = get(req, 'params.pageId');
    // const userId = get(req, 'user._id');
    const update = req.body;

    const page = await findPage({ _id: pageId });
    if (!page) {
        return response.notFound(res, { message: `page not found` })
    }
    // if (String(post.user) !== userId) {
    //     return response.conflict(res, { message: `Post with id: ${postId} was not created by you` })
    // }
    const updatedPage = await findAndUpdatePage({_id: pageId }, update, { new: true })
    return response.ok(res, updatedPage)
}

export async function getPagesHandler(req: Request, res: Response) {
    const user: any = get(req, 'user')
    const queryObject: any = req.query;
    const filters = parsePostFilters(queryObject)
    const resPerPage = +queryObject.perPage || 25; // results per page
    const page = +queryObject.page || 1; // Page 

    let expand = queryObject.expand || null

    if(expand && expand.includes(',')) {
        expand = expand.split(',')
    }
    
    let pagesQuery: any = {published: true, deleted: false}

    if(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMINISTRATOR' ) {
        pagesQuery = {deleted: false}
    }
    
    const posts = await findPages({...pagesQuery, ...filters}, resPerPage, page, expand);

    const responseObject = {
        page,
        perPage: resPerPage,
        total: posts.total,
        pages: posts.pages
    }
    return response.ok(res, responseObject)

}

export async function getPageHandler (req: Request, res: Response) {
    const user: any = get(req, 'user')
    const pageId = get(req, 'params.pageId');

    const ObjectId = require('mongoose').Types.ObjectId;

    let page = null
    let pagesQuery: any = {_id: pageId, published: true, deleted: false}

    if(!ObjectId.isValid(pageId)) {
        pagesQuery = {slug: pageId, published: true, deleted: false}
    } 

    if(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMINISTRATOR' && !ObjectId.isValid(pageId)) {
        pagesQuery = {slug: pageId, deleted: false}
    }

    if(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMINISTRATOR' && ObjectId.isValid(pageId)) {
        pagesQuery = {_id: pageId, deleted: false}
    }

    console.log(pagesQuery)

    page = await findPage(pagesQuery);
    if(!page) {
        return response.notFound(res, { message: `page not found` })
    } 
    return response.ok(res, page)
}

export async function getPageByTypeHandler (req: Request, res: Response) {
    const user: any = get(req, 'user')
    const pageId = get(req, 'params.type');

    const pagesQuery = {type: pageId, deleted: false}

    console.log(pagesQuery)

    const page = await findPage(pagesQuery);
    if(!page) {
        return response.notFound(res, { message: `page not found` })
    } 
    return response.ok(res, page)
}

export async function deletePageHandler (req: Request, res: Response) {
    const pageId = get(req, 'params.pageId');
    const userId = get(req, 'user._id');

    const page = await findPage({ _id: pageId });
    if (!page) {
        return response.notFound(res, { message: `page with id: ${pageId} was not found` })
    }

    // if (String(post.user) !== userId) {
    //     return response.conflict(res, { message: `Post with id: ${postId} was not created by you` })
    // }

    // await deletePost({ postId });
    await findAndUpdatePage({_id: pageId }, {deleted: true}, { new: true })
    return response.ok(res, {message: 'page deleted successfully'});
}
