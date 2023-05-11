import mongoose from 'mongoose';
import { PermissionDocument } from './permission.model';
import { UserDocument } from './user.model';

export interface RoleDocument extends mongoose.Document {
    name: string;
    slug: string;
    description: string;
    permissions: PermissionDocument["_id"][]
    deleted: Boolean
    createdBy: UserDocument["_id"]
    createdAt?: Date;
    updatedAt?: Date;
}

const RoleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            required: true,
            immutable: true
        },
        description: {
            type: String
        },
        permissions: [
            {
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Permission'
            }
        ],
        deleted: {
            type: Boolean,
            default: false
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User'
        }
    },
    { timestamps: true }
);

const Role = mongoose.model<RoleDocument>('Role', RoleSchema);

export default Role;