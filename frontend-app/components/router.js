/* global Backbone Marionette */
'use strict'

;(function routing () {
  const navigationChannel = Backbone.Radio.channel('navigation')

  let currentRoute = {}
  const Router = Marionette.AppRouter.extend({
    routes: {
      '': 'homePage',
      'tickets': 'tickets',
      'channels': 'channels',
      'users': 'users',
      'features': 'features',
      'personal': 'personal'
    },

    homePage () {
      navigationChannel.trigger('change', currentRoute = {
        link: 'homePage',
        time: Date.now()
      })
    },

    tickets () {
      navigationChannel.trigger('change', currentRoute = {
        link: 'tickets',
        time: Date.now()
      })
    },

    channels () {
      navigationChannel.trigger('change', currentRoute = {
        link: 'channels',
        time: Date.now()
      })
    },

    users () {
      navigationChannel.trigger('change', currentRoute = {
        link: 'users',
        time: Date.now()
      })
    },

    features () {
      navigationChannel.trigger('change', currentRoute = {
        link: 'features',
        time: Date.now()
      })
    },

    personal () {
      navigationChannel.trigger('change', currentRoute = {
        link: 'personal',
        time: Date.now()
      })
    }
  })

  navigationChannel.reply('current-route', () => currentRoute)

  const router = new Router() // eslint-disable-line no-unused-vars
  Backbone.history.start()
})()
