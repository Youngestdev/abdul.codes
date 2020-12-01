// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

module.exports = {
  siteName: 'Abdul\'s Musings',
  siteUrl: 'blog.youngest.dev',
  siteDescription: 'A simple blog to pen my findings and idk idk.',
  plugins: [
    {
      use: '@gridsome/source-filesystem',
      options: {
        path: 'content/posts/**/*.md',
        typeName: 'Post',
        route: '/read/:slug'
      }
    },
    {
      use: '@gridsome/plugin-sitemap',
      options: {
        exclude: ['/404'],
      	include: ['/read/**', '/']
      }
    }	 
  ],
  transformers: {
    //Add markdown support to all file-system sources
    remark: {
      externalLinksTarget: '_blank',
      externalLinksRel: ['nofollow', 'noopener', 'noreferrer'],
      plugins: [
        'gridsome-plugin-remark-prismjs-all'
      ]
    }
  },
}
