import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { rules} from '/@/utils/helper/validator';
import { render } from '/@/utils/common/renderUtils';
import { getWeekMonthQuarterYear } from '/@/utils';
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '企业名称',
    align: "center",
    dataIndex: 'companyName'
  },
  {
    title: '父企业id',
    align: "center",
    dataIndex: 'parentId'
  },
  {
    title: '联系电话',
    align: "center",
    dataIndex: 'phone'
  },
  {
    title: '联系人名称',
    align: "center",
    dataIndex: 'name'
  },
  {
    title: '企业地址',
    align: "center",
    dataIndex: 'address'
  },
  {
    title: '电子邮箱',
    align: "center",
    dataIndex: 'email'
  },
  {
    title: '邀请码-展示',
    align: "center",
    dataIndex: 'invitationCode'
  },
  {
    title: '审核状态：0未审核，1审核通过',
    align: "center",
    dataIndex: 'status'
  },
];

// 高级查询数据
export const superQuerySchema = {
  companyName: {title: '企业名称',order: 0,view: 'text', type: 'string',},
  parentId: {title: '父企业id',order: 1,view: 'text', type: 'string',},
  phone: {title: '联系电话',order: 2,view: 'text', type: 'string',},
  name: {title: '联系人名称',order: 3,view: 'text', type: 'string',},
  address: {title: '企业地址',order: 4,view: 'text', type: 'string',},
  email: {title: '电子邮箱',order: 5,view: 'text', type: 'string',},
  invitationCode: {title: '邀请码-展示',order: 6,view: 'text', type: 'string',},
  status: {title: '审核状态：0未审核，1审核通过',order: 7,view: 'number', type: 'number',},
};
