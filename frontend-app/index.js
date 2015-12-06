/* global Backbone $ */
'use strict'

require('./components/index.scss')

/* Used for debugging only */
function log () { // eslint-disable-line no-unused-vars
  return console.log.apply(console, arguments)
}

require('./components/router')

;(function main () {
  const navigationChannel = Backbone.Radio.channel('navigation')

  function setActiveLink(link) {
    $('li.active').removeClass('active')
    $(`a[href="#${link}"]`)
      .closest('li')
      .addClass('active')
  }

  function onPageView (route) {
    setActiveLink(route.link)
  }

  navigationChannel.on('change', onPageView)
  onPageView(navigationChannel.request('current-route'))
})()
