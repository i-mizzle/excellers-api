import { get } from 'lodash'
import { Request, Response, NextFunction, request } from 'express'
import * as response from "../responses/index";


const requiresAdministrator = async (req: Request, res: Response, next: NextFunction) => {
    const user: any = get(req, 'user');
    if (!user || (user.userType !== 'ADMIN' && user.userType !== 'SUPER_ADMINISTRATOR')) {
        return response.forbidden(res, { message: 'Sorry, you must be logged in as a system administrator to access this resource' })
    }
    return next();
}

export default requiresAdministrator