import express from 'express';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

process.env["NODE_CONFIG_DIR"] =  path.join(__dirname, '..', 'config')
const config = require("config");

// import config from 'config';
import log from "./logger";
import connect from './db/connect'
import routes from './routes'
import { deserializeUser } from "./middleware";
import enableCors from './middleware/enableCors';

const port = config.get('port') as number;
const host = config.get('host') as string;

const app = express();
app.use(enableCors);
app.use(deserializeUser)
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }))
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

app.listen(port, host, () => {
    log.info(`server is listening at http://${host}:${port}`);
    connect();
    routes(app);
} )