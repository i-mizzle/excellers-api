import { Request, Response } from "express";
import { get } from "lodash";
import * as response from '../responses'
import { createPermission, deletePermission, findAndUpdatePermission, findPermission, findPermissions } from "../service/permission.service";
import { slugify } from "../utils/utils";

export async function createPermissionsHandler (req: Request, res: Response) {
    const userId = get(req, 'user._id')
    const body = req.body

    // const post = await createPermission({ ...body, user: userId })
    const createdPermissions: any = []

    await Promise.all( body.permissions.map(async (permission: any) => {
        const slug = slugify(permission.name)
        const created = await createPermission({...permission, ...{slug: slug}})
        createdPermissions.push(created)
        return created
    }))

    // return res.send(post)
    return response.created(res, createdPermissions)
}

export async function updatePermissionHandler (req: Request, res: Response) {
    const postId = get(req, 'params.postId');
    const userId = get(req, 'user._id');
    const update = req.body;

    const post = await findPermission({ postId });
    if (!post) {
        return response.notFound(res, { message: `permission not found` })
    }

    const updatedPost = await findAndUpdatePermission({ postId }, update, { new: true })
    return response.ok(res, updatedPost)
}

export async function getPermissionHandler (req: Request, res: Response) {
    const postId = get(req, 'params.postId');
    const post = await findPermission({ postId });
    if(!post) {
        return response.notFound(res, { message: `permission not found` })
    } 
    return response.ok(res, post)
}


export async function getPermissionsHandler(req: Request, res: Response) {
    // const user = get(req, 'user');

    // let timeSlotsQuery: any = {active: true}

    // if(user && ( user['userType'] === 'ADMIN' || user['userType'] === 'SUPER_ADMINISTRATOR') ) {
    //     timeSlotsQuery = {}
    // }

    const permissions = await findPermissions({})
    // return res.send(timeSlots.sort((a, b) => (a.order > b.order) ? 1: -1)

    // return response.ok(res, timeSlots.sort((a: any, b: any) => (a.order > b.order) ? 1: -1))
    return response.ok(res, permissions)

}

// export async function deletePermissionHandler (req: Request, res: Response) {
//     const postId = get(req, 'params.permission_s');
//     const userId = get(req, 'user._id');

//     const post = await findPermission({ postId });
//     if (!post) {
//         return response.notFound(res, { message: `permission not found` })
//     }

//     await deletePermission({ postId });
//     return response.ok(res, {message: 'permission deleted successfully'});
// }