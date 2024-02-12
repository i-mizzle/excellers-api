import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";

export const checkoutHandler = async (req: Request, res: Response) => {
    try {
        // const userId = get(req, 'user._id');
        const body = req.body;

        return response.ok(res, {message: 'item updated successfully'});
    } catch (error) {
        return response.error(res, error);
    }
};