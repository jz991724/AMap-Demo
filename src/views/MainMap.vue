/**
* MainMap.vue 高德地图
* @Author ZhangJun
* @Date  2024/4/14 19:27
**/
<template>
  <div>
    <div id="container"></div>

    <search-box :a-map="AMap"
                :map="map"
                size="large"
                style="width: 500px;position: absolute;top: 5px;left: 5px;"></search-box>
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
      AMap: undefined,
      map: null,
    };
  },
  methods: {
    initAMap() {
      const AMapKey = process.env.VUE_APP_AMAP_KEY;
      AMapLoader.load({
        key: AMapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
        version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: [
          'AMap.ElasticMarker',
          'AMap.Scale',
          'AMap.ToolBar',
          'AMap.HawkEye',
          'AMap.MapType',
          'AMap.Geolocation',
          'AMap.AutoComplete',
          'AMap.PlaceSearch',
        ], // 需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
      })
        .then((AMap) => {
          this.AMap = AMap;
          this.map = new AMap.Map('container', {
            // 设置地图容器id
            viewMode: '2D', // 是否为3D地图模式
            zoom: 11, // 初始化地图级别
            center: [116.397428, 39.90923], // 初始化地图中心点位置
          });

          // 添加控件
          // AMap.plugin(
          //   [
          //     'AMap.ElasticMarker',
          //     'AMap.Scale',
          //     'AMap.ToolBar',
          //     'AMap.HawkEye',
          //     'AMap.MapType',
          //     'AMap.Geolocation',
          //     'AMap.AutoComplete',
          //     'AMap.PlaceSearch',
          //   ],
          //   () => {
          //     // this.map.addControl(new AMap.ElasticMarker());
          //     // this.map.addControl(new AMap.Scale());
          //     // this.map.addControl(new AMap.ToolBar());
          //     // this.map.addControl(new AMap.HawkEye());
          //     // this.map.addControl(new AMap.MapType());
          //     // this.map.addControl(new AMap.Geolocation());
          //     this.map.addControl(new AMap.AutoComplete());
          //   },
          // );
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
  height: 100vh;
}
</style>
