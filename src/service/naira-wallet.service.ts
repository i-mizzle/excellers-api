import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import NairaWallet, { NairaWalletDocument } from '../model/naira-wallet.model';
import { UserDocument } from '../model/user.model';
import { generateCode } from '../utils/utils';
import { reserveAccount } from './integrations/monnify.service';
// import { CustomerValidationObject, validateCustomer } from './biller-providers/irecharge.service';

interface CreateWalletInterface {
    userId: UserDocument["_id"]
    customerEmail: string
    customerBvn: string
    customerName: string
}

export async function createNairaWallet (input: DocumentDefinition<CreateWalletInterface>) {
    try {
        const accountReference = generateCode(18, false)

        const reservedAccount = await reserveAccount({
            accountReference,
            customerEmail: input.customerEmail,
            customerBvn: input.customerBvn,
            customerName: input.customerName,
        })

        if(reservedAccount.error === true) {
            return reservedAccount
        }

        const createdWallet = await NairaWallet.create({
            user: input.userId,
            accountReference: reservedAccount.data.accountReference,
            reservationReference: reservedAccount.data.reservationReference,
            accountName: reservedAccount.data.accounts[0].accountName,
            accountNumber: reservedAccount.data.accounts[0].accountNumber,
            bankCode: reservedAccount.data.accounts[0].bankCode,
            bankName: reservedAccount.data.accounts[0].bankName
        })
    
        console.log('the wallet ==========>', createdWallet)

        return {
            error: false,
            errorType: '',
            data: createdWallet
        }

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

export async function findAndUpdateNairaWallet(
    query: FilterQuery<NairaWalletDocument>,
    update: UpdateQuery<NairaWalletDocument>,
    options: QueryOptions
) {
    return NairaWallet.findOneAndUpdate(query, update, options)
}
