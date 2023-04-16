import { Request, Response } from "express";
import  * as response from "../responses"
import { get } from 'lodash'
import { createAddon, findAddon, findAddons, findAndUpdateAddon } from "../service/addon.service";

export const createAddonHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body

        const addon = await createAddon({...body, ...{createdBy: userId}})
        return response.created(res, addon)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getAddonsHandler = async (req: Request, res: Response) => {
    try { 
        const queryObject: any = req.query;
        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 

        const addons = await findAddons( {deleted: false}, resPerPage, page)
        // return res.send(post)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: addons.total,
            addons: addons.addons
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getAddonHandler = async (req: Request, res: Response) => {
    try {
        const addonId = get(req, 'params.addonId');

        const addon = await findAddon({_id: addonId, deleted: false})
        // return res.send(post)

        if(!addon) {
            return response.notFound(res, {message: 'addon not found'})
        }

        return response.ok(res, addon)
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updateAddonHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const addonId = get(req, 'params.addonId');

        let update = req.body

        const addon = await findAddon({_id: addonId})
        if(!addon) {
            return response.notFound(res, {message: 'addon not found'})
        }

        await findAndUpdateAddon({_id: addon._id}, update, {new: true})

        return response.ok(res, {message: 'addon updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deleteAddonHandler = async (req: Request, res: Response) => {
    try {
        const addonId = get(req, 'params.addonId');

        const addon = await findAddon({_id: addonId})
        if(!addon) {
            return response.notFound(res, {message: 'addon not found'})
        }

        await findAndUpdateAddon({_id: addon._id}, {deleted: true}, {new: true})

        return response.ok(res, {message: 'addon deleted successfully'})
        
        
    } catch (error:any) {
        return response.error(res, error)
    }
}