<template>
  <div class="layout">
    <slot/>
    <div class="footer">
      <p>
        Check my <a class="link" href="//github.com/Youngestdev">GitHub</a>
      </p>
    </div>
  </div>
</template>

<style>
html {
  box-sizing: border-box;
}

*, *:before, *::after {
  box-sizing: inherit;
}
body {
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  margin: 0;
  padding: 0 0 20px;
  line-height: 1.5;
  border: 12px solid #1184e2;
  min-height: 100vh;
}

.layout {
  width: auto;
  max-width: 800px;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
}

.footer {
  padding-top: calc(30em / 4);
  text-align: center;
  font-size: 1.7em;
  font-family: "Stylish";
}

.link {
  border: 2px solid transparent;
  padding: 7px;
  color: #333;
  text-decoration: none;
}

pre {
  font-size: 15px;
  padding: 1em;
  margin: 0.5em  0;
  overflow: auto;
}

</style>
