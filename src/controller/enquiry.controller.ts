import { Request, Response } from "express";
import { createEnquiry } from "../service/enquiry.service"
import * as response from '../responses'

export async function createEnquiryHandler (req: Request, res: Response) {
    const body = req.body

    const post = await createEnquiry(body)
    // return res.send(post)
    return response.created(res, post)
}