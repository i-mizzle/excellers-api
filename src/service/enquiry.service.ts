import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import Enquiry, { EnquiryDocument } from '../model/enquiry.model';

export async function createEnquiry (input: DocumentDefinition<EnquiryDocument>) {
    return Enquiry.create(input)
}

export async function findEnquiries(
    query: FilterQuery<EnquiryDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await Enquiry.find(query, {}, options).countDocuments()
    let enquiries = null
    if(perPage===0&&page===0){
        enquiries = await Enquiry.find(query, {}, options).populate(expand)
    } else {
        enquiries = await Enquiry.find(query, {}, options).populate(expand)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        enquiries 
    }
}

export async function findEnquiry(
    query: FilterQuery<EnquiryDocument>,
    expand?: string,
    options: QueryOptions = { lean: true }
) {
    return Enquiry.findOne(query, {}, options).populate(expand)
}

export async function findAndUpdateEnquiry(
    query: FilterQuery<EnquiryDocument>,
    update: UpdateQuery<EnquiryDocument>,
    options: QueryOptions
) {
    return Enquiry.findOneAndUpdate(query, update, options)
}