<template>
  <a-locale-provider :locale="locale">
    <div id="app">
      <router-view/>
    </div>
  </a-locale-provider>
</template>

<script lang="js">
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN';

export default {
  data() {
    return {
      locale: zhCN,
    };
  },
  mounted() {
    document.title = window.mapConfig.projectName;
  },
};
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body {
  overflow: hidden;
  padding: 0;
  margin: 0;
}
</style>
