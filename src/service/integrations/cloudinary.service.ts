
const config = require("config")
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
import multer from "multer";

cloudinary.config({ 
    cloud_name: config.cloudinary.CLOUD_NAME, 
    api_key: config.cloudinary.API_KEY, 
    api_secret: config.cloudinary.API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "mmsquare-files",
    },
});

export const upload = multer({ storage: storage });

export interface MulterRequest extends Request {
    file: any;
}

// export const uploadFile = async (fileInput: any) => {
//     // cloudinary.uploader.upload(fileInput).then((result: any) => {
//     //     return {
//     //         error: false,
//     //         errorType: "",
//     //         data: result,
//     //     }
//     // }).catch((error: any) => {
//     //     return {
//     //         error: true,
//     //         errorType: "error",
//     //         data: error,
//     //     }
//     // });

//     try {
//         multer({ storage: storage });
//         const result = await cloudinary.uploader.upload(fileInput)
//         return {
//             error: false,
//             errorType: "",
//             data: result
//         }
//     } catch (error: any) {
//         return {
//             error: true,
//             errorType: "error",
//             data: error.message,
//         }
//     }
// }