import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import config from 'config';
import { get, omit } from "lodash";
import { createConfirmationCode, findAndUpdateConfirmation, findConfirmationCode } from "../service/confirmation-code.service";
import { changePassword, findUser, validatePassword } from "../service/user.service";
import * as response from "../responses/index";
import { sendPasswordResetEmail } from "../service/mailer.service";
import log from "../logger";
import { addMinutesToDate } from "../utils/utils";
import { nanoid } from "nanoid";
import { createResetRequest, findResetRequest } from "../service/password-reset.service";
// import { sendToKafka } from "../kafka/kafka";
import mongoose from "mongoose";

const tokenTtl = config.get('resetTokenTtl') as number

export const requestPasswordResetHandler = async (req: Request, res: Response) => {
    try {
        const user = await findUser({ email: req.body.email })

        if (!user) {
            return response.notFound(res, {message: 'sorry, the email address provided does not match our records'})
        }

        const code = nanoid(45)
        const resetCode = await createConfirmationCode({
            code: code,
            type: 'PASSWORD_RESET',
            expiry: addMinutesToDate(new Date(), tokenTtl)
        })

        await createResetRequest({
            user: user._id,
            resetCode: resetCode._id
        })

        await sendPasswordResetEmail({
            mailTo: user.email,
            firstName: user.firstName,
            resetCode: resetCode.code
        })

        // await sendToKafka(JSON.stringify({
        //     message: {
        //         mailTo: user.email,
        //         firstName: user.name.split(' ')[0] || user.name,
        //         resetUrl: req.body.confirmationUrl + code
        //     },
        //     action: 'password-reset-request'
        // }))

        return response.created(res, "password reset link sent successfully. please check your email")

    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function adminInitiatePasswordResetHandler(req: Request, res: Response) {
    try {       

        const loggedInUser = get(req, 'user')
        const userId = get(req, 'params.userId');

        const user = await findUser({_id: userId})
        if (!user) {
            return response.notFound(res, {message: "User not found"})
        }

        // user

        const resetRequest = await createConfirmationCode({
            code: nanoid(45),
            type: 'PASSWORD_RESET',
            expiry: addMinutesToDate(new Date(), tokenTtl)
        })

        return response.created(res, {message: 'Password reset link sent successfully'})
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function resetPasswordHandler(req: Request, res: Response) {
    try {
        const resetCode = req.body.resetCode
        const newPassword = req.body.password
        const code = await findConfirmationCode({code: resetCode, valid: true}) 

        // const user = await findUser()
        
        if (!code) {
            return response.notFound(res, {message: "reset code was not found or is already used"})
        } 

        if(!code.createdAt) {
            return
        }

        const resetRequest = await findResetRequest({resetCode: code._id})

        const timeNow = new Date();

        if (timeNow > code.expiry) {
            return response.conflict(res, {message: "sorry, reset token has expired, please create another request"})
        }
           
        await changePassword(resetRequest!.user, newPassword)
        await findAndUpdateConfirmation({ _id: code._id }, { valid: false }, { new: true })
        return response.ok(res, 'password updated successfully')
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function changePasswordHandler(req: Request, res: Response) {
    try {
        const password= req.body.password
        const newPassword = req.body.newPassword
        const userId = get(req, 'user._id');

        const user = await findUser({_id: userId}) 

        if(!user) {
            return response.notFound(res, 'user not found')
        }
        // const user = await findUser({_id: userId})
        
        const validated = await validatePassword({email: user.email, password});
        if (!validated) {
            return response.unAuthorized(res, { message: "invalid username or password" })
        }

        await changePassword(mongoose.Types.ObjectId((user._id)), newPassword)
        return response.ok(res, {message: 'Password updated successfully'})
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}