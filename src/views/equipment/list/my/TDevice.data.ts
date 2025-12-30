import {BasicColumn} from '/@/components/Table';
import {getActiveLabel, getEnableLabel, getRunLabel} from "@/enums/sysEnum";
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '产品',
    align: "center",
    dataIndex: 'deviceType'
  },
  {
    title: '设备车型',
    align: "center",
    dataIndex: 'deviceModel'
  },
  {
    title: '车型名称',
    align: "center",
    dataIndex: 'deviceModelName'
  },
  // {
  //   title: 'MAC地址',
  //   align: "center",
  //   dataIndex: 'mac'
  // },
  // {
  //   title: '控制中心',
  //   align: "center",
  //   dataIndex: 'rcs'
  // },
  {
    title: '序列号',
    align: "center",
    dataIndex: 'seq'
  },
  {
    title: '运行状态',
    align: "center",
    dataIndex: 'status',
    customRender: ({text}) => {
      return getRunLabel(text)
    },
  },
  {
    title: '激活状态',
    align: "center",
    dataIndex: 'activeStatus',
    customRender: ({text}) => {
      return getActiveLabel(text)
    },
  },
  {
    title: '启用状态',
    align: "center",
    dataIndex: 'enableStatus',
    customRender: ({text}) => {
      return getEnableLabel(text)
    },
  },
  {
    title: '备注',
    align: "center",
    dataIndex: 'remark',
  },
  {
    title: '定位',
    align: "center",
    dataIndex: 'location',
  },
  // {
  //   title: '经度',
  //   align: "center",
  //   dataIndex: 'longitude'
  // },
  // {
  //   title: '维度',
  //   align: "center",
  //   dataIndex: 'latitude'
  // },
  // {
  //   title: '最后定位时间',
  //   align: "center",
  //   dataIndex: 'lastTime'
  // },
  // {
  //   title: '最后定位地址',
  //   align: "center",
  //   dataIndex: 'addr'
  // },
  // {
  //   title: '整机编号',
  //   align: "center",
  //   dataIndex: 'deviceNumber'
  // },
  // {
  //   title: 'ICCID',
  //   align: "center",
  //   dataIndex: 'simImei'
  // },
  // {
  //   title: '电池编码',
  //   align: "center",
  //   dataIndex: 'batterySn'
  // },
  // {
  //   title: 'UUID',
  //   align: "center",
  //   dataIndex: 'uuid'
  // },
  // {
  //   title: '软件版本号',
  //   align: "center",
  //   dataIndex: 'softVersion'
  // },
  // {
  //   title: 'IP地址',
  //   align: "center",
  //   dataIndex: 'ip'
  // },
];

// 高级查询数据
export const superQuerySchema = {
  deviceType: {title: '产品', order: 0, view: 'text', type: 'string',},
  deviceModel: {title: '设备车型', order: 1, view: 'text', type: 'string',},
  mac: {title: 'MAC地址', order: 2, view: 'text', type: 'string',},
  rcs: {title: '控制中心', order: 3, view: 'text', type: 'string',},
  seq: {title: '序列号', order: 4, view: 'text', type: 'string',},
  status: {title: '运行状态：0-离线，1-在线', order: 5, view: 'number', type: 'number',},
  activeStatus: {title: '激活状态：0-未激活，1-已激活', order: 6, view: 'number', type: 'number',},
  enableStatus: {title: '启用状态：0-未启用，1-启用', order: 7, view: 'number', type: 'number',},
  companyId: {title: '企业id', order: 8, view: 'number', type: 'number',},
  longitude: {title: '经度', order: 9, view: 'number', type: 'number',},
  latitude: {title: '维度', order: 10, view: 'number', type: 'number',},
  lastTime: {title: '最后定位时间', order: 11, view: 'datetime', type: 'string',},
  addr: {title: '最后定位地址', order: 12, view: 'text', type: 'string',},
  deviceNumber: {title: '整机编号', order: 13, view: 'text', type: 'string',},
  simIccid: {title: 'SIM卡的id', order: 14, view: 'text', type: 'string',},
  simImei: {title: 'ICCID', order: 15, view: 'text', type: 'string',},
  batterySn: {title: '电池编码', order: 16, view: 'text', type: 'string',},
  uuid: {title: 'UUID', order: 17, view: 'text', type: 'string',},
  softVersion: {title: '软件版本号', order: 18, view: 'text', type: 'string',},
};
