/* global Backbone */
'use strict'

require('./style.scss')

module.exports = Backbone.Marionette.Application.extend({
  el: 'body',

  regions: {
    navigation: 'nav.navbar',
    sideLinks: 'nav.side-links',
    content: 'main'
  }
})
