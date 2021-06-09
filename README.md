# JSON4Process

[![GitHub](https://img.shields.io/badge/GitHub-v.0.1.6-red.svg)](https://github.com/fuscoantonio/JSON4Process)  
A simple module to modify an object's properties of types such as Function, Date or RegExp to strings and back to their original data type while maintaining the object's structure. Useful when sending objects as data to forked and spawned child processes.   

This module stringifies properties of these data types:
  - **Function**
  - **RegExp**
  - **Date**

**Import:**
```javascript
    const JSON4Process = require('json4process');
```   
**Basic usage:**
```javascript
    let obj = {
    name: 'Jack',
    dateOfBirth: new Date(),
    regex: new RegExp(/something/g),
    func: () => { console.log('something') },
    parents: [
            {
                name: 'John',
                dateOfBirth: new Date(),
                regex: new RegExp(/nothing/),
                func: function (param) {
                    return param + 2;
                }
            },
            {
                name: 'Ashley',
                dateOfBirth: new Date(),
                regex: new RegExp(/anything/i),
                func: (param, param2) => param + param2
            }
        ]
    }

    let convertedObj = JSON4Process.stringifyProps(obj);

    //result
    {
        name: 'Jack',
        dateOfBirth: '2021-06-09T18:51:12.814Z',
        regex: '/something/g',
        func: "-this_is_a_function-  console.log('something') ",
        parents: [
            {
                name: 'John',
                dateOfBirth: '2021-06-09T18:51:12.814Z',
                regex: '/nothing/',
                func: '-this_is_a_function-param \r\n' +
                    '                return param + 2;\r\n' +
                    '            '
            },
            {
                name: 'Ashley',
                dateOfBirth: '2021-06-09T18:51:12.814Z',
                regex: '/anything/i',
                func: '-this_is_a_function-param,param2 return  param + param2'
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
And so we can "objectify" back all object properties in the newly spawned process, like so:
```javascript
    process.on('message', (data) => {
        let newData = JSON4Process.objectifyProps(data);
        //Function, Date and RegExp properties are back to their data type and can now be used as such
    });
```

**Usage with spawn or exec**

Since we need to stringify the whole object, we first stringify each property with JSON4Process and then we stringify the object itself.
```javascript
    //obj is the object in the first example in "Basic usage" at the top of this document
    let convertedObj = JSON.stringify(JSON4Process.stringifyProps(obj));
    const child = spawn('node', ['filename.js', convertedObj]);
```
Now we can "objectify" object's properties in the spawned process.
```javascript
    let newData = JSON4Process.objectifyProps(JSON.parse(process.argv[2]));
```

**author:** [@fuscoantonio](https://github.com/fuscoantonio), antonio.fusco1992@gmail.com
