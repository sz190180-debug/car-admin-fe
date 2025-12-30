import {BasicColumn} from '/@/components/Table';
import {getEnableLabel} from "@/enums/sysEnum";
//列表数据
export const columns: BasicColumn[] = [
  {
    title: 'ip地址',
    align: "center",
    dataIndex: 'ip'
  },
  {
    title: '是否启用',
    align: "center",
    dataIndex: 'enableStatus',
    customRender: ({text}) => {
      return getEnableLabel(text)
    },
  },
];

// 高级查询数据
export const superQuerySchema = {
  ip: {title: 'ip地址',order: 0,view: 'text', type: 'string',},
  enableStatus: {title: '是否启用：0未启用，1启用',order: 1,view: 'text', type: 'string',},
};
