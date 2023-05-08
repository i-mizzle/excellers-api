import { object, string, ref, array } from "yup";

const payload = {
    body: object({
        title: string().required('title is required'),
        excerpt: string().max(250, 'excerpt is too long - should be 250 chars maximum.'),
        media: array(object({
            type: string().required('media.type is required as enum [eg: VIDEO, IMAGE, DOCUMENT]'),
            url: string().matches(
                /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
                'please use a valid url for media.url').required('media.url is required')
        })),
        authors: array(object({
            name: string().required('author.name is required'),
            designation: string()
        })).required('an array of authors is required'),
        coverImageUrl: string().matches(
            /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
            'please use a valid url for coverImageUrl'),
        body: string().required('body is required').min(120, 'body is too short - should be 120 chars minimum.')
    })
}

const params = {
    params: object({
        postId: string().required('post id is required')
    })
}

export const createPostSchema = object({
   ...payload
});

export const updatePostSchema = object({
    ...params,
    // ...payload
})

export const getPostSchema = object({
    ...params,
    // ...payload
})
    
export const deletePostSchema = object({
    ...params
})