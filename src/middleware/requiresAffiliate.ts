import { get } from 'lodash'
import { Request, Response, NextFunction, request } from 'express'
import * as response from "../responses/index";


const requiresAffiliate = async (req: Request, res: Response, next: NextFunction) => {
    const user: any = get(req, 'user');
    if (!user || (user.userType !== 'AFFILIATE')) {
        return response.forbidden(res, { message: 'Sorry, you must be logged in as an affiliate to access this resource' })
    }
    return next();
}

export default requiresAffiliate