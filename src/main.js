// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api

import VueDisqus from 'vue-disqus'
import 'katex/dist/katex.min.css'
import DefaultLayout from '~/layouts/Default.vue'
require("./code.css");


export default function (Vue, { router, head, isClient }) {
  head.link.push({
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css?family=Stylish&display=swap'
  }),
  head.link.push({
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css?family=IBM+Plex+Sans&display=swap'
  }),
  head.link.push({
    rel: 'favicon',
    href: 'https://res.cloudinary.com/adeshina/image/upload/v1597158363/x8kh4xqni1ktuc4mb3v7.ico'
  })
  head.meta.push({
    name: 'google-site-verification',
    content: 'sIbGxCmGnUobPKM6wa8WJZaHqfW7XJZP6WUEDaIo90o'
  }),
  // Set default layout as a global component
  Vue.component('Layout', DefaultLayout)
  Vue.use(VueDisqus)
}
