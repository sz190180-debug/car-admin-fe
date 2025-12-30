import {BasicColumn} from '/@/components/Table';
import {getEnumLabel, RemoveStatusEnum, VpnCertStatusEnum} from "@/enums/sysEnum";
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '设备id',
    align: "center",
    dataIndex: 'deviceId'
  },
  {
    title: '设备vpn ip地址',
    align: "center",
    dataIndex: 'vpnIp'
  },
  {
    title: '设备mac地址',
    align: "center",
    dataIndex: 'mac'
  },
  {
    title: '审批状态',
    align: "center",
    dataIndex: 'status',
    customRender: ({text}) => {
      return getEnumLabel(RemoveStatusEnum, text)
    },
  },
  {
    title: 'vpn证书下发状态',
    align: "center",
    dataIndex: 'vpnCertStatus',
    customRender: ({text}) => {
      return getEnumLabel(VpnCertStatusEnum, text)
    },
  },
  {
    title: '拒绝原因',
    align: "center",
    dataIndex: 'refuseMsg'
  },
  {
    title: '申请备注',
    align: "center",
    dataIndex: 'remark'
  },
];

// 高级查询数据
export const superQuerySchema = {
  deviceId: {title: '设备id', order: 0, view: 'number', type: 'number',},
  vpnIp: {title: '设备vpn ip地址', order: 1, view: 'text', type: 'string',},
  mac: {title: '设备mac地址', order: 2, view: 'text', type: 'string',},
  status: {
    title: '审批状态 0-未审批，1-审批通过，2-审批拒绝',
    order: 3,
    view: 'number',
    type: 'number',
  },
  workOrderId: {title: '工单id', order: 4, view: 'number', type: 'number',},
  vpnCertStatus: {
    title: 'vpn证书下发状态 0-未生成，1-已生成',
    order: 5,
    view: 'number',
    type: 'number',
  },
  refuseMsg: {title: '拒绝原因', order: 6, view: 'text', type: 'string',},
  remark: {title: '申请备注', order: 7, view: 'text', type: 'string',},
};
