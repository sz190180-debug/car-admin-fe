import {BasicColumn} from '/@/components/Table';
import {render} from "@/utils/common/renderUtils";
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '手机号',
    dataIndex: 'phone',
    width: 100,
  },
  {
    title: '姓名',
    dataIndex: 'realname',
    width: 100,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    width: 100,
  },
  {
    title: '性别',
    dataIndex: 'sex',
    width: 80,
    sorter: true,
    customRender: ({text}) => {
      return render.renderDict(text, 'sex');
    },
  },
  {
    title: '服务网点名称',
    dataIndex: 'companyName',
    width: 120,
    sorter: true,
  },
  {
    title: '状态',
    dataIndex: 'status_dictText',
    width: 80,
  },
  {
    title: '邀请码',
    dataIndex: 'invitationCode',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 120,
  },
];
