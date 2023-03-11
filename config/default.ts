export default {
    port: process.env.PORT,
    host: process.env.HOST,
    dbUri:  process.env.DB_URI,
    saltWorkFactor: process.env.SALT_WORK_FACTOR,
    privateKey: process.env.HASH_PRIVATE_KEY,
    accessTokenTtl: process.env.ACCESS_TOKEN_TTL,
    refreshTokenTtl: process.env.REFRESH_TOKEN_TTL,
    resetTokenTtl: process.env.RESET_TOKEN_TTL,
    confirmationTokenTtl: process.env.CONFIRMATION_TOKEN_TLL,
    googleApiKey: process.env.GOOGLE_API_KEY,
    mailgun: {
        API_KEY: process.env.MAILGUN_API_KEY,
        DOMAIN: process.env.MAILGUN_DOMAIN,
        API_BASEURL: process.env.MAILGUN_API_BASEURL
    }, 
    africasTalking: {
        API_KEY: process.env.AFRICASTALKING_API_KEY,
        USERNAME: process.env.AFRICASTALKING_USERNAME,
        URL: process.env.AFRICASTALKING_BASE_URL
    },
    flutterwave: {
        SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY,
        PUBLIC_KEY: process.env.FLUTTERWAVE_PUBLIC_KEY,
        ENCRYPTION_KEY: process.env.FLUTTERWAVE_ENCRYPTION_KEY,
        WEBHOOK_HASH: process.env.FLUTTERWAVE_WEBHOOK_HASH
    },
    cloudinary:{
        CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        API_KEY: process.env.CLOUDINARY_API_KEY,
        API_SECRET: process.env.CLOUDINARY_API_SECRET 
    }
}