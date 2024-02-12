import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { UserDocument } from '../model/user.model';
import StockHistory, { StockHistoryDocument } from '../model/stock-history.model';
import { ItemVariantDocument } from '../model/item-variant.model';

export interface NewStockHistoryInterface {
    recordedBy: UserDocument['_id'];
    variant: ItemVariantDocument['_id'];
    stockBeforeChange: number;
    note: string;
    type: string;
    quantity: number;
}

export async function createStockHistory (input: DocumentDefinition<StockHistoryDocument>) {
    return StockHistory.create(input)
}

export async function findStockHistory(
    query: FilterQuery<StockHistoryDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await StockHistory.find(query, {}, options).countDocuments()
    let stockHistory = null
    if(perPage===0&&page===0){
        stockHistory = await StockHistory.find(query, {}, options).populate(expand)
    } else {
        stockHistory = await StockHistory.find(query, {}, options).populate(expand)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        stockHistory 
    }
}

// export async function findMenu(
//     query: FilterQuery<StockHistoryDocument>,
//     expand?: string,
//     options: QueryOptions = { lean: true }
// ) {
//     return Menu.findOne(query, {}, options).populate(expand)
// }

export async function findAndUpdateStockHistory(
    query: FilterQuery<StockHistoryDocument>,
    update: UpdateQuery<StockHistoryDocument>,
    options: QueryOptions
) {
    return StockHistory.findOneAndUpdate(query, update, options)
}