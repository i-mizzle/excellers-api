import { Request, Response } from "express";
import { changePassword, createUser, deleteUser, findAllUsers, findAndUpdateUser, findUser, validatePassword } from '../service/user.service'
import { get, omit } from "lodash";
import * as response from "../responses/index";
import log from "../logger";
import { addMinutesToDate, getJsDate } from "../utils/utils";
// import { createConfirmationCode, findAndUpdateConfirmation, findConfirmationCode } from "../service/confirmation-code.service";
import mongoose from "mongoose";

import config from 'config';
import { nanoid } from "nanoid";
// import { sendEmailConfirmation } from "../service/mailer.service";
// import { findRole } from "../service/role.service";
// import { sendToKafka } from "../kafka/kafka";
const tokenTtl = config.get('resetTokenTtl') as number

const parseUserFilters = (query: any) => {
    const { email, name, phone, userType, minDateCreated, maxDateCreated } = query; 

    const filters: any = {}; 

    if (email) {
        filters.email = email
    } 
    
    if (name) {
        filters.name = name
    }
    
    if (phone) {
        filters.phone = phone
    }

    if (userType) {
        filters.userType = userType
    }
    
    // if (attendeeName) {
    //     // filters.attendee = attendeeName; 
    //     filters["attendee.name"] = { $elemMatch: { name: attendeeName } };; 
    // }
    
    // if (attendeeEmail) {
    //     // filters.email = email; 
    //     filters["attendee.email"] = { $elemMatch: { name: attendeeEmail } };; 
    // }
    
    // if (attendeePhone) {
    //     // filters.phone = phone; 
    //     filters["attendee.email"] = { $elemMatch: { name: attendeePhone } };; 
    // }

        
    if (minDateCreated) {
        filters.createdAt = { $gte: (getJsDate(minDateCreated)) }; 
    }

    if (maxDateCreated) {
        filters.createdAt = { $lte: getJsDate(maxDateCreated) }; 
    }
  
    return filters

}

