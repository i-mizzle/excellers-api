import { Request, Response } from 'express';
import { get } from 'lodash'
import log from "../logger";
import { validatePassword } from '../service/user.service'
import { createAccessToken, createSession, findSessions, updateSession } from "../service/session.service";
import * as response from "../responses/index";
import config from 'config';
import { sign } from "../utils/jwt.utils";

export async function createUserSessionHandler(req: Request, res: Response) {
    const user = await validatePassword(req.body);

    if (!user) {
        return response.unAuthorized(res, { message: "invalid username or password" })
    }

    // if (!user.emailConfirmed || user.emailConfirmed === false) {
    //     return response.unAuthorized(res, { message: "Your email address is yet to be confirmed. Please check your email." })
    // }

    const session = await createSession(user._id, req.get('user-agent') || '');
    
    const accessToken = createAccessToken({
        user,
        session
    });

    const refreshToken = sign(session, config.get('privateKey'), {
        expiresIn: config.get('refreshTokenTtl'), // 1year
    });

    return response.created(res, { 
        accessToken,
        refreshToken 
    })
}

export async function invalidateUserSessionHandler(req: Request, res: Response) {
    const sessionId = get(req, 'user.session');
    await updateSession({ _id:sessionId }, { valid: false });
    return response.ok(res, {message: "successfully logged out of session"});
}

export async function getUserSessionsHandler(req: Request, res: Response) {
    const userId = get(req, 'user._id');
    const sessions = await findSessions({ user: userId, valid: true })
    return res.send(sessions)
}