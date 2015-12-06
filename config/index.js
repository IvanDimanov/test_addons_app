/* Transform all the code from 'index.es6' and execute it here so the callee will access all of its exports */
var transformedCode = require('babel-core').transformFileSync(__dirname + '/index.es6', {presets: ['es2015', 'stage-0', 'stage-1', 'stage-2', 'stage-3']}).code
new Function('exports, require, module, __filename, __dirname', transformedCode).apply(null, [exports, require, module, __filename, __dirname])
