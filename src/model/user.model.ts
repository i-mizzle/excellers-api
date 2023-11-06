import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from 'config';
// import { ConfirmationCodeDocument } from './confirmation-code.model';
// import { AffiliateMarkupDocument } from './affiliate-markup.model';
// import { NairaWalletDocument } from './naira-wallet.model';
// import { RoleDocument } from './role.model';

export interface UserDocument extends mongoose.Document {
    email: string;
    username: string;
    name: string;
    phone: string;
    idNumber?:string,
    permissions: string[];
    password: string;
    passwordChanged: boolean;
    userType: string;
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
        username: {
            type: String,
            required: true,
            unique: true
        },
        idNumber: {
            type: String
        },
        name: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        passwordChanged: {
            type: Boolean,
            default: false
        },
        phone: {
            type: String,
            required: true,
            unique: true
        },
        permissions: [{
            type: String
        }],
        userType: {
            type: String,
            enum: ['USER', 'ADMIN', 'SUPER_ADMINISTRATOR'],
            default: 'ADMIN'
        }
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