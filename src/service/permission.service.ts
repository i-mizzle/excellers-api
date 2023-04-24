import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import Permission, { PermissionDocument } from '../model/permission.model';


export async function createPermission (input: DocumentDefinition<PermissionDocument>) {
    return Permission.create(input)
}

export async function findPermission(
    query: FilterQuery<PermissionDocument>,
    options: QueryOptions = { lean: true }
) {
    return Permission.findOne(query, {}, options)
}

export async function findAndUpdatePermission(
    query: FilterQuery<PermissionDocument>,
    update: UpdateQuery<PermissionDocument>,
    options: QueryOptions
) {
    return Permission.findOneAndUpdate(query, update, options)
}

export async function deletePermission(
    query: FilterQuery<PermissionDocument>
) {
    return Permission.deleteOne(query)
}