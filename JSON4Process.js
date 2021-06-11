const _ = require('lodash');

const parse = (obj, start = true) => {
    let newObj = obj;
    if (start)
        newObj = _.cloneDeep(obj);

    for (let prop in newObj) {
        if (typeof newObj[prop] === 'string') {
            let func = getFunctionBody(newObj[prop]);
            if (func) {
                newObj[prop] = eval(func);
            } else if (newObj[prop].match(/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d\d\dZ/)) {
                newObj[prop] = new Date(newObj[prop]);
            } else if (newObj[prop].match(/^\/[^\/]+\/([g]?[i]?[m]?[s]?[u]?[y]?)?$/)) {
                let [regex, flags] = newObj[prop].split('/').slice(1);
                newObj[prop] = new RegExp(regex, flags);
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

const getFunctionBody = (func) => {
    try { //arrow function
        if (!(eval(func) instanceof Function))
            throw 'error';
    } catch (err) { // normal function
        func = '(' + func + ')';
        try {
            eval(func)
        } catch (err) { // object method
            func = '(function ' + func.slice(1);
            try {
                eval(func);
            } catch (err) { // is not a function
                func = undefined;
            }
        }
    }
    return func;
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