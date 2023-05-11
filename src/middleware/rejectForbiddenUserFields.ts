import { NextFunction, Request, Response } from "express";
const config = require('config');
import * as response from "../responses/index";

export const rejectForbiddenUserFields = async (req: Request, res: Response, next: NextFunction) => {
    let hasForbiddenField = false

    Object.entries(req.body).forEach(([key, value]) => {
        if(config.geoTravelSettings.forbiddenUserFields.includes(key)) {
            hasForbiddenField = true
        }
    });

    if (hasForbiddenField) {
        return response.forbidden(res, {message : `fields: ${config.geoTravelSettings.forbiddenUserFields.join(', ')} are forbidden`})
    }

    return next()
}