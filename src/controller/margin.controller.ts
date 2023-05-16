import { Request, Response } from "express";
import { get } from "lodash";
import * as response from '../responses'
import { slugify } from "../utils/utils";
import { createMargin, findAndUpdateMargin, findMargin, findMargins } from "../service/margin.service";


export async function createMarginHandler (req: Request, res: Response) {
    try {;
        const user: any = get(req, 'user')
        const body = req.body
        const marginSlug = slugify(body.name)
        const existingMargin = await findMargin({active: true, flightType: body.flightType})

        if(existingMargin){
            return response.conflict(res, {message: `an active margin already exists for ${body.flightType} flights, deactivate it first, before creating a new margin for the same item`})
        }

        const margin = await createMargin({...body, ...{createdBy: user._id, slug: marginSlug}})
        return response.created(res, margin)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export async function getMarginsHandler(req: Request, res: Response) {

    const user: any = get(req, 'user')
    
    let marginsQuery: any = {active: true}

    if(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMINISTRATOR' ) {
        marginsQuery = {}
    }
    
    const margins = await findMargins(marginsQuery);

    return response.ok(res, {margins})

}

export async function updateMarginHandler (req: Request, res: Response) {
    const marginId = get(req, 'params.marginId');
    const userId = get(req, 'user._id');

    const margin = await findMargin({ _id: marginId });
    if (!margin) {
        return response.notFound(res, { message: `comment not found` })
    }
    await findAndUpdateMargin({_id: margin }, req.body, { new: true })
    return response.ok(res, {message: 'margin updated successfully'});
}