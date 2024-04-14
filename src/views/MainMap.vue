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
                style="position: absolute;top: 5px;left: 5px;"></search-box>

    <info-table handleDirection="left" ref="infoTable" title="信息表"></info-table>
  </div>
</template>

<script lang="js">
import { defineComponent } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';
import SearchBox from '@/components/SearchBox.vue';
import InfoTable from '@/components/InfoTable.vue';

export default defineComponent({
  name: 'MainMap',
  components: {
    InfoTable,
    SearchBox,
  },
  data() {
    return {
      AMap: undefined,
      map: undefined,
      district: undefined, // 行政区
      districtPolygon: undefined, // 行政区边界
    };
  },
  methods: {
    initAMap() {
      const { AMapKey } = window.mapConfig;
      AMapLoader.load({
        key: AMapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
        version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: [
          'AMap.ElasticMarker',
          'AMap.Scale',
          'AMap.ToolBar',
          'AMap.DistrictSearch',
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

          // 绘制行政区边界
          this.drawBoundsByDistrictName(window?.mapConfig?.districtName || '全国');

          this.openInfoTable();
        })
        .catch((e) => {
          console.error(e);
        });
    },
    openInfoTable() {
      const { infoTable } = this.$refs;
      if (infoTable) {
        infoTable.openDrawer(this.AMap, this.map);
      }
    },
    /**
     * 通过行政区名称绘制边界线
     * @param districtName
     */
    drawBoundsByDistrictName(districtName) {
      // 加载行政区划插件
      if (!this.district) {
        // 实例化DistrictSearch
        const opts = {
          subdistrict: 0, // 获取边界不需要返回下级行政区
          extensions: 'all', // 返回行政区边界坐标组等具体信息
          level: 'district', // 查询行政级别为 市
        };
        this.district = new this.AMap.DistrictSearch(opts);
      }
      // 行政区查询
      this.district.setLevel('city');
      this.district.search(districtName, (status, result) => {
        if (this.districtPolygon) {
          this.map.remove(this.districtPolygon);// 清除上次结果
          this.districtPolygon = null;
        }
        if (!result || !result.districtList || !result.districtList[0]) {
          console.warn(`无法找到${districtName}行政区`);
          return;
        }
        const bounds = result.districtList[0].boundaries;
        if (bounds) {
          // 生成行政区划polygon
          for (let i = 0; i < bounds.length; i += 1) { // 构造MultiPolygon的path
            bounds[i] = [bounds[i]];
          }
          this.districtPolygon = new this.AMap.Polygon({
            strokeWeight: 1,
            path: bounds,
            fillOpacity: 0.4,
            fillColor: '#80d8ff',
            strokeColor: '#0091ea',
          });
          this.map.add(this.districtPolygon);
          this.map.setFitView(this.districtPolygon);// 视口自适应
        }
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
