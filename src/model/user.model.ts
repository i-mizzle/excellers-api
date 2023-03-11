import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from 'config';
import { generateCode } from '../utils/utils';
import { ConfirmationCodeDocument } from './confirmation-code.model';

export interface UserDocument extends mongoose.Document {
    email: string;
    name: string;
    phone: string;
    userCode?:string,
    emailConfirmed: Boolean;
    confirmationCode: ConfirmationCodeDocument["_id"]
    password: string;
    userType: string;
    accountPermissions?: [];
    avatar?: string
    createdAt?: Date;
    updatedAt?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        emailConfirmed: {
            type: Boolean,
            default: false
        },
        confirmationCode: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "ConfirmationCode",
            required: true
        },
        password: {
            type: String,
            // required: true
        },
        phone: {
            type: String,
            required: true,
            unique: true
        },
        userType: {
            type: String,
            enum: ['USER', 'AFFILIATE', 'VENDOR', 'ADMIN', 'SUPER_ADMINISTRATOR'],
            default: 'USER'
        },
        avatar: {
            type: String
        },
        accountPermissions: [],
    },
    { timestamps: true }
);

UserSchema.pre('save', async function (next: mongoose.HookNextFunction) {
    let user = this as UserDocument
    
    // return if a password is not provided for the user
    if(!user.password) {
        return
    }
    // Only hash the password if it's modified or new
    if(!user.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(parseInt(config.get('saltWorkFactor')));
    const hash = await bcrypt.hashSync(user.password, salt);
    
    user.password = hash
});

// Logging in
UserSchema.methods.comparePassword = async function(
    candidatePassword: string
) {
    const user = this as UserDocument;
    return bcrypt.compare(candidatePassword, user.password).catch((e) => false);
}

const User = mongoose.model<UserDocument>('User', UserSchema)

export default User;