import { omit } from "lodash";
import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { nanoid } from "nanoid";
import Invitation, { InvitationDocument } from "../model/invitation.model";
import { sendInvitation } from "./mailer.service";

export const resendInvitation = async (invitationCode: InvitationDocument['email'], invitationUrl: String) => {
    try {
        const invitation = await Invitation.findOne({ invitationCode });
        if(!invitation) {
            return {
                error: true,
                errorType: 'notFound',
                data: `invitation not found in our records`
            }
        }


        const newInvitationCode = nanoid(25)
        // invitation.invitationCode = newInvitationCode

        // set expiry for otp
        // const minutesToAdd = 10;
        // const currentDate = new Date();
        // const otpExpiry = new Date(currentDate.getTime() + minutesToAdd * 60000);

        await findAndUpdate({ _id: invitation._id }, { invitationCode: newInvitationCode }, { new: true })
        await sendInvitation({
            mailTo: invitation.email,
            firstName: invitation.firstName,
            activationCode: newInvitationCode
        })
        return {
            error: false,
            errorType: '',
            data: 'Confirmation email resent successfully'
        }
    } catch (error: any) {
        throw new Error(error);
    }
}


export async function createInvitation(input: DocumentDefinition<InvitationDocument>) {
    try {
        // const confirmationToken = generateCode(18, false)

        const createdInvitation = await Invitation.create(input)

        return createdInvitation
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function findInvitation( query: FilterQuery<InvitationDocument>) {
    return Invitation.findOne(query).lean();
}

export async function findAllInvitations(
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await Invitation.find().countDocuments()
    const invitations = await Invitation.find({}, {}, options).populate(expand)
        .sort({ 'createdAt' : -1 })
        .skip((perPage * page) - perPage)
        .limit(perPage)

    return {
        total,
        data: invitations
    }
}

export async function findAndUpdate(
    query: FilterQuery<InvitationDocument>,
    update: UpdateQuery<InvitationDocument>,
    options: QueryOptions
) {
    try {
        const updatedInvitation = await Invitation.findOneAndUpdate(query, update, options)
        if(updatedInvitation) {
            return omit(updatedInvitation.toJSON(), 'password');
        }
    } catch (error:any ) {
        throw new Error(error)
    }
}

export async function deleteInvitation(
    query: FilterQuery<InvitationDocument>
) {
    return Invitation.deleteOne(query)
}