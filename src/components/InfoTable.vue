/**
* InfoTable.vue 信息表
* @Author ZhangJun
* @Date  2024/4/14 22:39
**/
<template>
  <base-drawer v-bind="drawerDefaultOptions" ref="baseDrawer">
    <a-table :customRow="customRow" :columns="columns" :data-source="dataSource" bordered></a-table>
  </base-drawer>
</template>

<script lang="js">
import { defineComponent } from 'vue';
import BaseDrawer from '@/components/BaseDrawer.vue';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const redMarkerIcon = require('../assets/store_loaction.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const redMarkerActiveIcon = require('../assets/store_loaction_active.png');

export default defineComponent({
  name: 'InfoTable',
  components: { BaseDrawer },
  computed: {
    /**
     * 当前侧滑的默认配置
     */
    drawerDefaultOptions() {
      return {
        closable: false,
        mask: false,
        wrapClassName: 'baseDrawer',
        destroyOnClose: true,
        width: 500,
        wrapStyle: {
          height: '500px',
        },
        bodyStyle: {
          height: '440px',
          overflow: 'auto',
          padding: '8px',
        },
        ...this.$attrs,
      };
    },
  },
  data() {
    return {
      // 用来包装其它覆盖物类的实例
      overlayGroup: undefined,
      columns: [
        {
          title: '序号',
          key: 'index',
          dataIndex: 'index',
          customRender(text) {
            return text + 1;
          },
          width: 20,
        },
        {
          title: '名称',
          key: 'name',
          dataIndex: 'name',
          width: 100,
        },
        {
          title: '地址',
          key: 'address',
          dataIndex: 'address',
          width: 160,
        }],
      activeMarker: undefined,
      customRow: (record) => ({
        on: {
          click: (e) => {
            const { id } = record;
            const activeMarker = this.markerDict?.[id];
            if (activeMarker) {
              // 恢复选中状态
              if (this.activeMarker) {
                this.activeMarker.setIcon(new this.AMap.Icon({
                  imageSize: new this.AMap.Size(20, 20),
                  image: redMarkerIcon,
                  imageOffset: new this.AMap.Pixel(0, 0),
                }));
              }

              activeMarker.setIcon(new this.AMap.Icon({
                imageSize: new this.AMap.Size(20, 20),
                image: redMarkerActiveIcon,
                imageOffset: new this.AMap.Pixel(0, 0),
              }));
              this.map.setFitView(activeMarker);
              this.activeMarker = activeMarker;
            }
          },
        },
      }),
      dataSource: [],
      AMap: undefined,
      map: undefined,
      markerDict: {},
    };
  },
  methods: {
    // 展开drawer
    openDrawer(AMap, map) {
      if (AMap && map) {
        this.AMap = AMap;
        this.map = map;
        const { baseDrawer } = this.$refs;
        if (baseDrawer) {
          baseDrawer.openDrawer();
        }

        this.fetchData();
      }
    },
    // 关闭drawer
    closeDrawer() {
      const { baseDrawer } = this.$refs;
      if (baseDrawer) {
        baseDrawer.closeDrawer();
      }
    },
    /**
     * 渲染信息点
     * @param pois
     */
    renderMarkers(pois = []) {
      let markersDict = {};
      const markers = pois?.map((poi) => {
        const {
          id,
          name,
          location,
        } = poi;

        const marker = new this.AMap.Marker({
          position: location,
          icon: new this.AMap.Icon({
            imageSize: new this.AMap.Size(20, 20),
            image: redMarkerIcon,
            imageOffset: new this.AMap.Pixel(0, 0),
          }),
          offset: new this.AMap.Pixel(-10, -10),
          anchor: 'bottom-center',
          title: name,
          label: {
            content: name,
            direction: 'top',
          },
          extData: poi,
        });

        // 保存到字典
        markersDict = {
          ...markersDict,
          [id]: marker,
        };

        return marker;
      });

      if (!this.overlayGroup) {
        this.overlayGroup = new this.AMap.OverlayGroup(markers);
        this.overlayGroup.setMap(this.map);
      }
      this.overlayGroup.clearOverlays();
      this.overlayGroup.addOverlays(markers);

      this.map.setFitView(markers);

      return markersDict;
    },
    /**
     * 获取数据
     */
    fetchData() {
      this.dataSource = [];

      fetch('Pois.json')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          if (data?.pois) {
            this.dataSource = data.pois;

            // 渲染这些标记
            this.markerDict = this.renderMarkers(this.dataSource);
          }
        })
        .catch((error) => {
          console.error('There has been a problem with your fetch operation:', error);
        });
    },
  },
});
</script>

<style scoped lang="less">

</style>
