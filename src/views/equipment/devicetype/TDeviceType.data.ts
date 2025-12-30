import {BasicColumn} from '/@/components/Table';
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '产品',
    align: "center",
    dataIndex: 'type'
  },
  // {
  //   title: '父id',
  //   align: "center",
  //   dataIndex: 'parentId'
  // },
];

// 高级查询数据
export const superQuerySchema = {
  type: {title: '产品',order: 0,view: 'text', type: 'string',},
  parentId: {title: '父id',order: 1,view: 'text', type: 'string',},
};
