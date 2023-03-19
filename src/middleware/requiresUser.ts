import { get } from 'lodash'
import { Request, Response, NextFunction, request } from 'express'
import * as response from "../responses/index";
import { findSession } from '../service/session.service';

const requiresUser = async (req: Request, res: Response, next: NextFunction) => {
    const user = get(req, 'user');

    if (!user || user['exp'] < (new Date()).getTime()/1000) {
        return response.forbidden(res, { message: 'Sorry, you must be logged in to access this resource' })
    }

    const session = await findSession({_id: user['session']})

    if(!session || session.valid === false) {
        return response.unAuthorized(res, { message: 'Sorry, your session is invalid, please log in again' })
    }

    return next();
}

export default requiresUser