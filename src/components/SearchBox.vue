/**
* SearchBox.vue 关键字搜索框
* @Author ZhangJun
* @Date  2024/4/14 20:03
**/
<template>
  <div style="z-index: 2;width: 300px;">
    <a-input-search placeholder="请输入关键字"
                    id="tipinput"
                    enter-button
                    style="width: 100%;"
                    v-model="keyWord"
                    @search="onSearch"/>
    <div id="panel" style="margin-top: 4px;width: 80%;"></div>
  </div>

</template>

<script lang="js">
import { defineComponent } from 'vue';
import _ from 'lodash';

export default defineComponent({
  name: 'SearchBox',
  props: {
    AMap: {
      type: Object,
      default: () => ({}),
    },
    map: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      // 地图搜索实体
      placeSearch: undefined,
      poiList: [],
      keyWord: undefined,
    };
  },
  methods: {
    /**
     * 初始化搜索插件
     * @param AMap
     */
    initPlaceSearch(AMap = this.AMap) {
      if (AMap) {
        this.placeSearch = new AMap.PlaceSearch({
          pageSize: 5, // 单页显示结果条数
          pageIndex: 1, // 页码
          // city: '010', // 兴趣点城市
          // citylimit: true, // 是否强制限制在设置的城市内搜索
          map: this.map, // 展现结果的地图实例
          panel: 'panel', // 结果列表将在此容器中进行展示。
          autoFitView: true, // 是否自动调整地图视野使绘制的 Marker 点都处于视口的可见范围
        });
      }
    },
    onSearch(e) {
      this.poiList = [];
      this?.placeSearch?.search(this.keyWord, (status, result) => {
        // 查询成功时，result 即对应匹配的 POI 信息
        if (status === 'complete' && result?.poiList) {
          const { poiList } = result;
          this.poiList = poiList || [];
          // 遍历搜索结果，并在地图上标记
          // poiList?.pois?.forEach((poi) => {
          //   // const marker = new this.AMap.Marker({
          //   //   position: new this.AMap.LngLat(poi.location.getLng(), poi.location.getLat()),
          //   //   // icon: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
          //   //   anchor: 'bottom-center',
          //   // });
          //   // eslint-disable-next-line no-debugger
          //   debugger;
          //   // this.map.add(marker);
          // });
        }
      });
    },
  },
  watch: {
    AMap: {
      handler(newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal) && newVal) {
          this.$nextTick(() => {
            this.initPlaceSearch();
          });
        }
      },
      immediate: false,
    },
  },
});
</script>

<style scoped lang="less">

</style>
