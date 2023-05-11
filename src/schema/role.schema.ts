import { object, string, ref, number, array } from "yup";
import { foundDuplicateStrings } from "../utils/utils";

const payload = {
    body: object({
        name: string().required('role name (name) is required'),
        description: string(),
        permissions: array(string().required('please provide at least one permission for this role')).required('permissions is required as an array').test("validate-duplicate-permissions", "Your permissions array contains duplicates", function(value: any): boolean {
            const duplicatesFound = foundDuplicateStrings(value)
            if(duplicatesFound) {
                return true
            } else {
                return false
            }
        })
    })
}

const params = {
    params: object({
        roleId: string().required('role id is required as a path param')
    })
}

export const createRoleSchema = object({
   ...payload
});

    
export const deleteRoleSchema = object({
    ...params
})