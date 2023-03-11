import { Response } from "express";

module.exports = (res: Response, error: {message: string, stack: string}) => {
    return res.status(403).send({
        'success': false,
        'message': error.message
    });
};
