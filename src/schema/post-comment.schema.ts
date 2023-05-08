import { object, string, ref, array } from "yup";

const payload = {
    body: object({
        comment: string().max(250, 'excerpt is too long - should be 250 chars maximum.'),
        author: object({
            name: string().required('author.name is required'),
            designation: string()
        }).required('comment author (author) is required')
    })
}

const params = {
    params: object({
        postId: string().required('post id is required as a path param')
    })
}

const commentParams = {
    params: object({
        postCommentId: string().required('post comment id is required as a path param')
    })
}

export const createPostCommentSchema = object({
    ...params,
    ...payload
});

export const updatePostCommentSchema = object({
    ...commentParams,
})

export const getPostCommentsSchema = object({
    ...params,
    // ...payload
})
    
export const deletePostCommentSchema = object({
    ...commentParams
})