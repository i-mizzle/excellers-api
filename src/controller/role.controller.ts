import { Request, Response } from "express";
import { get } from "lodash";
import * as response from '../responses'
import { slugify } from "../utils/utils";
import { createRole, findAndUpdateRole, findRole, findRoles } from "../service/role.service";

export async function createRoleHandler (req: Request, res: Response) {
    const userId = get(req, 'user._id')
    const body = req.body

    const post = await createRole({ ...body, ...{createdBy: userId, slug: slugify(body.name)} })
    // return res.send(post)
    return response.created(res, post)
}

// export async function updateRoleHandler (req: Request, res: Response) {
//     const postId = get(req, 'params.postId');
//     const userId = get(req, 'user._id');
//     const update = req.body;

//     const post = await findPrice({ postId });
//     if (!post) {
//         return response.notFound(res, { message: `price was not found` })
//     }
//     const updatedPost = await findAndUpdatePrice({ postId }, update, { new: true })
//     return response.ok(res, updatedPost)
// }

export const getRolesHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }
        
        const roles = await findRoles({deleted: false}, expand)

        return response.ok(res, roles)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export async function getRoleHandler (req: Request, res: Response) {
    const roleId = get(req, 'params.roleId');
    const queryObject: any = req.query;
    let expand = queryObject.expand || null

    if(expand && expand.includes(',')) {
        expand = expand.split(',')
    }
    const role = await findRole({ _id: roleId, deleted: false}, expand);
    if(!role) {
        return response.notFound(res, { message: `role was not found` })
    } 
    return response.ok(res, role)
}

export async function deleteRoleHandler (req: Request, res: Response) {
    const roleId = get(req, 'params.roleId');

    const role = await findRole({ _id: roleId }, '');
    if (!role) {
        return response.notFound(res, { message: `role not found` })
    }

    await findAndUpdateRole({ _id: roleId }, {deleted: true}, {new: true});
    return response.ok(res, {message: 'role deleted successfully'});
}