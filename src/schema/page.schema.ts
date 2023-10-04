import { object, string, ref, array } from "yup";

const payload = {
    body: object({
        title: string().required('title is required'),
        type: string().required("type is required as one of ABOUT, CONTACT, FAQ, TERMS-CONDITIONS, PRIVACY-POLICY"),
        media: array(object({
            type: string().required('media.type is required as enum [eg: VIDEO, IMAGE, DOCUMENT]'),
            url: string().matches(
                /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
                'please use a valid url for media.url').required('media.url is required')
        })),
        coverImageUrl: string().matches(
            /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
            'please use a valid url for coverImageUrl'),
        body: string().required('body is required').min(120, 'body is too short - should be 120 chars minimum.')
    })
}

const params = {
    params: object({
        pageId: string().required('post id is required')
    })
}

const pageByTypeParams = {
    params: object({
        type: string().required('post id is required')
    })
}

export const createPageSchema = object({
   ...payload
});

export const updatePageSchema = object({
    ...params,
    // ...payload
})

export const getPageSchema = object({
    ...params,
    // ...payload
})

export const getPageByTypeSchema = object({
    ...pageByTypeParams,
    // ...payload
})
    
export const deletePageSchema = object({
    ...params
})