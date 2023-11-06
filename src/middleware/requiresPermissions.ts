import { AnySchema } from "yup";
import { Request, Response, NextFunction } from "express";
import log from '../logger'
import * as response from "../responses/index";
import { findUser } from "../service/user.service";
import { get } from "lodash";

const requiresPermissions = (requiredPermissions: Array<string>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = get(req, 'user');
        if(!user || user === undefined){
            response.forbidden(res, { message: "You do not have the required permissions to access this resource" })
            return
        }
        const userDetails = await findUser({_id: user['_id']})

        const hasPermissions = userDetails!.permissions.filter(item => requiredPermissions.includes(item));

        if (hasPermissions.length > 0) {
            return next()
        } else {
            response.forbidden(res, { message: "You do not have the required permissions to access this resource" })
        }
    } catch (error: any) {
        log.error(error)
        response.forbidden(res, { message: error.errors })
    }
}

export default requiresPermissions; 