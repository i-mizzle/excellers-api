import { object, string, ref, array } from "yup";

const payload = {
    body: object({
        title: string().required('title is required'),
        mediaType: string().required('media.type is required as enum [eg: VIDEO, IMAGE, DOCUMENT]'),
        mediaUrl: string().matches(
            /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
            'please use a valid url for media.url').required('media.url is required')
    })
}

const params = {
    params: object({
        bannerId: string().required('bannerId is required as path param')
    })
}

export const createBannerSchema = object({
   ...payload
});

export const updateBannerSchema = object({
    ...params,
    // ...payload
})

export const getBannerSchema = object({
    ...params,
    // ...payload
})
    
export const deleteBannerSchema = object({
    ...params
})