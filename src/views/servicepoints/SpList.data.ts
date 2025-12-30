import {BasicColumn} from '/@/components/Table';
import {getStatusLabel} from "@/enums/sysEnum";
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '服务网点名称',
    align: "center",
    dataIndex: 'companyName'
  },
  {
    title: '手机号',
    align: "center",
    dataIndex: 'phone'
  },
  {
    title: '联系人名称',
    align: "center",
    dataIndex: 'name'
  },
  {
    title: '服务网点地址',
    align: "center",
    dataIndex: 'address'
  },
  {
    title: '电子邮箱',
    align: "center",
    dataIndex: 'email'
  },
  // {
  //   title: '邀请码',
  //   align: "center",
  //   dataIndex: 'invitationCode'
  // },
  {
    title: '邀请人',
    dataIndex: 'invitationName',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    customRender: ({text}) => {
      return getStatusLabel(text)
    },
  },
];
