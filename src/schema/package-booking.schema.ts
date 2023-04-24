import { object, string, ref, number, array, boolean } from "yup";

const payload = {
    body: object({
        package: string().required('package is required'),
        lockDown: boolean().required('lockDown is required as a boolean'),
        packageOwners: array(object({
            name: string().required('packagePlan.title is required'),
            email: string().required('packagePlan.description is required'),
            phone: string().required('packagePlan.description is required'),
        })).required('packageOwners is required as an array')
    })
}

const params = {
    params: object({
        bookingCode: string().required('bookingCode is required as a path param')
    })
}

export const createPackageBookingSchema = object({
   ...payload
});

export const getPackageBookingSchema = object({
    ...params,
})