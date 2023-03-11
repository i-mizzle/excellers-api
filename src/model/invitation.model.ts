import mongoose from 'mongoose';
import { ConfirmationCodeDocument } from './confirmation-code.model';

export interface InvitationDocument extends mongoose.Document {
    code: ConfirmationCodeDocument["_id"];
    email: string;
    name: string;
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
        name: {
            type: String,
            required: true
        },
        userType: {
            type: String,
            enum: ['USER', 'AFFILIATE', 'VENDOR', 'ADMIN', 'SUPER_ADMINISTRATOR'],
            default: 'USER'
        },
        accountPermissions: [],
    },
    { timestamps: true }
);

const User = mongoose.model<InvitationDocument>('Invitation', InvitationSchema)

export default User;