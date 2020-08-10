<template>
  <Layout>
    <br>
    <a @click="$router.go(-1)" class="link" aria-label="Go back">&larr; Go Back</a>
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
  font-family: 'Stylish',serif;
}

.post-date {
  font-size: 16px;
  font-weight: 400;
}

.post-content {
  place-content: center;
  font-size: 20px;
  font-family: "IBM Plex Sans", 'Stylish',serif;
  max-width: 100%;
  width: auto;
  overflow: auto;
}

img {
    display: block;
    margin: auto auto;
    max-width: 100%;
    height: auto;
}
</style>