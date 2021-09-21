const _ = require('lodash');
const moment = require('moment');

const parse = (obj, start = true) => {
    let newObj = obj;
    if (start)
        newObj = _.cloneDeep(obj);

    for (let prop in newObj) {
        if (typeof newObj[prop] === 'string') {
            if (newObj[prop].startsWith('[Date instance]')) {
                newObj[prop] = new Date(newObj[prop].slice(15));
            } else if (newObj[prop].startsWith('[Moment instance]')) {
                newObj[prop] = moment.parseZone(newObj[prop].slice(17));
            } else if (newObj[prop].startsWith('[RegExp instance]')) {
                let [regex, flags] = newObj[prop].slice(17).split('/').slice(1);
                newObj[prop] = new RegExp(regex, flags);
            } else if (newObj[prop].startsWith('[Function instance]')) {
                newObj[prop] = getFunction(newObj[prop].slice(19));
            } else if (newObj[prop].startsWith('[Set instance]')) {
                let set = newObj[prop].slice(14);
                set = parse(JSON.parse(set));
                newObj[prop] = new Set(set);
            } else if (newObj[prop].startsWith('[Map instance]')) {
                let map = newObj[prop].slice(14);
                map = Object.entries(parse(JSON.parse(map)));
                newObj[prop] = new Map(map);
            }
        } else if (typeof newObj[prop] === 'object') {
            parse(newObj[prop], false);
        }
    }

    return newObj;
}

/**
 * Returns an object with all properties previously stringified changed back to their original data type (Function, Date, RegExp).
 * @param {{}} obj A JavaScript object to be converted.
 */
const parseProps = (obj) => {
    return parse(obj);
}


const stringify = (obj, start = true) => {
    let newObj = obj;
    if (start)
        newObj = _.cloneDeep(obj);

    for (let prop in newObj) {
        if (newObj[prop] instanceof Date) {
            newObj[prop] = '[Date instance]' + newObj[prop].toISOString();
        } else if (newObj[prop] instanceof moment) {
            newObj[prop] = '[Moment instance]' + newObj[prop].toISOString(true);
        } else if (newObj[prop] instanceof RegExp) {
            newObj[prop] = '[RegExp instance]' + newObj[prop].toString();
        } else if (newObj[prop] instanceof Function) {
            newObj[prop] = '[Function instance]' + newObj[prop].toString();
        } else if (newObj[prop] instanceof Set) {
            newObj[prop] = '[Set instance]' + JSON.stringify(stringify([...newObj[prop]], false));
        } else if (newObj[prop] instanceof Map) {
            newObj[prop] = '[Map instance]' + JSON.stringify(stringify(Object.fromEntries(newObj[prop]), false));
        } else if (typeof newObj[prop] === 'object') {
            stringify(newObj[prop], false);
        }
    }

    return newObj;
}

const getFunction = (funcStr) => {
    let func;
    try { //arrow function
        func = eval(funcStr);
        if (!(func instanceof Function))
            throw 'error';
    } catch (err) { // normal function
        funcStr = '(' + funcStr + ')';
        try {
            func = eval(funcStr);
        } catch (err) { // object method
            funcStr = '(function ' + funcStr.slice(1);
            try {
                func = eval(funcStr);
            } catch (err) { // is not a function
                func = undefined;
            }
        }
    }
    return func;
}

// const getRegex = (str) => {
//     try {
//         let lastCharsAreFlags = str.slice(str.lastIndexOf('/') + 1).split('').every(letter => letter.match(/[gimsuy]/));
//         if (str.charAt(0) === '/' && str.lastIndexOf('/') !== 0 && lastCharsAreFlags) {
//             let regex = str.slice(1, str.lastIndexOf('/'));
//             let flags = str.slice(str.lastIndexOf('/') + 1);
//             return new RegExp(regex, flags);
//         }
//     } catch (err) { }
// }

/**
 * Returns an object with all properties converted to strings and ready to be sent to a child process.
 * @param {{}} obj A JavaScript object to be converted.
 */
const stringifyProps = (obj) => {
    return stringify(obj);
}


module.exports = {
    stringifyProps,
    parseProps
}