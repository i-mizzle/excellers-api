import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import Enquiry, { EnquiryDocument } from '../model/enquiry.model';

export async function createEnquiry (input: DocumentDefinition<EnquiryDocument>) {
    return Enquiry.create(input)
}

export async function findEnquiry(
    query: FilterQuery<EnquiryDocument>,
    options: QueryOptions = { lean: true }
) {
    return Enquiry.findOne(query, {}, options)
}

export async function findAndUpdateEnquiry(
    query: FilterQuery<EnquiryDocument>,
    update: UpdateQuery<EnquiryDocument>,
    options: QueryOptions
) {
    return Enquiry.findOneAndUpdate(query, update, options)
}