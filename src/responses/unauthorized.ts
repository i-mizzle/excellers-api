'use script';
import { Response } from "express";

module.exports = (res: Response, info: {message: string}) => {
    return res.status(401).send({
        'success': false,
        'message': info.message
    });
};
