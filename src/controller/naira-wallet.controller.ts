import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";

export const transferFromWalletHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body

        // const enquiry = await createEnquiry({...body, ...{createdBy: userId}})
        // return response.created(res, enquiry)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getWalletBalanceHandler = async (req: Request, res: Response) => {
    try {
        
    } catch (error:any) {
        return response.error(res, error)
    }
}