import { object, string, ref, number, boolean, array } from "yup";

const payload = {
    body: object({
        title: string().required('title is required'),
        dealItemType: string().required('dealItemType is required as enum [eg: PACKAGE, FLIGHT]'),
        dealItem: string().required('dealItem is required'),
        discountValue: number().required('discountValue is required'),
        discountType: string().required('type is required as enum [eg: PERCENTAGE, FIXED]'),
        description: string().required('description is required'),
        startDate: string().required('start date required in the format DD-MM-YYYY'),
        endDate: string().required('end date required in the format DD-MM-YYYY'),
        active: boolean(),
        media: array(object({
            type: string().required('media.type is required as enum [eg: VIDEO, IMAGE, DOCUMENT]'),
            url: string().matches(
                /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
                'Please use a valid url for media.url').required('media.url is required')
        })),
    })
}

const params = {
    params: object({
        dealId: string().required('dealId is required as a path param')
    })
}

export const createDealSchema = object({
   ...payload
});

export const getDealSchema = object({
    ...params
})