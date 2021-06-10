const _ = require('lodash');

const parse = (obj, start = true) => {
    let newObj = obj;
    if (start)
        newObj = _.cloneDeep(obj);

    for (let prop in newObj) {
        if (typeof newObj[prop] === 'string' && newObj[prop].match(/-\d\dT\d\d:\d\d:/)) {
            newObj[prop] = new Date(newObj[prop]);
        } else if (typeof newObj[prop] === 'string' && newObj[prop].match(/^\/.+\//)) {
            let [regex, flags] = newObj[prop].split('/').slice(1);
            newObj[prop] = new RegExp(regex, flags);
        } else if (typeof newObj[prop] === 'string' && newObj[prop].startsWith('-this_is_a_function-')) {
            let func = newObj[prop].slice(20);
            let params = func.split(' ')[0].split(',');
            let funcBody = func.split(' ').slice(1).join(' ');
            newObj[prop] = new Function(...params, funcBody);
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

    const getArrowFuncParams = (func) => {
        let params;
        if (func.indexOf('(') < func.indexOf('=>')) { //arrow function with parenthesis for params
            params = func.slice(func.indexOf('(') + 1, func.indexOf(')')).replace(/ /g, '');
        } else { //arrow function without parenthesis for single param
            params = func.slice(0, func.indexOf('=>')).replace(/ /g, '');
        }
        return params;
    }

    const getArrowFuncBody = (func) => {
        let funcBody;
        if (func.indexOf('{') === -1 || func.indexOf('{') > func.slice(func.indexOf('=>') + 2).indexOf('(') && func.slice(func.indexOf('=>' + 2)).indexOf('(') !== -1) { //arrow function with one statement
            funcBody = 'return ' + func.slice(func.indexOf('=>') + 2);
        } else { //arrow function with multiple statements
            funcBody = func.slice(func.indexOf('{') + 1, func.lastIndexOf('}'));
        }
        return funcBody;
    }

    for (let prop in newObj) {
        if (newObj[prop] instanceof Date)
            newObj[prop] = newObj[prop].toISOString();
        else if (newObj[prop] instanceof RegExp)
            newObj[prop] = newObj[prop].toString();
        else if (newObj[prop] instanceof Function) {
            let func = newObj[prop].toString();
            let params, funcBody;
            if (func.indexOf('=>') !== -1) { //arrow function
                params = getArrowFuncParams(func);
                funcBody = getArrowFuncBody(func);
            } else {
                params = func.slice(func.indexOf('(') + 1, func.indexOf(')')).replace(/ /g, '');
                funcBody = func.slice(func.indexOf('{') + 1, func.lastIndexOf('}'));
            }
            newObj[prop] = '-this_is_a_function-' + params + ' ' + funcBody;
        }
        else if (typeof newObj[prop] === 'object')
            stringify(newObj[prop], false);
    }

    return newObj;
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
