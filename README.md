# JSON4Process

[![GitHub](https://img.shields.io/badge/GitHub-v.0.2.2-blue.svg)](https://github.com/fuscoantonio/JSON4Process)
[![npm](https://img.shields.io/badge/npm-v.0.2.2-red.svg)](https://www.npmjs.com/package/json4process)  
A simple module to modify an object's properties of types such as Function, Date, RegExp and more to strings and back to their original data type while maintaining the object's structure. Useful for preventing data loss when sending objects to forked and spawned child processes.   

This module stringifies properties of these data types:
  - **Function**
  - **RegExp**
  - **Date**
  - **Set**
  - **Map**  

**Import:**
```javascript
    const JSON4Process = require('json4process');
```   
**Basic usage:**
```javascript
    let obj = {
        name: 'Jack',
        dateOfBirth: new Date(),
        regex: /something/g,
        func: () => { console.log('something') },
        parents: [
            {
                name: 'John',
                dateOfBirth: new Date(),
                regex: new RegExp(/nothing/),
                set: new Set([1, 2, 3, 4]),
                func: function (param) {
                    return param + 2;
                }
            },
            {
                name: 'Hannah',
                dateOfBirth: new Date(),
                regex: new RegExp(/anything/i),
                map: new Map(Object.entries({ one: 1, two: 2 })),
                func: (param, param2) => param + param2
            }
        ]
    }

    let convertedObj = JSON4Process.stringifyProps(obj);

    //result
    {
        name: 'Jack',
        dateOfBirth: '[Date instance]2021-06-11T18:48:22.834Z',
        regex: '[RegExp instance]/something/g',
        func: "[Function instance]() => { console.log('something') }",
        parents: [
            {
                name: 'John',
                dateOfBirth: '[Date instance]2021-06-11T18:48:22.834Z',
                regex: '[RegExp instance]/nothing/',
                set: '[Set instance][1,2,3,4]',
                func: '[Function instance]function (param) {\r\n' +
                    '                return param + 2;\r\n' +
                    '            }'
            },
            {
                name: 'Hannah',
                dateOfBirth: '[Date instance]2021-06-11T18:48:22.834Z',
                regex: '[RegExp instance]/anything/i',
                map: '[Map instance]{"one":1,"two":2}',
                func: '[Function instance](param, param2) => param + param2'
            }
        ]
    }
```
**Usage with child_process fork** 

After having stringified the object's properties it's ready to be sent as data to a child process.
```javascript
    const child = fork('filename.js');
    child.send(convertedObj); //convertedObj is the stringified object in the example above
```
And so we can parse back all object properties in the newly spawned process, like so:
```javascript
    process.on('message', (data) => {
        let originalObj = JSON4Process.parseProps(data);
        //Properties like Date, Function, etc. are back to their data type and can now be used as such
    });
```

**Usage with spawn or exec**

Since we need to stringify the whole object, we first stringify each property with JSON4Process and then we stringify the object itself.
```javascript
    //obj is the object in the first example in "Basic usage" at the top of this document
    let convertedObj = JSON.stringify(JSON4Process.stringifyProps(obj));
    const child = spawn('node', ['filename.js', convertedObj]);
```
Now we can parse object's properties in the spawned process.
```javascript
    let originalObj = JSON4Process.parseProps(JSON.parse(process.argv[2]));
```

**author:** [@fuscoantonio](https://github.com/fuscoantonio)
