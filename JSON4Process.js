const _ = require('lodash');

const parse = (obj, start = true) => {
    let newObj = obj;
    if (start)
        newObj = _.cloneDeep(obj);

    for (let prop in newObj) {
        if (typeof newObj[prop] === 'string') {
            let func = getFunction(newObj[prop]);
            let regex = getRegex(newObj[prop]);
            if (func) {
                newObj[prop] = func;
            } else if (regex) {
                newObj[prop] = regex;
            } else if (newObj[prop].match(/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d\d\dZ/)) {
                newObj[prop] = new Date(newObj[prop]);
            } else if (newObj[prop].startsWith('[object Set]')) {
                let set = newObj[prop].slice(12);
                set = parse(JSON.parse(set));
                newObj[prop] = new Set(set);
            } else if (newObj[prop].startsWith('[object Map]')) {
                let map = newObj[prop].slice(12);
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
        if (newObj[prop] instanceof Date)
            newObj[prop] = newObj[prop].toISOString();
        else if (newObj[prop] instanceof RegExp)
            newObj[prop] = newObj[prop].toString();
        else if (newObj[prop] instanceof Function)
            newObj[prop] = newObj[prop].toString();
        else if (newObj[prop] instanceof Set)
            newObj[prop] = '[object Set]' + JSON.stringify(stringify([...newObj[prop]], false));
        else if (newObj[prop] instanceof Map)
            newObj[prop] = '[object Map]' + JSON.stringify(stringify(Object.fromEntries(newObj[prop]), false));
        else if (typeof newObj[prop] === 'object')
            stringify(newObj[prop], false);
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

const getRegex = (str) => {
    try {
        let regex = str.slice(1, str.lastIndexOf('/'));
        let flags = str.slice(str.lastIndexOf('/') + 1);
        return new RegExp(regex, flags);
    } catch (err) { }
}

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