import { Request, Response } from "express";
import * as response from '../responses'
 
export const  readLogFile = (req: Request, res: Response) => {
    // Read the log file using appropriate file handling mechanisms
    // For simplicity, let's assume the logs are stored in a file called 'logs.log'
    const fs = require('fs');
    const fileContents = fs.readFileSync('logs.log', 'utf8');
    return response.ok(res, {logs: fileContents})
}