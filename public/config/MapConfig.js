window.mapConfig = {
  // 项目标题
  projectName: '地图点位标记',
  AMapKey: '009ed7e997ef75f59e50e2a6f4e764d4',
  securityJsCode: '7826d0b65c6f914c4a42a9f619c52d2b',
  _AMapSecurityConfig: '7826d0b65c6f914c4a42a9f619c52d2b',
  districtName: '嘉定', // 当前行政区
  defaultLayer: 'default', // default/realTime/satellite
  tableTitle: '信息表',
  // 信息表的列的属性
  tableColumns: [
    {
      title: '序号',
      key: 'index',
      dataIndex: 'index',
      customRender(text) {
        return text + 1;
      },
      width: 50,
      align: 'center', // left/right/center
    },
    {
      title: '名称',
      key: 'name',
      dataIndex: 'name',
      width: 100,
      ellipsis: true,
      align: 'left',
    },
    {
      title: '地址',
      key: 'address',
      dataIndex: 'address',
      width: 160,
      ellipsis: true,
      align: 'left',
    }],
  infoWindowFieldList: { // 弹出框要显示的字段
    address: '地址',
    name: '名称',
    tel: '电话',
    photos: 4, // 显示图片的数量
  },
  visiblePlugs: [// 地图上要显示的插件
    'navBar',
    'searchBox',
    'infoTable',
    // 'positionBox',
  ],
};
