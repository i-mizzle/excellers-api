import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { UserDocument } from '../model/user.model';
import Order, { OrderDocument } from '../model/order.model';

export async function createOrder (input: DocumentDefinition<OrderDocument>) {
    return Order.create(input)
}

export async function findOrders (
    query: FilterQuery<OrderDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await Order.find(query, {}, options).countDocuments()
    let orders = null
    if(perPage===0&&page===0){
        orders = await Order.find(query, {}, options).populate(expand)
    } else {
        orders = await Order.find(query, {}, options).populate(expand)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        orders 
    }
}

export async function findOrder (
    query: FilterQuery<OrderDocument>,
    expand?: string,
    options: QueryOptions = { lean: true }
) {
    return Order.findOne(query, {}, options).populate(expand)
}

export async function findAndUpdateOrder (
    query: FilterQuery<OrderDocument>,
    update: UpdateQuery<OrderDocument>,
    options: QueryOptions
) {
    return Order.findOneAndUpdate(query, update, options)
}