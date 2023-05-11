import { Request, Response } from "express";
import { changePassword, createUser, deleteUser, findAllUsers, findAndUpdateUser, findUser } from '../service/user.service'
import { get, omit } from "lodash";
import * as response from "../responses/index";
import log from "../logger";
import { sendInvitation } from "../service/mailer.service";
import { nanoid } from "nanoid";
import { createInvitation, findAllInvitations, findInvitation, resendInvitation } from "../service/invitation.service";
import { createConfirmationCode } from "../service/confirmation-code.service";
import { addMinutesToDate } from "../utils/utils";
import config from 'config';

// import { findInvitee } from "../service/invitee.service";

const tokenTtl = config.get('resetTokenTtl') as number

export async function inviteUserHandler(req: Request, res: Response) {
    try {
        const existingUserByEmail = await findUser({ email: req.body.email })
        const existingInvitationByEmail = await findInvitation({ email: req.body.email, accepted: false })
        const user = get(req, 'user')

        if(!user) {
            return
        }

        if(req.body.userType ==='SUPER_ADMINISTRATOR' && user['userType'] !== 'SUPER_ADMINISTRATOR') {
            return response.badRequest(res, {message: 'Sorry, you are not allowed to invite a super administrator'})
        }

        if (existingUserByEmail) {
            return response.conflict(res, {message: 'Email already registered'})
        }

        if (existingInvitationByEmail) {
            return response.conflict(res, {message: 'Email already invited'})
        }

        const code = nanoid(45)

        const invitationCode = await createConfirmationCode({
            code: code,
            type: 'ADMIN_INVITATION',
            expiry: addMinutesToDate(new Date(), tokenTtl)
        })

        const input = {...req.body, ...{code: invitationCode._id}}

        const invitation = await createInvitation(input)
        console.log(req.body.confirmationUrl + invitationCode)
        await sendInvitation({
            mailTo: invitation.email,
            firstName: invitation.firstName,
            invitationUrl: req.body.invitationUrl + invitationCode
        })

        return response.created(res, {message: 'invitation sent successfully'})
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function acceptInvitationHandler (req: Request, res: Response) {
    try {
        const body = req.body;
        const invitation = await findInvitation({ invitationCode: body.invitationCode, accepted: false });

        if (!invitation) {
            return response.notFound(res, { message: `invitation not found or already accepted` })
        } 

        // const userId = invitation.user;
        // let updateQuery = invitation
        // updateQuery.emailConfirmed = true
        // updateQuery.confirmationToken = ''

        // const updatedUser = await findAndUpdate({ _id: userId }, updateQuery, { new: true })

        // if(!updatedUser) {
        //     return response.error(res, {message: 'Sorry there was an error updating the user'})
        // }
        
        // return response.ok(res, {message: 'email address has been confirmed successfully'})
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function getInvitationHandler (req: Request, res: Response) {
    try {
        const invitationCode = get(req, 'params.invitationCode');

        const invitation = await findInvitation({invitationCode})

        if (!invitation) {
            return response.notFound(res, {message: `invitation with invitation code: ${invitationCode} not found`})
        }

        return response.ok(res, omit(invitation, ['_id']))
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export const checkExistingUserHandler = async (req: Request, res: Response) => {
    try {
        const field = get(req, 'params.field')
        const value = get(req, 'params.value')

        let user = await findUser({[field]: value})

        if(user && user !== null) {
            return response.conflict(res, {message: `${field} is already taken`})
        } else {
            return response.ok(res, {message: `${field} is available`})
        }
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export async function updateUserHandler (req: Request, res: Response) {
    try {
        if(req.body.handle && req.body.handle !== '') {
            let user = await findUser({handle: req.body.handle})
            if(user) {
                return response.conflict(res, {message: `the handle ${req.body.handle} is already taken`})
            }
        }

        const currentUser = get(req, 'user._id')
        const update = req.body
        const updatedUser = await findAndUpdateUser({ _id: currentUser }, update, { new: true })
        return response.ok(res, omit(updatedUser, ['_id', 'password', 'confirmationToken']))
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}


export async function deleteUserHandler (req: Request, res: Response) {
    try {
        const user = await findUser({userCode: req.params.userCode})
        const currentUser = get(req, 'user._id')
        if(!user) {
            return response.notFound(res, {message: `user with user code ${req.params.userCode} not found`})
        }
        console.log(user._id)
        console.log(currentUser)

        if(user._id == currentUser) {
            return response.conflict(res, {message: 'you are not allowed to delete your own account'})
        }

        await deleteUser({_id: user._id})
        return response.ok(res, {message: 'User deleted successfully'})
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

// export const deleteOwnUserHandler = async (req: Request, res: Response) => {
//     try {
//         const currentUser = get(req, 'user')
        
//         // validate password
//         let user = await validatePassword({
//             email: currentUser.email,
//             password: req.body.password
//         });

//         if (!user) {
//             return response.unAuthorize(res, { message: "invalid password" })
//         }

//         // get sessions
//         const sessions = await findSessions({ user: currentUser._id, valid: true })

//         // invalidate the user sessions
//         await Promise.all(sessions.map(async (session) => {
//             await updateSession({ _id:session._id }, { valid: false });
//         }))

//         // set deleted flag for the user
//         await findAndUpdate({ _id: currentUser._id }, {deleted:true}, { new: true })

//         return response.ok(res, {message: 'User deleted successfully'})
//     } catch (error: any) {
//         log.error(error)
//         return response.error(res, error)
//     }
// }

// export async function updateUserHandler (req: Request, res: Response) {
//     try {
//         const user = get(req, 'user')
//         const currentUser = get(req, 'user._id')

//         const userId = user.id
//         const update = req.body;

//         const updateObjectCheck = checkUpdateObject(update, user)
//         if(updateObjectCheck.error) {
//             return response.badRequest(res, {message: updateObjectCheck.message})
//         }
    
//         const updatedUser = await findAndUpdate({ _id: currentUser }, update, { new: true })
//         return response.ok(res, updatedUser)
//     } catch (error: any) {
//         log.error(error)
//         return response.error(res, error)
//     }
// }


// export async function adminUpdateUserHandler (req: Request, res: Response) {
//     try {
//         const currentUser = get(req, 'user')
//         const user = await findUser({userCode: req.params.userCode})
//         const update = req.body;

//         if(!user) {
//             return response.notFound(res, {message: "User not found"})
//         }
//         const updateObjectCheck = checkUpdateObject(update, currentUser)
//         if(updateObjectCheck.error) {
//             return response.badRequest(res, {message: updateObjectCheck.message})
//         }
    
//         const updatedUser = await findAndUpdate({ _id: user._id }, update, { new: true })
//         return response.ok(res, updatedUser)
//     } catch (error: any) {
//         log.error(error)
//         return response.error(res, error)
//     }
// }

export async function resendInvitationHandler(req: Request, res: Response) {
    try {        
        const resent = await resendInvitation(req.body.invitationCode, req.body.invitationUrl)
        if(resent.error) {
            return response.handleErrorResponse(res, resent)
        } else {
            return response.ok(res, resent.data)
        }
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}


export async function getAllInvitationsHandler (req: Request, res: Response) {
    try {
        const queryObject: any = req.query;
        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 

        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const users = await findAllInvitations(resPerPage, page, expand);
    
        const responseObject = {
            page,
            perPage: resPerPage,
            total: users.total,
            invitations: users.data
        }
        return response.ok(res, responseObject)
    } catch (error) {
        return response.error(res, error)
    }
}
