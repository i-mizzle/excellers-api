import { get } from 'lodash'
import { Request, Response, NextFunction, request } from 'express'
import * as response from "../responses/index";


const requiresAffiliateOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const user: any = get(req, 'user');
    if (!user || (user.userType !== 'AFFILIATE' && user.userType !== 'ADMIN' && user.userType !== 'SUPER_ADMINISTRATOR')) {
        return response.forbidden(res, { message: 'Sorry, you must be logged in as an affiliate or admin to access this resource' })
    }
    return next();
}

export default requiresAffiliateOrAdmin