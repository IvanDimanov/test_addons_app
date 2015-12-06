'use strict'

require('./components/index.scss')

/* Used for debugging only */
function log () { // eslint-disable-line no-unused-vars
  return console.log.apply(console, arguments)
}

import getKey from './components/get-key'


log(getKey)
