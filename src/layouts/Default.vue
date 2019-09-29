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
  padding: 0;
  padding-bottom: 20px;
  line-height: 1.5;
  border: 12px solid #1184e2;
  min-height: 100vh;
}

.layout {
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 0px;
}

.footer {
  padding-top: calc(30em / 4);
  text-align: center;
  font-size: 1em;
}

.link {
  border: 2px solid transparent;
  padding: 7px;
  color: #333;
  text-decoration: none;
}
</style>
