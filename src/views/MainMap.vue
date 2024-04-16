/**
* MainMap.vue 高德地图
* @Author ZhangJun
* @Date  2024/4/14 19:27
**/
<template>
  <div>
    <div id="container"></div>

    <nav-bar v-if="visiblePlugs.includes('navBar')" :a-map="AMap"
             :map="map"
             :district-name="districtName"
             :layers="layers"
             :mask="mask"
             style="position: absolute;top: 0;left: 0;"></nav-bar>

    <search-box v-if="visiblePlugs.includes('searchBox')" :a-map="AMap"
                :map="map"
                size="large"
                style="position: absolute;top: 70px;left: 10px;"></search-box>

    <info-table v-if="visiblePlugs.includes('infoTable')" handleDirection="left"
                ref="infoTable"></info-table>
    <position-box v-if="visiblePlugs.includes('positionBox')" :a-map="AMap"
                  :map="map"
                  style="position: absolute;bottom: 10px;right: 10px;"></position-box>
  </div>
</template>

<script lang="js">
import { defineComponent } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';
import SearchBox from '@/components/SearchBox.vue';
import InfoTable from '@/components/InfoTable.vue';
import NavBar from '@/views/NavBar.vue';
import PositionBox from '@/components/PositionBox.vue';

export default defineComponent({
  name: 'MainMap',
  components: {
    PositionBox,
    NavBar,
    InfoTable,
    SearchBox,
  },
  data() {
    return {
      AMap: undefined,
      map: undefined,
      districtPlug: undefined, // 行政区插件
      districtPolygon: undefined, // 行政区边界
      districtName: window.mapConfig.districtName, // 行政区名称
      layers: {
        default: undefined,
        realTime: undefined,
        satellite: undefined,
      }, // 可以被切换的图层
      visiblePlugs: window.mapConfig.visiblePlugs,
      mask: undefined, // 掩模
    };
  },
  methods: {
    initAMap() {
      const {
        AMapKey,
        securityJsCode,
      } = window.mapConfig;
      // 这个配置很重要，必须设置，否则你的 行政服务搜索api无法使用生成回调
      // eslint-disable-next-line no-underscore-dangle
      window._AMapSecurityConfig = {
        securityJsCode,
      };

      AMapLoader.load({
        key: AMapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
        version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: [
          'AMap.Scale',
          'AMap.ToolBar',
          'AMap.DistrictSearch',
          'AMap.Weather',
          'AMap.Geolocation',
          'AMap.AutoComplete',
          'AMap.PlaceSearch',
        ], // 需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
      })
        .then((AMap) => {
          this.AMap = AMap;

          // 加载备选图层
          this.initLayers();

          this.map = new AMap.Map('container', {
            // 设置地图容器id
            viewMode: '2D', // 是否为3D地图模式
            zoom: 9, // 初始化地图级别
            layers: [// 只显示默认图层的时候，layers可以缺省
              this.layers?.[window.mapConfig.defaultLayer].server,
            ],
            // 设置地图背景图
            // mapStyle: 'amap://styles/74c7e4c94b8ce88780ef54e44c677366',
          });

          // 绘制行政区边界
          this.drawBoundsByDistrictName(this.districtName || '全国');

          // 弹出表格
          this.openInfoTable();
        })
        .catch((e) => {
          console.error(e);
        });
    },
    // 初始化可以被切换额图层数组
    initLayers() {
      this.layers = {
        default: {
          server: this.AMap.createDefaultLayer(),
          label: '标准',
        }, // 高德默认标准图层
        realTime: {
          server: new this.AMap.TileLayer.Traffic({
            zIndex: 10,
            zooms: [7, 22],
          }),
          label: '实时路况',
        }, // 实时路况
        satellite: {
          server: new this.AMap.TileLayer.Satellite(),
          label: '卫星',
        }, // 卫星
      };
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
      if (!this.districtPlug) {
        // 实例化DistrictSearch
        const opts = {
          subdistrict: 0, // 获取边界不需要返回下级行政区
          extensions: 'all', // 返回行政区边界坐标组等具体信息
          level: 'city', // 查询行政级别为 市
        };
        this.districtPlug = new this.AMap.DistrictSearch(opts);
      }

      this.districtPlug.search(districtName, (status, result) => {
        if (this.districtPolygon) {
          this.map.remove(this.districtPolygon);// 清除上次结果
          this.districtPolygon = null;
        }
        if (!result || !result.districtList || !result.districtList[0]) {
          console.warn(`无法找到${districtName}行政区`);
          return;
        }
        const bounds = result.districtList[0].boundaries;
        // 区域掩模
        const mask = [];
        if (bounds) {
          // 生成行政区划polygon
          for (let i = 0; i < bounds.length; i += 1) { // 构造MultiPolygon的path
            mask[i] = [bounds[i]];
          }
          this.mask = mask;
          // 掩模添加
          // this.map.setMask(mask);

          // 添加高度面
          // const object3Dlayer = new this.AMap.Object3DLayer({ zIndex: 1 });
          // this.map.add(object3Dlayer);
          // const height = -8000;
          // const color = '#0088ffcc';// rgba
          // const wall = new this.AMap.Object3D.Wall({
          //   path: bounds,
          //   height,
          //   color,
          // });
          // wall.transparent = true;
          // object3Dlayer.add(wall);

          // 描边
          this.districtPolygon = new this.AMap.Polygon({
            strokeWeight: 2,
            path: bounds,
            fillOpacity: 0,
            // fillColor: '#80d8ff',
            strokeColor: '#0091ea',
          });
          this.map.add(this.districtPolygon);
          // this.map.setFitView(this.districtPolygon);// 视口自适应
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
