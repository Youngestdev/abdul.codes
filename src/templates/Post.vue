<template>
  <Layout>
    <br>
    <g-link to="/" class="link">  &larr; Go Back</g-link>
    <div class="post-title">
      <h1>{{$page.post.title}}</h1>
      <p class="post-date"> {{ $page.post.date}} | {{$page.post.timeToRead}} min read</p>
    </div>
    <div class="post-content">
      <p v-html="$page.post.content" />
      <hr/>
      <vue-disqus shortname="youngestdev" :identifier="$page.post.title"></vue-disqus>
    </div>
  </Layout>
</template>

<page-query>
query Post ($path: String!) {
   post: post (path: $path) {
    id
    title
    content
    date (format: "D MMMM YYYY")
    timeToRead
  }
}
</page-query>

<style>

.post-title {
  text-align: center;
  font-size: 18px;
  line-height: 40px;
  padding: 2em 0;
  font-family: 'Stylish';
}

.post-date {
  font-size: 16px;
  font-weight: 400;
}

.post-content {
  font-size: 20px;
  font-family: "IBM Plex Sans", 'Stylish';
  max-width: 100%;
  width: auto;
  overflow: auto;  
}

pre {
    background: navajowhite;
    display: block;
    border: #333333 1px solid;
    padding: 10px;
    margin: 0 auto;
    overflow: auto;
    overflow-scrolling: auto;
    overflow-style: marquee-block;
    /*font-family: ;*/
}

code {
    display: inline-block;
    font-weight: bold;
    font-family: "Khmer Mondulkiri",sans-serif;
}

img {
    display: block;
    margin: auto auto;
    max-width: 100%;
    height: auto;
}
</style>