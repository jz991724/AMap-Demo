/**
* MainMap.vue 高德地图
* @Author ZhangJun
* @Date  2024/4/14 19:27
**/
<template>
  <div id="container">
    <search-box></search-box>
  </div>
</template>

<script lang="js">
import { defineComponent } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';
import SearchBox from '@/components/SearchBox.vue';

export default defineComponent({
  name: 'MainMap',
  components: { SearchBox },
  data() {
    return {
      map: null,
    };
  },
  methods: {
    initAMap() {
      const AMapKey = process.env.VUE_APP_AMAP_KEY;
      AMapLoader.load({
        key: AMapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
        version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ['AMap.Scale'], // 需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
      })
        .then((AMap) => {
          this.map = new AMap.Map('container', {
            // 设置地图容器id
            viewMode: '2D', // 是否为3D地图模式
            zoom: 11, // 初始化地图级别
            center: [116.397428, 39.90923], // 初始化地图中心点位置
          });
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
  mounted() {
    this.initAMap();
  },
  unmounted() {
    this.map?.destroy();
  },
});
</script>

<style scoped lang="less">
#container {
  padding: 0;
  margin: 0;
  width: 100vw;
  height:100vh;
}
</style>
