import {BasicColumn, FormSchema} from '/@/components/Table';
import {getAllRolesListNoByTenant} from '@/views/employee/user.api';
import {rules} from '/@/utils/helper/validator';
import {render} from '/@/utils/common/renderUtils';
import {companyClientListAllApi, companyListAllApi} from "@/api/sys/company";
import {useUserStore} from '@/store/modules/user';
import {UserTypeEnum} from "@/enums/sysEnum";

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
        title: '部门',
        width: 120,
        dataIndex: 'orgCodeTxt',
    },
    {
        title: '岗位',
        width: 120,
        dataIndex: 'mainDepPostId_dictText',
    },
    {
        title: '邮箱',
        dataIndex: 'email',
        width: 100,
    },
    {
        title: '性别',
        dataIndex: 'sex_dictText',
        width: 80,
        sorter: true,
    },
    {
        title: '企业名称',
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

export const recycleColumns: BasicColumn[] = [
    {
        title: '用户账号',
        dataIndex: 'username',
        width: 100,
    },
    {
        title: '姓名',
        dataIndex: 'realname',
        width: 100,
    },
    {
        title: '头像',
        dataIndex: 'avatar',
        width: 80,
        customRender: render.renderAvatar,
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
];

export const searchFormSchema: FormSchema[] = [
    // {
    //   label: '账号',
    //   field: 'username',
    //   component: 'JInput',
    //   //colProps: { span: 6 },
    // },
    {
        label: '企业名称',
        field: 'companyId',
        component: 'ApiSelect',
        componentProps: {
            api: companyClientListAllApi,
            labelField: 'companyName',
            valueField: 'id',
        },
        //colProps: { span: 6 },
    },
    {
        label: '姓名',
        field: 'realname',
        component: 'JInput',
        //colProps: { span: 6 },
    },
    {
        label: '性别',
        field: 'sex',
        component: 'JDictSelectTag',
        componentProps: {
            dictCode: 'sex',
            placeholder: '请选择性别',
            stringToNumber: true,
        },
        //colProps: { span: 6 },
    },
    {
        label: '手机号',
        field: 'phone',
        component: 'JInput',
        //colProps: { span: 6 },
    },
    {
        label: '用户状态',
        field: 'status',
        component: 'JDictSelectTag',
        componentProps: {
            dictCode: 'user_status',
            placeholder: '请选择状态',
            stringToNumber: true,
        },
        //colProps: { span: 6 },
    },
];

export const formSchema: FormSchema[] = [
    {
        label: '',
        field: 'id',
        component: 'Input',
        show: false,
    },
    {
        label: '',
        field: 'companyId',
        component: 'Input',
        show: false,
    },
    // {
    //   label: '用户账号',
    //   field: 'username',
    //   component: 'Input',
    //   required: true,
    //   dynamicDisabled: ({ values }) => {
    //     return !!values.id;
    //   },
    //   dynamicRules: ({ model, schema }) => rules.duplicateCheckRule('sys_user', 'username', model, schema, true),
    // },
    {
        label: '姓名',
        field: 'realname',
        required: true,
        component: 'Input',
    },
    {
        label: '所属部门',
        field: 'selecteddeparts',
        component: 'JSelectDept',
        componentProps: ({formActionType, formModel}) => {
            return {
                sync: false,
                checkStrictly: true,
                defaultExpandLevel: 2,
                // params: {row: formModel},
                onSelect: (options, values) => {
                    const {updateSchema} = formActionType;
                    //所属部门修改后更新负责部门下拉框数据
                    updateSchema([
                        {
                            field: 'departIds',
                            componentProps: {options},
                        },
                        //修改岗位和兼职岗位的参数
                        {
                            field: 'mainDepPostId',
                            componentProps: {params: {departIds: values ? values.value.join(',') : ''}},
                        },
                        {
                            field: 'otherDepPostId',
                            componentProps: {params: {departIds: values ? values.value.join(',') : ''}},
                        },
                    ]);
                    //update-begin---author:wangshuai---date:2024-05-11---for:【issues/1222】用户编辑界面“所属部门”与“负责部门”联动出错整---
                    if (!values) {
                        formModel.departIds = [];
                        formModel.mainDepPostId = '';
                        formModel.otherDepPostId = '';
                        return;
                    }
                    //update-end---author:wangshuai---date:2024-05-11---for:【issues/1222】用户编辑界面“所属部门”与“负责部门”联动出错整---
                    //所属部门修改后更新负责部门数据
                    formModel.departIds && (formModel.departIds = formModel.departIds.filter((item) => values.value.indexOf(item) > -1));
                },
            };
        },
    },
    {
        label: '岗位',
        field: 'mainDepPostId',
        component: 'JSelectDepartPost',
        componentProps: {
            rowKey: 'id',
            multiple: false,
        },
        ifShow: ({values}) => {
            if (!values.selecteddeparts) {
                return false;
            }
            return !(values.selecteddeparts instanceof Array && values.selecteddeparts.length == 0);
        },
    },
    {
        label: '登录密码',
        field: 'password',
        component: 'StrengthMeter',
        componentProps: {
            autocomplete: 'new-password',
        },
        rules: [
            {
                required: true,
                message: '请输入登录密码',
            },
            {
                pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,./]).{8,}$/,
                message: '密码由8位数字、大小写字母和特殊符号组成!',
            },
        ],
    },
    {
        label: '确认密码',
        field: 'confirmPassword',
        component: 'InputPassword',
        dynamicRules: ({values}) => rules.confirmPassword(values, true),
    },
    {
        label: '手机号码',
        field: 'phone',
        component: 'Input',
        required: true,
        dynamicRules: ({model, schema}) => {
            return [
                {...rules.duplicateCheckRule('sys_user', 'phone', model, schema, true)[0], trigger: 'blur'},
                {pattern: /^1[3456789]\d{9}$/, message: '手机号码格式有误', trigger: 'blur'},
            ];
        },
    },
    {
        label: '邮箱',
        field: 'email',
        component: 'Input',
        required: false,
        dynamicRules: ({model, schema}) => {
            return [
                {...rules.duplicateCheckRule('sys_user', 'email', model, schema, false)[0], trigger: 'blur'},
                {...rules.rule('email', false)[0], trigger: 'blur'},
            ];
        },
    },
    {
        label: '性别',
        field: 'sex',
        component: 'JDictSelectTag',
        componentProps: {
            dictCode: 'sex',
            placeholder: '请选择性别',
            stringToNumber: true,
        },
    },
    // {
    //   label: '工号',
    //   field: 'workNo',
    //   required: false,
    //   component: 'Input',
    //   dynamicRules: ({ model, schema }) => rules.duplicateCheckRule('sys_user', 'work_no', model, schema, false),
    // },
    /*  {
          label: '职务',
          field: 'post',
          required: false,
          component: 'JSelectPosition',
          componentProps: {
            labelKey: 'name',
          },
        },*/
    // {
    //   label: '职务',
    //   field: 'positionType',
    //   required: false,
    //   component: 'JDictSelectTag',
    //   componentProps: {
    //     dictCode: "user_position"
    //   },
    // },
    {
        label: '角色',
        field: 'selectedroles',
        component: 'ApiSelect',
        componentProps: {
            mode: 'multiple',
            api: getAllRolesListNoByTenant,
            labelField: 'roleName',
            valueField: 'id',
            immediate: false,
        },
        // ifShow: () => {
        //   return userStore.getUserInfo?.userType == UserTypeEnum.SUPER.value;
        // },
    },
    //
    // {
    //   label: '兼职岗位',
    //   field: 'otherDepPostId',
    //   component: 'JSelectDepartPost',
    //   componentProps: {
    //     rowKey: 'id',
    //   },
    //   ifShow:  ({ values }) => {
    //     if(!values.selecteddeparts){
    //       return false;
    //     }
    //     return !(values.selecteddeparts instanceof Array && values.selecteddeparts.length == 0);
    //   },
    // },
    // {
    //   label: '租户',
    //   field: 'relTenantIds',
    //   component: 'JSearchSelect',
    //   componentProps: {
    //     dict:"sys_tenant,name,id",
    //     async: true,
    //     multiple: true
    //   },
    // },
    // {
    //   label: '身份',
    //   field: 'userIdentity',
    //   component: 'RadioGroup',
    //   defaultValue: 1,
    //   componentProps: ({ formModel }) => {
    //     return {
    //       options: [
    //         { label: '普通用户', value: 1, key: '1' },
    //         { label: '上级', value: 2, key: '2' },
    //       ],
    //       onChange: () => {
    //         formModel.userIdentity == 1 && (formModel.departIds = []);
    //       },
    //     };
    //   },
    // },
    // {
    //   label: '负责部门',
    //   field: 'departIds',
    //   component: 'Select',
    //   componentProps: {
    //     mode: 'multiple',
    //   },
    //   ifShow: ({ values }) => values.userIdentity == 2,
    // },
    // {
    //   label: '头像',
    //   field: 'avatar',
    //   component: 'JImageUpload',
    //   componentProps: {
    //     fileMax: 1,
    //   },
    // },
    // {
    //   label: '生日',
    //   field: 'birthday',
    //   component: 'DatePicker',
    // },
    //
    // {
    //   label: '座机',
    //   field: 'telephone',
    //   component: 'Input',
    //   rules: [{ pattern: /^0\d{2,3}-[1-9]\d{6,7}$/, message: '请输入正确的座机号码' }],
    // },
    // {
    //   label: '工作流引擎',
    //   field: 'activitiSync',
    //   defaultValue: 1,
    //   component: 'JDictSelectTag',
    //   componentProps: {
    //     dictCode: 'activiti_sync',
    //     type: 'radio',
    //     stringToNumber: true,
    //   },
    // },
];

