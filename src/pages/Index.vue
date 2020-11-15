<template>
  <Layout>
    <header class="header">
      <h1 v-html="$page.metaData.siteName" />
      <p v-html="$page.metaData.siteDescription" />
    </header>
    <section class="posts">
      <PostList v-for="edge in $page.allPost.edges" :key="edge.node.id" :post="edge.node" />
      <br />
      <hr />
      <Pager :info="$page.allPost.pageInfo" class="nav"/>
    </section>
  </Layout>
</template>

<script>
import PostList from "@/components/PostList";
import { Pager } from 'gridsome';

export default {
  components: {
    PostList,
    Pager
  },
  metaInfo: {
    title: "Blog"
  }
};
</script>

<page-query>
query ($page: Int) {
  metaData {
    siteName
    siteDescription
  }
  allPost(perPage: 5, page: $page) @paginate {
    totalCount
    pageInfo {
      totalPages
      currentPage
    }
    edges {
      node {
        id
        title
        timeToRead
        description
        date (format: "D MMMM YYYY")
        path
      }
    }

  }
}
</page-query>

<style>
.header {
  font-family: "Stylish",serif;
  font-size: 15px;
  text-align: center;
  line-height: 20px;
}

.header p {
  font-weight: 100;
}

.pag-link {
  border-radius: 4px;
}

.pag-link.active {
  border-radius: 4px;
}

.nav {
  display: inline-block;
  place-items: center;
}

.nav a {
  color: black;
  float: left;
  padding: 8px 16px;
  text-decoration: none;
}

.nav a.active {
  background-color: #1184e2;
  border-radius: 5px;
}

.nav a:hover:not(.active) {
  background-color: lightblue;
  border-radius: 5px;
}

</style>
