import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import NairaWallet, { NairaWalletDocument } from '../model/naira-wallet.model';
import { UserDocument } from '../model/user.model';
import { generateCode } from '../utils/utils';
import { reserveAccount } from './integrations/monnify.service';
import { BizgemCreateVirtualAccountInterface, createVirtualAccount } from './integrations/bizgem.service';
// import { CustomerValidationObject, validateCustomer } from './biller-providers/irecharge.service';

interface CreateWalletInterface extends BizgemCreateVirtualAccountInterface {
    userId: UserDocument["_id"]
}

export async function createNairaWallet (input: DocumentDefinition<CreateWalletInterface>) {
    try {
        const accountReference = generateCode(20, false)

        const reservedAccount = await createVirtualAccount(input)

        if(reservedAccount.error === true) {
            return reservedAccount
        }

        console.log('RESERVED ===> ', reservedAccount)

        // const createdWallet = await NairaWallet.create({
        //     user: input.userId,
        //     accountReference: reservedAccount.data.accountReference,
        //     reservationReference: reservedAccount.data.reservationReference,
        //     accountName: reservedAccount.data.accounts[0].accountName,
        //     accountNumber: reservedAccount.data.accounts[0].accountNumber,
        //     bankCode: reservedAccount.data.accounts[0].bankCode,
        //     bankName: reservedAccount.data.accounts[0].bankName,
        //     nairaWallet: 
        // })

        const createdWallet = await NairaWallet.create({
            accountReference,
            accountNumber: reservedAccount.data.accountNumber,
            accountName: reservedAccount.data.accountName,
            accountParent: reservedAccount.data.accountParent,
            accountCustomerId: reservedAccount.data.accountCustomerId,
            bankCode: reservedAccount.data.channel.bankCode,
            bankName: reservedAccount.data.channel.bankName,
            user: input.userId
        })
    
        console.log('the wallet ==========>', createdWallet)

        return {
            error: false,
            errorType: '',
            data: createdWallet
        }

    } catch (error: any) {
        console.log('error saving the wallet => ', error)
        throw new Error(error);
    }
}

export async function findWallets(
    query: FilterQuery<NairaWalletDocument>,
    perPage: number,
    page: number,
    // expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await NairaWallet.find(query, {}, options).countDocuments()
    let wallets = null
    if(perPage===0&&page===0){
        wallets = await NairaWallet.find(query, {}, options)
    } else {
        wallets = await NairaWallet.find(query, {}, options)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage)
    }

    return {
        total,
        wallets
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