export const formPasswordSchema: FormSchema[] = [
    {
        label: '用户账号',
        field: 'username',
        component: 'Input',
        componentProps: {readOnly: true},
    },
    {
        label: '登录密码',
        field: 'password',
        component: 'StrengthMeter',
        componentProps: {
            placeholder: '请输入登录密码',
        },
        rules: [
            {
                required: true,
                message: '请输入登录密码',
            },
            {
                pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,./]).{8,}$/,
                message: '密码由8位数字、大小写字母和特殊符号组成!',
            },
        ],
    },
    {
        label: '确认密码',
        field: 'confirmPassword',
        component: 'InputPassword',
        dynamicRules: ({values}) => rules.confirmPassword(values, true),
    },
];


//租户用户列表
export const userTenantColumns: BasicColumn[] = [
    {
        title: '用户账号',
        dataIndex: 'username',
        width: 120,
    },
    {
        title: '姓名',
        dataIndex: 'realname',
        width: 100,
    },
    {
        title: '头像',
        dataIndex: 'avatar',
        width: 120,
        customRender: render.renderAvatar,
    },
    {
        title: '手机号',
        dataIndex: 'phone',
        width: 100,
    },
    {
        title: '部门',
        width: 150,
        dataIndex: 'orgCodeTxt',
    },
    {
        title: '状态',
        dataIndex: 'status',
        width: 80,
        customRender: ({text}) => {
            if (text === '1') {
                return '正常';
            } else if (text === '3') {
                return '审批中';
            } else {
                return '已拒绝';
            }
        },
    },
];

//用户租户搜索表单
export const userTenantFormSchema: FormSchema[] = [
    {
        label: '账号',
        field: 'username',
        component: 'Input',
        colProps: {span: 6},
    },
    {
        label: '名字',
        field: 'realname',
        component: 'Input',
        colProps: {span: 6},
    },
    {
        label: '性别',
        field: 'sex',
        component: 'JDictSelectTag',
        componentProps: {
            dictCode: 'sex',
            placeholder: '请选择性别',
            stringToNumber: true,
        },
        colProps: {span: 6},
    },
];
