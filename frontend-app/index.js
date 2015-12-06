/* global Backbone $ */
'use strict'

/* Used for debugging only */
function log () { // eslint-disable-line no-unused-vars
  return console.log.apply(console, arguments)
}

require('./components/router')

const Layout = require('./components/layout')

const DemoPageView = require('./components/demo-page/view')
const DemoPageModel = require('./components/demo-page/model')

const AccountView = require('./components/account/view')
const AccountModel = require('./components/account/model')

;(function main () {
  const navigationChannel = Backbone.Radio.channel('navigation')
  const layout = new Layout()

  /* Present the currently logged User-Account */
  /* TODO: Currently hard-coded, load the data from the Server */
  {
    const accountModel = new AccountModel({name: 'Atanas Atanasov'})
    const accountView = new AccountView({model: accountModel})
    layout.account.show(accountView)
  }

  /* This function is responsible for the page rendering as reaction of a URL change */
  const onPageView = (function onPageViewWrap () {
    /* Set some easy-to-spot style for the link that loaded the current page */
    function setActiveLink (link) {
      $('li.active').removeClass('active')
      $(`a[href="#${link}"]`)
        .closest('li')
        .addClass('active')
    }

    /* Print a demo content in our 'layout' in respect of the loaded page */
    function setMainContent (route) {
      const model = new DemoPageModel({
        title: `Loaded page: ${route.link}`,
        content: `Time at loading the page: ${new Date(route.time).toString()}`
      })

      const view = new DemoPageView({model: model})

      layout.content.show(view)
    }

    return function onPageView (route) {
      setActiveLink(route.link)
      setMainContent(route)
    }
  })()

  /*
    Be sure that there will be a rendered page on every update
    even if the Use clicked on preset link
  */
  navigationChannel.on('change', onPageView)
  onPageView(navigationChannel.request('current-route'))
})()
