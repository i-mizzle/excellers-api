import { StringDate } from "./types";

export const generateCode = (length: Number, isNumeric: Boolean): string => {
    if (!isNumeric) { isNumeric = false }
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    if (isNumeric) {
        characters = '0123456789';
    }
    var charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// export const formatPhoneNumber = (phoneNumber: string): string => {
//   let formatted = phoneNumber
//   if(phoneNumber.charAt(0) === '+') {
//     const substring = phoneNumber.slice(4);
//     formatted = '0'+substring
//   } 
//   return formatted

// }

export const parseResponse = (data: any) => {
    try {
      data = JSON.parse(data);
      // console.log('IN PARSE FUNCTION ===>', data)
      return data;
    } catch (error: any) {
        console.log('=====< PARSE ERROR=====>', JSON.parse(error) || JSON.parse(error.body))
    }
    // return data;
  };

const Buffer = require("buffer/").Buffer;

export const  _encodeUrl = function(url: any) {
  return encodeURIComponent(url);
};

// Base 64
export const  getBase64 = function(str: string) {
  return new Buffer(str).toString("base64");
};

export const  getPassportHeader = function(clientid: any, secret: any) {
  return getBase64(clientid + ":" + secret);
};

export const  encodeExtraData = function(extraData: any) {
  var encoded: any = "";
  for (var i = 0, lens = extraData.length; i < lens; i++) {
    encoded += _encodeUrl(extraData[i]) + "&";
  }
  return (encoded = encoded.substr(0, encoded));
};

export const slugify = (string: string) => {
  return string
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export const errorResponse = (message: any) => {
  return {
    success: false,
    error: message
  };
};

export const messageResponse = (message: any) => {
  return {
    success: true,
    message: message
  };
};

export const dataResponse = (message: any, data: any) => {
  return {
    success: true,
    message: message,
    data: data
  };
};

export const isInArray = (value: any, array: any) => {
  if (Array.isArray(array)) {
    return array.includes(value);
  } else {
    return false;
  }
};

export function isValidEmail(email: string) {
  const valid = new RegExp(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  return valid.test(email);
}

export function isValidPhoneNumber(phone: string) {
  const valid = RegExp(/^\d{4}\d{3}\d{4}$/);
  return valid.test(phone);
}

export function getDateStringFromTime(time: string) {
  let currentDate = new Date(time);
  return currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear();
}

export const validatePhoneNumber = (phoneString: string) => {
  if (!isValidPhoneNumber(phoneString)) {
    throw new Error("Invalid phone number");
  }
};

export const validateEmailString = (emailString: string) => {
  console.log(emailString);

  if (!isValidEmail(emailString)) {
    throw new Error("Invalid email address");
  }
};

export const validateNameString = (label: any, nameString: any) => {
  if (nameString.length < 2) {
    throw new Error(`${label} must be at least 2 characters long.`);
  }
};

export const validateFullNameString = (label: any, nameString: any) => {
  if (nameString.length < 2) {
    throw new Error(`${label} must be at least 2 characters long.`);
  }
};

export const validateRequiredProperty = (label: any, objectString: any) => {
  if (objectString == null || objectString == undefined || objectString == "undefined") {
    throw new Error(`${label} must be provided.`);
  }
};

export const validateRequiredStringProperty = (label: any, objectString: any) => {
  if (objectString == null || objectString == undefined || objectString == "undefined") {
    throw new Error(`${label} must be provided.`);
  }
  if (typeof objectString != "string") {
    throw new Error(`${label} has an invalid data type.`);
  }
};

export const validateRequiredNumericProperty = (label: any, objectString:any) => {
  objectString = +objectString;
  if (objectString == null || objectString == undefined || objectString == "undefined") {
    throw new Error(`${label} must be provided.`);
  }
  if (typeof objectString != "number") {
    throw new Error(`${label} has an invalid data type.`);
  }
};

export function addDays(numOfDays: number, date = new Date()) {
  const dateCopy = new Date(date.getTime());

  dateCopy.setDate(dateCopy.getDate() + numOfDays);

  return dateCopy;
}

export const formatPhone = (phone: string) => {
  let formatted =""
  if (!phone || phone === '') {
      return ""
  }

  if (phone.charAt(0) === '0') {
      formatted = '+234' + phone.substring(1)
  } else {
      formatted = phone
  }

  return formatted
}


export const formatPhoneNumber = (phoneNumber: string): string => {
  let formatted = phoneNumber
  if(phoneNumber.charAt(0) === '+') {
    const substring = phoneNumber.slice(4);
    formatted = '0'+substring
  } 
  return formatted

}

export const addMinutesToDate = (date: Date, minutes: number) => {
  date.setMinutes(date.getMinutes() + minutes);

  return date;
}

export const snakeToCamel = (obj: Record<string, any>): Record<string, any> => {
  if(!obj) {
    return {}
  }

  const camelObj: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_\w/g, (match) => match[1].toUpperCase());
    if (Array.isArray(value)) {
      camelObj[camelKey] = value.map((item) =>
        typeof item === "object" ? snakeToCamel(item) : item
      );
    } else {
      camelObj[camelKey] =
        typeof value === "object" ? snakeToCamel(value) : value;
    }
  }

  return camelObj;
}


export const getJsDate = (stringDate: StringDate): Date => {
  if (!stringDate) return new Date()

  var dateParts: any = stringDate.split("-");

  // month is 0-based, that's why we need dataParts[1] - 1
  var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]); 

  return dateObject;
}