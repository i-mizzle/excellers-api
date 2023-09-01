import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from 'config';
import { ConfirmationCodeDocument } from './confirmation-code.model';
import { AffiliateMarkupDocument } from './affiliate-markup.model';
import { NairaWalletDocument } from './naira-wallet.model';

export interface UserDocument extends mongoose.Document {
    email: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    phone: string;
    userCode?:string,
    emailConfirmed: Boolean;
    confirmationCode: ConfirmationCodeDocument["_id"]
    password: string;
    userType: string;
    bvnValidationReference?: string;
    accountPermissions?: [];
    avatar?: string
    approvedAsAffiliate?: Boolean
    // bvnValidated?: Boolean,
    // bvnValidationData?: {}
    affiliateMarkup?: AffiliateMarkupDocument["_id"]
    // wallet?: NairaWalletDocument["_id"]
    businessName?: string,
    location?: string
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
        firstName: {
            type: String,
            required: true
        },
        middleName: {
            type: String,
        },
        lastName: {
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
            enum: ['USER', 'AFFILIATE', 'AFFILIATE_ADMIN', 'VENDOR', 'ADMIN', 'SUPER_ADMINISTRATOR'],
            default: 'USER'
        },
        avatar: {
            type: String
        },
        approvedAsAffiliate: {
            type: Boolean,
            default: false
        },
        // bvnValidated: {
        //     type: Boolean,
        //     default: false
        // },
        // bvnValidationReference: {
        //     type: String,
        //     unique: true,
        //     immutable: true
        // },
        // bvnValidationData: {},
        affiliateMarkup: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AffiliateMarkup'
        },
        // wallet: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'NairaWallet'
        // },
        businessName: {
            type: String
        },
        location: {
            typ: String
        },
        role: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Role" 
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