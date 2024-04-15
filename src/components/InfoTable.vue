/**
* InfoTable.vue 信息表
* @Author ZhangJun
* @Date  2024/4/14 22:39
**/
<template>
  <base-drawer v-bind="drawerDefaultOptions" ref="baseDrawer">
    <a-table :customRow="customRow"
             :columns="columns"
             :data-source="dataSource"
             bordered
             :scroll="{y:300}"
    ></a-table>
  </base-drawer>
</template>

<script lang="js">
import { defineComponent } from 'vue';
import BaseDrawer from '@/components/BaseDrawer.vue';
import number from 'ant-design-vue/lib/statistic/Number';

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
          top: '90px',
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
          width: 40,
          align: 'center',
        },
        {
          title: '名称',
          key: 'name',
          dataIndex: 'name',
          width: 100,
          ellipsis: true,
          align: 'center',
        },
        {
          title: '地址',
          key: 'address',
          dataIndex: 'address',
          width: 160,
          ellipsis: true,
          align: 'center',
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
      pagination: {
        current: 1,
        defaultPageSize: 10,
        total: 0,
        showTotal: (total) => `共 ${total} 条`,
      },
      AMap: undefined,
      map: undefined,
      markerDict: {},
      infoWindow: undefined,
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
    openInfoWindow(position, info) {
      let content = Object.entries(window.mapConfig.infoWindowFieldList)
        .map(([key, cnName]) => {
          if (key === 'photos') {
            let photos = (info?.[key] || []).slice(0, Number(cnName) || 3);

            photos = photos.map(({
              title,
              url,
            }) => `<img width="50" height="50" style="margin-right: 4px;" src="${url}" alt="${title}"/>`);

            return `<div style="display: flex;justify-content: start;">
                       ${photos.join('')}
                                 </div>`;
          }
          return `<div style="display: flex;">
                                 <div>${cnName}：</div><div>${info?.[key] || '--'}</div>
                                 </div>`;
        })
        .join('');

      content = `<div style="min-width: 200px;">
                ${content}
                </div>`;

      if (!this.infoWindow) {
        this.infoWindow = new this.AMap.InfoWindow({
          // isCustom: true, // 使用自定义窗体
          content,
          // offset: new this.AMap.Pixel(-5, -5),
          anchor: 'bottom-center',
        });
      } else {
        this.infoWindow.setContent(content);
      }

      this.infoWindow.open(this.map, position);
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

        marker.on('click', (e) => {
          this.openInfoWindow(e?.lnglat, e?.target?.getExtData());
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
            // eslint-disable-next-line no-debugger
            debugger;
            this.dataSource = data.pois;
            this.pagination.total = this.dataSource.length;

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
