/**
* MainMap.vue 高德地图
* @Author ZhangJun
* @Date  2024/4/14 19:27
**/
<template>
  <div>
    <div id="container"></div>

    <nav-bar v-if="visiblePlugs.includes('navBar')"
             :a-map="AMap"
             :map="map"
             :district-name="districtName"
             :layers="layers"
             @switchVisibleMask="onSwitchVisibleMask"
             @refreshMap="onRefreshMap"
             style="position: absolute;top: 0;left: 0;"></nav-bar>

    <search-box v-if="visiblePlugs.includes('searchBox')"
                :a-map="AMap"
                :map="map"
                size="large"
                style="position: absolute;top: 70px;left: 10px;"></search-box>

    <info-table v-if="visiblePlugs.includes('infoTable')"
                handleDirection="left"
                ref="infoTable"></info-table>

    <position-box v-if="visiblePlugs.includes('positionBox')"
                  :a-map="AMap"
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
      isShowMask: window.mapConfig.defaultShowMask,
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
        zoom: 9,
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
    closeInfoTable() {
      const { infoTable } = this.$refs;
      if (infoTable) {
        infoTable.closeDrawer();
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
        // 行政区边缘
        const bounds = result.districtList[0].boundaries;
        if (bounds) {
          // 绘制遮罩
          this.renderMask(bounds);
          // 描边
          this.districtPolygon = new this.AMap.Polygon({
            strokeWeight: 2,
            path: bounds,
            fillOpacity: 0,
            // fillColor: '#80d8ff',
            strokeColor: '#0091ea',
          });
          this.map.add(this.districtPolygon);
          this.map.setFitView(
            this.districtPolygon,
            true, // 动画过渡到制定位置
            [60, 60, 60, 60], // 周围边距，上、下、左、右
            window.mapConfig.setFitViewMaxZoom, // 最大 zoom 级别
          );// 视口自适应
        }
      });
    },
    /**
     * 渲染遮罩
     * @param holes 孔的路径
     * @param map
     */
    renderMask(holes, map = this.map) {
      // 外多边形坐标数组和内多边形坐标数组（整个地图）
      const outer = [
        new this.AMap.LngLat(-360, 90, true),
        new this.AMap.LngLat(-360, -90, true),
        new this.AMap.LngLat(360, -90, true),
        new this.AMap.LngLat(360, 90, true),
      ];

      const pathArray = [
        outer,
        ...holes,
      ];

      // 遮罩部分
      const polygon = new this.AMap.Polygon({
        pathL: pathArray,
        strokeColor: '#00eeff',
        strokeWeight: 1,
        fillColor: '#71B3ff',
        fillOpacity: 0.5,
      });
      polygon.setPath(pathArray);
      this.mask = polygon;
      if (this.isShowMask) {
        map.add(polygon);
      }
    },
    /**
     * 切换是否显示遮罩
     * @param e
     */
    onSwitchVisibleMask(e) {
      this.isShowMask = e;
      if (e && this.mask) {
        this.map.add(this.mask);
        this.$message.success('遮罩已打开');
      } else {
        this.map.remove(this.mask);
        this.$message.warn('遮罩已关闭');
      }
    },
    /**
     * 地图刷新
     */
    onRefreshMap(e) {
      this.visiblePlugs = this.visiblePlugs.filter((plug) => !['infoTable'].includes(plug));
      this.map.clearMap();
      this.map?.destroy();
      setTimeout(() => {
        this.visiblePlugs = [...this.visiblePlugs, 'infoTable'];
        this.initAMap();
      }, 1000);
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
