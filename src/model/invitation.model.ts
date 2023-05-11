import mongoose from 'mongoose';
import { ConfirmationCodeDocument } from './confirmation-code.model';
import { RoleDocument } from './role.model';

export interface InvitationDocument extends mongoose.Document {
    code: ConfirmationCodeDocument["_id"];
    role: RoleDocument["_id"];
    email: string;
    firstName: string;
    lastName: string;
    userType: string;
    accountPermissions?: [];
    invitationUrl: string
    createdAt?: Date;
    updatedAt?: Date;
}

const InvitationSchema = new mongoose.Schema(
    {
        code: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "ConfirmationCode" 
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        userType: {
            type: String,
            enum: ['USER', 'AFFILIATE', 'VENDOR', 'ADMIN', 'SUPER_ADMINISTRATOR'],
            default: 'USER'
        },
        role: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Role" 
        }
    },
    { timestamps: true }
);

const User = mongoose.model<InvitationDocument>('Invitation', InvitationSchema)

export default User;