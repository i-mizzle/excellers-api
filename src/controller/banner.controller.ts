import { Request, Response } from "express";
import { get } from "lodash";
import * as response from '../responses'
import { PostMeta, getJsDate, getPostMeta, slugify } from "../utils/utils";
import { createBanner, findAndUpdateBanner, findBanner, findBanners } from "../service/banner.service";


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

export async function createBannerHandler (req: Request, res: Response) {
    try {
        const userId = get(req, 'user._id')
        const body = req.body

        body.slug = slugify(body.title) + '-' + (new Date()).getTime()

        const banner = await createBanner({ ...body, ...{user: userId} })
        // return res.send(post)
        return response.created(res, banner)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export async function updateBannerHandler (req: Request, res: Response) {
    const bannerId = get(req, 'params.bannerId');
    // const userId = get(req, 'user._id');
    const update = req.body;

    const banner = await findBanner({ _id: bannerId });
    if (!banner) {
        return response.notFound(res, { message: `banner not found` })
    }
    // if (String(post.user) !== userId) {
    //     return response.conflict(res, { message: `Post with id: ${postId} was not created by you` })
    // }
    const updatedPage = await findAndUpdateBanner({_id: bannerId }, update, { new: true })
    return response.ok(res, updatedPage)
}

export async function getBannersHandler(req: Request, res: Response) {
    const user: any = get(req, 'user')
    const queryObject: any = req.query;
    const filters = parsePostFilters(queryObject)
    const resPerPage = +queryObject.perPage || 25; // results per page
    const page = +queryObject.page || 1; // Page 

    let expand = queryObject.expand || null

    if(expand && expand.includes(',')) {
        expand = expand.split(',')
    }
    
    let bannersQuery: any = {published: true, deleted: false}

    if(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMINISTRATOR' ) {
        bannersQuery = {deleted: false}
    }
    
    const banners = await findBanners({...bannersQuery, ...filters}, resPerPage, page, expand);

    const responseObject = {
        page,
        perPage: resPerPage,
        total: banners.total,
        banners: banners.banners
    }
    return response.ok(res, responseObject)

}

export async function getBannerHandler (req: Request, res: Response) {
    const user: any = get(req, 'user')
    const bannerId = get(req, 'params.bannerId');

    const ObjectId = require('mongoose').Types.ObjectId;

    let banner = null
    let bannersQuery: any = {_id: bannerId, published: true, deleted: false}

    if(!ObjectId.isValid(bannerId)) {
        bannersQuery = {slug: bannerId, published: true, deleted: false}
    } 

    if(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMINISTRATOR' && !ObjectId.isValid(bannerId)) {
        bannersQuery = {slug: bannerId, deleted: false}
    }

    if(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMINISTRATOR' && ObjectId.isValid(bannerId)) {
        bannersQuery = {_id: bannerId, deleted: false}
    }

    console.log(bannersQuery)

    banner = await findBanner(bannersQuery);
    if(!banner) {
        return response.notFound(res, { message: `banner not found` })
    } 
    return response.ok(res, banner)
}

export async function deleteBannerHandler (req: Request, res: Response) {
    const bannerId = get(req, 'params.bannerId');
    const userId = get(req, 'user._id');

    const page = await findBanner({ _id: bannerId });
    if (!page) {
        return response.notFound(res, { message: `banner with id: ${bannerId} was not found` })
    }

    // if (String(post.user) !== userId) {
    //     return response.conflict(res, { message: `Post with id: ${postId} was not created by you` })
    // }

    // await deletePost({ postId });
    await findAndUpdateBanner({_id: bannerId }, {deleted: true}, { new: true })
    return response.ok(res, {message: 'banner deleted successfully'});
}
