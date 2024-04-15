/**
* PositionBox.vue TODO
* @Author ZhangJun
* @Date  2024/4/15 23:10
**/
<template>
  <a-card v-show="position" size="small">
    {{ position }}
  </a-card>
</template>

<script lang="js">
import { defineComponent } from 'vue';
import _ from 'lodash';

export default defineComponent({
  name: 'PositionBox',
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
      position: '',
    };
  },
  watch: {
    map: {
      handler(newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal) && newVal) {
          this.$nextTick(() => {
            this.map.on('mousemove', (e) => {
              this.position = `${e?.lnglat?.getLng()?.toFixed(2)},${e?.lnglat?.getLat()?.toFixed(2)}`;
            });
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
