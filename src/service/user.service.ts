import { omit } from 'lodash';
import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import User, { UserDocument } from '../model/user.model';
import { generateCode } from '../utils/utils';

export async function createUser(input: DocumentDefinition<UserDocument>) {
    try {
        // const confirmationToken = generateCode(18, false)

        const createdUser = await User.create(input)

        return createdUser
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function findUser( query: FilterQuery<UserDocument>) {

    return User.findOne(query).lean();
}

export async function findAllUsers(
    perPage: number,
    page: number,
    options: QueryOptions = { lean: true }
) {
    const total = await User.find().countDocuments()
    const users = await User.find({}, {}, options)
        .sort({ 'createdAt' : -1 })
        .skip((perPage * page) - perPage)
        .limit(perPage)

    return {
        total,
        data: users
    }
}

export async function findAndUpdate(
    query: FilterQuery<UserDocument>,
    update: UpdateQuery<UserDocument>,
    options: QueryOptions
) {
    try {
        const updatedUser = await User.findOneAndUpdate(query, update, options)
        if(updatedUser) {
            return omit(updatedUser.toJSON(), 'password');
        }
    } catch (error:any ) {
        throw new Error(error)
    }
}


export async function validatePassword({
    email,
    password
}: {
    email: UserDocument['email'];
    password: string;
}) {
    const user = await User.findOne({ email });
    
    if(!user) {
        return false
    }
    
    const isValid = await user.comparePassword(password);
    if (!isValid) {
        return false
    }
    
    return omit(user.toJSON(), 'password');
}


// export const resendConfirmation = async (email: UserDocument['email']) => {
//     try {
//         const user = await User.findOne({ email });
//         if(!user) {
//             return {
//                 error: true,
//                 errorType: 'conflict',
//                 data: `email address ${email} not found in our records`
//             }
//         }

//         if(user.confirmed) {
//             return {
//                 error: true,
//                 errorType: 'conflict',
//                 data: 'User account is already confirmed'
//             }
//         }

//         const otp = generateCode(6, true)
//         user.otp = otp

//         // set expiry for otp
//         const minutesToAdd = 10;
//         const currentDate = new Date();
//         const otpExpiry = new Date(currentDate.getTime() + minutesToAdd * 60000);

//         await findAndUpdate({ _id: user._id }, { otp: otp, otpExpiry: +otpExpiry }, { new: true })
//         await sendConfirmationEmail({
//             mailTo: email,
//             firstName: user.name.split(' ')[0],
//             otp: otp
//         })
//         return {
//             error: false,
//             errorType: '',
//             data: 'Confirmation email resent successfully'
//         }
//     } catch (error: any) {
//         throw new Error(error);
//     }
// }

// export async function findAndUpdate(
//     query: FilterQuery<UserDocument>,
//     update: UpdateQuery<UserDocument>,
//     options: QueryOptions
// ) {
//     try {
//         console.log('query =======> ', query)
//         console.log('update =======> ', query)
//         console.log('options =======> ', query)
//         const updatedUser = await User.findOneAndUpdate(query, update, options)
//         if(updatedUser) {
//             return omit(updatedUser.toJSON(), 'password');
//         }
//     } catch (error:any ) {
//         throw new Error(error)
//     }
// }

export async function changePassword(
    userId: UserDocument['_id'],
    newPassword: string
) {
    try {
        const userObject = await User.findOne({_id: userId})
        userObject!.password = newPassword
        await userObject!.save()
        return
    } catch (error: any) {
        throw new Error(error);
    }
}

export async function deleteUser(
    query: FilterQuery<UserDocument>
) {
    return User.deleteOne(query)
}