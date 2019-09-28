<template>
  <div class="layout">
    <slot/>
  </div>
</template>

<style>
body {
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  margin: 0 auto;
  padding: 0;
  line-height: 1.5;
  border: 15px solid #fecd43;
  min-height: 100vh;
  width: fit-content;
}

.layout {
  max-width: max-content;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
}

.footer {
  padding-top: calc(30em / 4);
  text-align: center;
  font-size: 1em;
}

.link {
  border: 2px dashed #fecd43;
  padding: 7px;
  color: #333;
  text-decoration: none;
}
</style>
