import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import ItemVariant, { ItemVariantDocument, Recipe } from '../model/item-variant.model';
import { UserDocument } from '../model/user.model';
import { ItemDocument } from '../model/item.model';

export interface NewVariantInterface {
    createdBy: UserDocument['_id'];
    item: ItemDocument['_id']
    name: string;
    sku: string;
    description: string;
    saleUnit: string;
    recipe: Recipe[]
}
export async function createVariant (input: DocumentDefinition<ItemVariantDocument>) {
    return ItemVariant.create(input)
}

export async function findVariants(
    query: FilterQuery<ItemVariantDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await ItemVariant.find(query, {}, options).countDocuments()
    let variants = null
    if(perPage===0&&page===0){
        variants = await ItemVariant.find(query, {}, options).populate(expand)
    } else {
        variants = await ItemVariant.find(query, {}, options).populate(expand)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        variants 
    }
}

export async function findVariant(
    query: FilterQuery<ItemVariantDocument>,
    expand?: string,
    options: QueryOptions = { lean: true }
) {
    return ItemVariant.findOne(query, {}, options).populate(expand)
}

export async function findAndUpdateVariant(
    query: FilterQuery<ItemVariantDocument>,
    update: UpdateQuery<ItemVariantDocument>,
    options: QueryOptions
) {
    return ItemVariant.findOneAndUpdate(query, update, options)
}