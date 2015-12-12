'use strict'

import {exec} from 'child_process'
import chokidar from 'chokidar'
import {argv} from 'yargs'
import {debounce, toString} from './utils'

/* Collect callee 'watch' path and 'command' to be executed on change */
const {watch, command} = argv
const timeout = 1000

chokidar.watch(toString(watch), {
  ignoreInitial: true /* Ignore initial adds of watched paths */
})
/*
  Call the specified command on every type of updates but
  no more than once every 'timeout' [milliseconds]
*/
.on('all', debounce((event, path) => {
  console.log(event, path)
  exec(toString(command), error => error && console.log(error))
}, timeout))
