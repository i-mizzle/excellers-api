import { Request, Response } from "express";
import * as response from "../responses/index";
import { getWalletBalance } from "../service/integrations/tiqwa.service";

export const getTiqwaWalletBalanceHandler = async (req: Request, res: Response) => {
    try {
        const balance = await getWalletBalance()
        // return res.send(post)

        if(!balance) {
            return response.notFound(res, {message: 'could not fetch balance'})
        }

        if(balance.error) {
            return response.handleErrorResponse(res, balance)
        }

        return response.ok(res, balance.data)
        
    } catch (error:any) {
        return response.error(res, error)
    }
}