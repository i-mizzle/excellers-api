import { Request, Response } from "express";
import { get } from "lodash";
import * as response from '../responses'
import { createPrice, deletePrice, findAndUpdatePrice, findPrice, findPrices } from "../service/price.service";
import { slugify } from "../utils/utils";

export async function createPriceHandler (req: Request, res: Response) {
    const userId = get(req, 'user._id')
    const body = req.body



    const post = await createPrice({ ...body, ...{createdBy: userId, slug: slugify(body.item)} })
    // return res.send(post)
    return response.created(res, post)
}

export async function updatePriceHandler (req: Request, res: Response) {
    const postId = get(req, 'params.postId');
    const userId = get(req, 'user._id');
    const update = req.body;

    const post = await findPrice({ postId });
    if (!post) {
        return response.notFound(res, { message: `price was not found` })
    }
    const updatedPost = await findAndUpdatePrice({ postId }, update, { new: true })
    return response.ok(res, updatedPost)
}

export const getPricesHandler = async (req: Request, res: Response) => {
    try {
        
        const prices = await findPrices({})

        return response.ok(res, prices)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export async function getPriceHandler (req: Request, res: Response) {
    const priceId = get(req, 'params.priceId');
    const post = await findPrice({ _id: priceId });
    if(!post) {
        return response.notFound(res, { message: `price was not found` })
    } 
    return response.ok(res, post)
}

export async function deletePriceHandler (req: Request, res: Response) {
    const priceId = get(req, 'params.priceId');
    const userId = get(req, 'user._id');

    const post = await findPrice({ _id: priceId });
    if (!post) {
        return response.notFound(res, { message: `price not found` })
    }

    await deletePrice({ _id: priceId });
    return response.ok(res, {message: 'price deleted successfully'});
}