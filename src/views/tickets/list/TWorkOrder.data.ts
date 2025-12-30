import {BasicColumn} from '/src/components/Table';
import {getWorkStatusEnumLabel, UserTypeEnum} from "@/enums/sysEnum";
import {useUserStore} from "@/store/modules/user";

const userStore = useUserStore();
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '设备id',
    align: "center",
    dataIndex: 'deviceId'
  },
  {
    title: '序列号',
    align: "center",
    dataIndex: 'seq'
  },
  {
    title: '工单编号',
    align: "center",
    dataIndex: 'orderNo'
  },
  {
    title: '问题描述',
    align: "center",
    dataIndex: 'description'
  },
  {
    title: '联系人（提报人）',
    align: "center",
    dataIndex: 'contactUser'
  },
  {
    title: '联系人手机号',
    align: "center",
    dataIndex: 'contactUserPhone'
  },
  {
    title: '处理人',
    align: "center",
    dataIndex: 'handlerUser'
  },
  {
    title: '工单状态',
    align: "center",
    dataIndex: 'status',
    customRender: ({text}) => {
      return getWorkStatusEnumLabel(text)
    },
  },
  {
    title: '备注',
    align: "center",
    dataIndex: 'remark'
  },
  {
    title: '转派操作人（原处理人）',
    align: "center",
    dataIndex: 'transferUser',
    ifShow: userStore.getUserInfo.userType != UserTypeEnum.CLIENT.value,
  },
  {
    title: '转派原因',
    align: "center",
    dataIndex: 'transferRemark',
    ifShow: userStore.getUserInfo.userType != UserTypeEnum.CLIENT.value,
  },
  {
    title: '处理人手机号',
    align: "center",
    dataIndex: 'handlerUserPhone'
  },
  {
    title: '开始处理工单的时间',
    align: "center",
    dataIndex: 'processDate'
  },
  {
    title: '处理完成工单的时间',
    align: "center",
    dataIndex: 'processOkDate'
  },
  {
    title: '接单倒计时',
    align: "center",
    dataIndex: 'countdownTime'
  },
];

// 高级查询数据
export const superQuerySchema = {
  deviceId: {title: '设备id', order: 0, view: 'number', type: 'number',},
  orderNo: {title: '工单编号', order: 1, view: 'text', type: 'string',},
  description: {title: '问题描述', order: 2, view: 'text', type: 'string',},
  contactUser: {title: '联系人（提报人）', order: 3, view: 'text', type: 'string',},
  contactUserId: {title: '联系人（提报人）id', order: 4, view: 'text', type: 'string',},
  handlerUser: {title: '处理人', order: 5, view: 'text', type: 'string',},
  handlerUserId: {title: '处理人id', order: 6, view: 'text', type: 'string',},
  status: {title: '工单状态：0-待处理，1-处理中，2-结单', order: 7, view: 'number', type: 'number',},
  remark: {title: '备注', order: 8, view: 'text', type: 'string',},
  transferUser: {title: '转派操作人（原处理人）', order: 9, view: 'text', type: 'string',},
  transferUserId: {title: '转派操作人（原处理人）id', order: 10, view: 'text', type: 'string',},
  transferRemark: {title: '转派原因', order: 11, view: 'text', type: 'string',},
  companyId: {title: '企业ID', order: 12, view: 'number', type: 'number',},
  transferCompanyId: {title: '转派企业id', order: 13, view: 'number', type: 'number',},
  handlerUserPhone: {title: '处理人手机号', order: 14, view: 'text', type: 'string',},
  processDate: {title: '开始处理工单的时间', order: 15, view: 'datetime', type: 'string',},
  processOkDate: {title: '处理完成工单的时间', order: 16, view: 'datetime', type: 'string',},
};
