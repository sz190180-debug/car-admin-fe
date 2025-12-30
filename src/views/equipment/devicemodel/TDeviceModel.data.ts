import {BasicColumn} from '/@/components/Table';
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '设备车型',
    align: "center",
    dataIndex: 'carName'
  },
  {
    title: '车型型号',
    align: "center",
    dataIndex: 'model'
  },
];

// 高级查询数据
export const superQuerySchema = {
  model: {title: '设备车型',order: 0,view: 'text', type: 'string',},
};
