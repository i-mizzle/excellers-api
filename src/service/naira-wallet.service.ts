import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import NairaWallet, { NairaWalletDocument } from '../model/naira-wallet.model';
// import { CustomerValidationObject, validateCustomer } from './biller-providers/irecharge.service';

export async function createWallet (input: DocumentDefinition<NairaWalletDocument>) {
    try {
        return NairaWallet.create(input)
    } catch (error: any) {
        throw new Error(error);
    }
}

export async function findWallet(
    query: FilterQuery<NairaWalletDocument>,
    options: QueryOptions = { lean: true }
) {
    return NairaWallet.findOne(query, {}, options)
}

// export async function findAndUpdate(
//     query: FilterQuery<MeterDocument>,
//     update: UpdateQuery<MeterDocument>,
//     options: QueryOptions
// ) {
//     return Meter.findOneAndUpdate(query, update, options)
// }

// export async function deleteMeter(
//     query: FilterQuery<MeterDocument>
// ) {
//     return Meter.deleteOne(query)
// }

// export const validateMeter = async (input: CustomerValidationObject) => {
//     return await validateCustomer(input)
// }