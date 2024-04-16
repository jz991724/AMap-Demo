/**
* NavBar.vue 导航条
* @Author ZhangJun
* @Date  2024/4/15 12:44
**/
<template>
  <a-row style="width: 100%;background: cornflowerblue;color: white;font-size: 16px;"
         type="flex"
         justify="space-around"
         align="middle">
    <a-col :span="8">
      <a-space>
        <div>{{ datetime }}</div>
        <div>{{ chineseWeekday }}</div>
        <div>{{ time }}</div>
      </a-space>
    </a-col>
    <a-col :span="8">
      <a-space>
        <!--        <a-divider type="vertical"></a-divider>-->
        <div class="projectName">{{ projectName || '地图标记' }}</div>
        <!--        <a-divider type="vertical"></a-divider>-->
      </a-space>
    </a-col>
    <a-col :span="4">
      <a-dropdown>
        <a-menu slot="overlay"
                @click="handleMenuClick"
                :value="activeLayerKey">
          <template v-for="[key,info] in Object.entries(layers)">
            <a-menu-item v-if="info&&info.label" :key="key">
              <!--           <a-icon type="layer"/>-->
              {{ info.label || '' }}
            </a-menu-item>
          </template>
        </a-menu>
        <a-button style="width: 100px;">
          {{ layers[activeLayerKey]?.label || '' }}
          <a-icon type="down"/>
        </a-button>
      </a-dropdown>
    </a-col>
    <a-col :span="4">
      <a-space v-if="weatherInfo">
        <div>
          <template v-if="weatherInfo.city">{{ weatherInfo.city }}</template>
          <template v-else>{{ weatherInfo.province }}</template>
        </div>
        <div>{{ weatherInfo.weather || '' }}</div>
        <div>{{ weatherInfo.temperature || '' }}°C</div>
      </a-space>
    </a-col>
  </a-row>
</template>

<script lang="js">
import { defineComponent } from 'vue';
import _ from 'lodash';
import moment from 'moment';

export default defineComponent({
  name: 'NavBar',
  props: {
    AMap: {
      type: Object,
      default: () => ({}),
    },
    map: {
      type: Object,
      default: () => ({}),
    },
    districtName: { // 行政区名称
      type: String,
      default: '全国',
    },
    layers: {
      type: Object,
      default: () => ({}),
    },
    mask: { // 掩模
      type: Array,
      default: () => ([]),
    },
  },
  data() {
    return {
      // 天气插件
      weatherPlug: undefined,
      // 天气数据
      weatherInfo: undefined,
      projectName: window.mapConfig.projectName,
      datetime: moment()
        .format('YYYY年MM月DD日'),
      chineseWeekday: moment()
        .format('dddd'),
      time: moment()
        .format('HH:mm:ss'),
      activeLayerKey: window.mapConfig.defaultLayer,
    };
  },
  methods: {
    /**
     * 获取天气信息
     * @param city
     */
    getWeatherInfo(city = this.districtName) {
      // 创建天气查询实例
      if (!this.weatherPlug) {
        this.weatherPlug = new this.AMap.Weather();
      }
      // 执行实时天气信息查询
      this.weatherPlug.getLive(city, (err, data) => {
        if (data?.info === 'OK') {
          this.weatherInfo = data;
        }
      });
    },
    initCurrentTime() {
      setInterval(() => {
        this.time = moment()
          .format('HH:mm:ss');
      }, 1000);
    },
    /**
     * 图层切换
     */
    handleMenuClick({ key }) {
      this.activeLayerKey = key;
      const activeLayer = this?.layers?.[key];
      if (activeLayer?.server) {
        this.$message.success(`${activeLayer?.label}图层`);
        debugger;
        this.map.setLayers([activeLayer.server]);
        // this.map.setMask(this.mask);
      }
    },
  },
  created() {
    moment.locale('zh_cn');
    this.initCurrentTime();
  },
  watch: {
    AMap: {
      handler(newVal, oldVal) {
        if (!_.isEmpty(newVal)) {
          this.getWeatherInfo();
        }
      },
      immediate: true,
    },
    districtName: {
      handler(newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal)) {
          this.getWeatherInfo();
        }
      },
      immediate: false,
    },
  },
});
</script>

<style scoped lang="less">
.projectName {
  font-weight: bolder;
  font-size: 24px;
  padding: 10px;
}
</style>
