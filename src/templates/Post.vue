<template>
  <Layout>
    <br>
    <a @click="$router.go(-1)" class="link" id="go-back" aria-label="Go back">&larr; Go Back</a>
    <div class="post-title">
      <h1>{{ $page.post.title }}</h1>
      <p class="post-date"> {{ $page.post.date }} | {{ $page.post.timeToRead }} min read</p>
    </div>
    <figure
        v-if="$page.post.image"
        class="flex flex-col"
    >
      <g-image
          :alt="$page.post.image.alt"
          :src="$page.post.image.path"
          class="mb-2"
      />
      <figcaption
          class="self-center image-caption mb-15"
          v-html="$page.post.image.caption"
      />
    </figure>
    <div class="post-content">
      <p v-html="$page.post.content"/>
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
    image {
      path
      caption
      alt
    }
  }
}
</page-query>

<script>
import moment from "moment";

export default {
  metaInfo() {
    return {
      title: this.$page.post.title,
      meta: [
        {
          name: "description",
          content: this.$page.post.excerpt
        },
        {
          name: "twitter:card",
          content: this.$page.post.image ? "summary_large_image" : "summary",
        },
        {
          name: "twitter:creator",
          content: "@kvng_zeez"
        },
        {
          name: "twitter:description",
          content: this.$page.post.excerpt
        },
        {
          name: "twitter:image",
          content: this.$page.post.image || ""
        },
        {
          name: "twitter:site",
          content: "@kvng_zeez"
        },
        {property: "og:type", content: "article"},
        {property: "og:title", content: this.$page.post.title},
        {property: "og:description", content: this.$page.post.excerpt},
        {
          property: "og:url",
          content: `${this.getBaseUrl}${this.$page.post.path}`
        },
      ],
      script: [{src: "https://platform.twitter.com/widgets.js", async: true}]
    };
  }
}
</script>

<style>

#go-back {
  cursor: pointer;
}

.post-title {
  text-align: center;
  font-size: 18px;
  line-height: 40px;
  padding: 2em 0;
  font-family: 'Stylish', serif;
}

.post-date {
  font-size: 16px;
  font-weight: 400;
}

.post-content {
  place-content: center;
  font-size: 20px;
  font-family: "IBM Plex Sans", 'Stylish', serif;
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
