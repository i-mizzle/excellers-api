import { object, string, ref, number, array } from "yup";

const payload = {
    body: object({
        name: string().required('permission name is required'),
        marginType: string().required('marginType type is required as PERCENTAGE or FLAT'),
        flightType: string().required('flightType type is required as INTERNATIONAL or LOCAL'),
        value: number().required('value is required')    
    })
}

const params = {
    params: object({
        marginId: string().required('margin id is required as a path param')
    })
}

export const createMarginSchema = object({
   ...payload
});

export const getMarginSchema = object({
    ...params,
})