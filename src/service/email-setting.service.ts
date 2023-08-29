import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import EmailSetting, { EmailSettingDocument } from "../model/email-setting.model";

export async function createEmailSetting (input: DocumentDefinition<EmailSettingDocument>) {
    return EmailSetting.create(input)
}

export async function findEmailSettings (
    query: FilterQuery<EmailSettingDocument>,
    options: QueryOptions = { lean: true }
) {
    const total = await EmailSetting.find(query, {}, options).countDocuments()
    const emailSettings = await EmailSetting.find(query, {}, options)

    return {
        total,
        emailSettings 
    }
}

export async function findEmailSetting (
    query: FilterQuery<EmailSettingDocument>,
    options: QueryOptions = { lean: true }
) {
    return EmailSetting.findOne(query, {}, options)
}

export async function findAndUpdateEmailSetting(
    query: FilterQuery<EmailSettingDocument>,
    update: UpdateQuery<EmailSettingDocument>,
    options: QueryOptions
) {
    return EmailSetting.findOneAndUpdate(query, update, options)
}