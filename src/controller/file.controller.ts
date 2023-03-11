import { Request, Response } from 'express'
import { get } from "lodash";
import * as response from '../responses'
import { MulterRequest } from '../service/integrations/cloudinary.service';

export const newFileHandler = async (req: Request, res: Response) => {
    try {
        if(!req.file) {
            return response.badRequest(res, { message: 'No file received' })
        }
        return response.created(res, { 
            file: (req as unknown as MulterRequest).file.path
        })
    } catch (error:any) {
        return response.error(res, error)
    } 
}