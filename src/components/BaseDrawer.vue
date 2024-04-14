/**
* BaseDrawer.vue 基础drawer
* @Author ZhangJun
* @Date  2024/2/27 10:35
**/
<template>
  <a-drawer v-bind="$attrs" :visible="visible">
    <div slot="title">
      <slot name="title"></slot>
    </div>

    <div slot="handle" v-if="['right','left'].includes(handleDirection)">
      <slot name="handle">
        <div slot="handle">
          <template v-if="handleDirection==='left'">
            <a-button class="handleBtn handleLeftBtn"
                      :icon="visible?'right':'left'"
                      @click="()=>{visible=!visible}"></a-button>
          </template>
          <template v-else-if="handleDirection==='right'">
            <a-button class="handleBtn handleRightBtn"
                      :icon="visible?'left':'right'"
                      @click="()=>{visible=!visible}"></a-button>
          </template>
        </div>
      </slot>
    </div>
    <slot></slot>
  </a-drawer>
</template>

<script>
export default {
  name: 'BaseDrawer',
  emits: ['update:visible'],
  props: {
    // 是否显示操作杆
    handleDirection: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      visible: false,
    };
  },
  methods: {
    openDrawer() {
      this.visible = true;
    },
    closeDrawer() {
      this.visible = false;
    },
  },
  watch: {
    visible: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.$emit('update:visible', newVal);
        }
      },
    },
  },
};
</script>

<style scoped lang="less">

</style>

<style lang="less">
.baseDrawer {
  //.ant-drawer-content-wrapper {
  //  height: auto;
  //
  //  .ant-drawer-content {
  //    background-color: transparent;
  //
  //    .ant-drawer-wrapper-body {
  //      //background-color: @drawer-bg;
  //
  //      .ant-card {
  //        background-color: @base-bg-5;
  //
  //        .ant-switch {
  //          background-color: rgba(255, 255, 255, 0.3);
  //
  //          &.ant-switch-checked {
  //            background-color: @primary-color;
  //          }
  //        }
  //
  //        &.ant-card-bordered {
  //          border-color: @border-color-base;
  //
  //          .ant-card-head {
  //            border-color: @border-color-base;
  //          }
  //        }
  //      }
  //    }
  //  }
  //}

  /* 滚动条样式 */

  ::-webkit-scrollbar {
    width: 8px; /* 设置滚动条宽度 */
    height: 8px; /* 设置滚动条高度 */
  }

  ::-webkit-scrollbar-thumb {
    background-color: lightslategray; /* 设置滑块背景色 */
    border-radius: 2px; /* 设置滑块边角圆角程度 */
  }

  ::-webkit-scrollbar-track {
    background-color: lightgray; /* 设置滚动条轨道背景色 */
    border-radius: 2px; /* 设置滚动条轨道边角圆角程度 */
  }

  ::-webkit-scrollbar-button {
    display: none; /* 不显示按钮 */
  }

  .handleBtn {
    position: absolute;
    top: 53px;
    //background-color: @base-bg;
    //border: 1px solid @border-color-base;
    //color: @highlight;
    height: 50px;

    &.handleLeftBtn {
      left: -30px;
    }

    &.handleRightBtn {
      right: -30px;
    }
  }
}
</style>
