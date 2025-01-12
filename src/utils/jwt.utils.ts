import jwt from 'jsonwebtoken';
import config from 'config';

const privateKey = config.get('privateKey') as string;

export function sign(object: Object, privateKey: jwt.Secret, options?: jwt.SignOptions | undefined) {
    return jwt.sign(object, privateKey, options);
}

export function decode(token: string) {
    try {
        const decoded = jwt.verify(token, privateKey);

        return {valid: true, expired: false, decoded}
    } catch (error:any) {
        return {
            valid: false,
            expired: error.message === 'jwt.expired',
            decoded: null
        }
    }
}