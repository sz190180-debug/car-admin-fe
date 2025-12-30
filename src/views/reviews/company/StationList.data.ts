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
    title: '企业电话',
    align: "center",
    dataIndex: 'telephone'
  },
  {
    title: '纳税人识别号',
    align: "center",
    dataIndex: 'tin'
  },
  {
    title: '开户行名称',
    align: "center",
    dataIndex: 'backName'
  },
  {
    title: '法人名称',
    align: "center",
    dataIndex: 'corporateName'
  },
  {
    title: '手机号',
    align: "center",
    dataIndex: 'phone'
  },
  {
    title: '真实姓名',
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
  {
    title: '邀请码',
    align: "center",
    dataIndex: 'invitationCode'
  },
  {
    title: '状态',
    dataIndex: 'status',
    customRender: ({text}) => {
      return getStatusLabel(text)
    },
  },
];