export async function createUserHandler(req: Request, res: Response) {
    try {
        const existingUserByEmail = await findUser({ email: req.body.email })
        const existingUserByPhone = await findUser({ phone: req.body.phone })

        if (existingUserByEmail) {
            return response.conflict(res, {message: 'email already registered'})
        }

        if (existingUserByPhone) {
            return response.conflict(res, {message: 'phone number already registered'})
        }

        const input = req.body

        const user = await createUser(input)

        return response.created(res, 
            omit(user.toJSON(), ['password'])
        )
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

// export async function createUserViaInvitationHandler(req: Request, res: Response) {
//     try {

//         const invitation = await findInvitee({inviteCode: req.body.inviteCode})
//         if(!invitation || invitation === null) {
//             return response.notFound(res, {message: 'Invitation not found'})
//         }

//         const input = {
//             name: invitation.name,
//             email: invitation.email,
//             phone:invitation.phone,
//             password: req.body.password,
//             accountType: invitation.accountType,
//             confirmationToken: "",
//             emailConfirmed: true,
            
//         }

//         // const user = await createUser(input)
//         // return response.created(res, 
//         //     omit(user.toJSON(), ['_id', 'password', 'confirmationToken'])
//         // )
//     } catch (error: any) {
//         log.error(error)
//         return response.error(res, error)
//     }
// }

// body: req.body,
// url: req.route.path, req.originalUrl


// export async function confirmEmailHandler (req: Request, res: Response) {
//     try {
//         const body = req.params;
//         const confirmationCode = await findConfirmationCode({code: body.confirmationCode, type: 'EMAIL_CONFIRMATION'})

//         if (!confirmationCode) {
//             return response.notFound(res, { message: `invalid confirmation code` })
//         } 

//         const timeNow = new Date()
//         if(!confirmationCode.createdAt) {
//             return
//         }
    
//         if (timeNow > confirmationCode.expiry) {
//         // if (timeNow.getTime() > new Date(confirmationCode.createdAt).getTime() + tokenTtl * 60000) {
//             return response.conflict(res, {message: "Sorry, confirmation code has expired, please get a new code"})
//         }

//         const user = await findUser({ confirmationCode: confirmationCode._id, emailConfirmed: false });
//         if(!user) {
//             return response.conflict(res, {message: "email already confirmed, please log in"})
//         }

     
//         const userId = user._id;
//         let updateQuery = user
//         updateQuery.emailConfirmed = true

//         const updatedUser = await findAndUpdateUser({ _id: userId }, updateQuery, { new: true })
//         await findAndUpdateConfirmation({ _id: confirmationCode._id }, { valid: false }, { new: true })

//         if(!updatedUser) {
//             return response.error(res, {message: 'sorry there was an error updating the user'})
//         }
        
//         return response.ok(res, {message: 'email address has been confirmed successfully'})

//     } catch (error: any) {
//         log.error(error)
//         return response.error(res, error)
//     }
// }

export async function getUserProfileHandler (req: Request, res: Response) {
    try {
        const userId = get(req, 'user._id');
        const queryObject: any = req.query;
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        let user = await findUser({_id: userId}, 'store')

        if(!user) {
            return response.notFound(res, {message: 'User not found'})
        }

        // const role = await findRole({_id: user.role}, 'permissions')

        const userDetails = omit(user, ['password', 'confirmationToken'])

        return response.ok(res, userDetails)
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function getUserDetailsHandler (req: Request, res: Response) {
    try {
        const userId = get(req, 'params.userId');

        let user = await findUser({_id: userId})

        return response.ok(res, omit(user, ['password', 'confirmationToken']))
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
        // if(req.body.handle && req.body.handle !== '') {
        //     let user = await findUser({handle: req.body.handle})
        //     if(user) {
        //         return response.conflict(res, {message: `the handle ${req.body.handle} is already taken`})
        //     }
        // }

        const currentUser = get(req, 'user._id')
        const update = req.body
        const updatedUser = await findAndUpdateUser({ _id: currentUser }, update, { new: true })
        return response.ok(res, omit(updatedUser, ['password']))
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}


export async function deleteUserHandler (req: Request, res: Response) {
    try {
        const user = await findUser({_id: req.params.userId})
        const currentUser = get(req, 'user._id')
        if(!user) {
            return response.notFound(res, {message: `user not found`})
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

const checkUpdateObject = (update: any, currentUser: any) : { error: Boolean, message: string } => {
    if(update.userType && update.userType !== '' && currentUser.userType !== 'SUPER_ADMINISTRATOR') {
        return {error: true, message: "You are not allowed to update account type"}
    }else if(update.userCode && update.userCode !== '') {
        return {error: true, message: "You are not allowed to update user code"}
    }else if(update.emailConfirmed && currentUser.accountType !== 'SUPER_ADMINISTRATOR' ) {
        return {error: true, message: "You are not allowed to update confirmation status"}
    }else if(update.deactivated && currentUser.accountType !== 'SUPER_ADMINISTRATOR') {
        return {error: true, message: "You are not allowed to update active status"}
    }else if(update.devices) {
        return {error: true, message: "You are not allowed to update devices"}
    }else if(update.bvnValidationData) {
        return {error: true, message: "You are not allowed to update bvn data"}
    }else if(update.bvnValidated) {
        return {error: true, message: "You are not allowed to update bvn validation status"}
    } else {
        return {error: false, message: ''}
    }
}



export async function adminUpdateUserHandler (req: Request, res: Response) {
    try {
        const currentUser = get(req, 'user')
        const user = await findUser({_id: req.params.userId})
        const update = req.body;

        if(!user) {
            return response.notFound(res, {message: "User not found"})
        }

        if(user._id == currentUser) {
            return response.conflict(res, {message: 'you are not allowed to update your own account'})
        }

        const updateObjectCheck = checkUpdateObject(update, currentUser)
        if(updateObjectCheck.error) {
            return response.badRequest(res, {message: updateObjectCheck.message})
        }
    
        const updatedUser = await findAndUpdateUser({ _id: user._id }, update, { new: true })
        return response.ok(res, updatedUser)
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}


export async function getAllUsersHandler (req: Request, res: Response) {
    try {
        const user = get(req, 'user._id')
        const currentUser = await findUser({_id: user})
        if(!currentUser) {
            return response.notFound(res, {message: 'user not found'})
        }
        const queryObject: any = req.query;
        const resPerPage = +queryObject.perPage || 30; // results per page
        const page = +queryObject.page || 1; // Page 
        const filters = parseUserFilters(queryObject)

        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }
        
        const users = await findAllUsers({...filters, ...{store: currentUser.store} }, resPerPage, page, expand);
    
        const responseObject = {
            page,
            perPage: resPerPage,
            total: users.total,
            users: users.data
        }
        return response.ok(res, responseObject)
    } catch (error) {
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
        
        const validated = await validatePassword({username: user.username, password});
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

export async function bulkImportUsers(req: Request, res: Response) {
    try {

        let created = 0
        await Promise.all(req.body.data.map(async (item: any) => {
            await createUser({
                email: item.email,
                username: item.username,
                name: item.name,
                phone: item.phone,
                idNumber:item.idNumber,
                permissions: item.permissions,
                password: atob(item.password),
                passwordChanged: item.document.passwordChanged,
                userType: 'ADMIN'
            })
            created += 1
        }))

        return response.ok(res, {message: `${created} users created successfully.`}) 
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function resetUserPassword(req: Request, res: Response) {
    try {
        const user = await findUser({_id: req.params.user})
        if(!user) {
            return response.notFound(res, 'user not found')
        }
        const body = req.body
        let updated = 0

        await changePassword(user._id, 'Abcd1234!')
        
        await findAndUpdateUser({_id: user._id}, {passwordChanged: false}, {new: true})

        return response.ok(res, {message: `${updated} user password has been reset successfully. Use Abcd1234! for first log in`}) 
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

export async function bulkResetPasswords(req: Request, res: Response) {
    try {
        const users = await findAllUsers({}, 10000, 1)
        const body = req.body
        let updated = 0
        await Promise.all(users.data.map(async (item: any) => {
            // 
            await changePassword(item._id, body.password)
            await findAndUpdateUser({_id: item._id}, {passwordChanged: false}, {new: true})
            updated += 1
        }))

        return response.ok(res, {message: `${updated} user passwords reset successfully. Use ${body.password} for first log in`}) 
    } catch (error: any) {
        log.error(error)
        return response.error(res, error)
    }
}

