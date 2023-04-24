import { Request, Response } from "express";
import { get } from "lodash";
import * as response from '../responses'
import { createPermission, deletePermission, findAndUpdatePermission, findPermission } from "../service/permission.service";

export async function createPermissionHandler (req: Request, res: Response) {
    const userId = get(req, 'user._id')
    const body = req.body

    const post = await createPermission({ ...body, user: userId })
    // return res.send(post)
    return response.created(res, post)
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