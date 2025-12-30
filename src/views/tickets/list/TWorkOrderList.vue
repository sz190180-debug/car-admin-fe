<template>
  <div class="p-2">
    <!--查询区域-->
    <div class="jeecg-basic-table-form-container">
      <a-form ref="formRef" @keyup.enter.native="searchQuery" :model="queryParam"
              :label-col="labelCol">
        <a-row :gutter="24">
          <a-col :lg="6">
            <a-form-item name="deviceType">
              <template #label><span title="产品">产品</span></template>
              <ApiSelect
                :api="typeList"
                showSearch
                allow-clear
                placeholder="请选择产品"
                v-model:value="queryParam.deviceType"
                optionFilterProp="label"
                resultField="list"
                labelField="type"
                valueField="type"
              />
            </a-form-item>
          </a-col>
          <a-col :lg="6">
            <a-form-item name="deviceModel">
              <template #label><span title="设备车型">设备车型</span></template>
              <ApiSelect
                :api="modelList"
                showSearch
                allow-clear
                placeholder="请选择设备车型"
                v-model:value="queryParam.deviceModel"
                optionFilterProp="label"
                resultField="list"
                labelField="model"
                valueField="model"
              />
            </a-form-item>
          </a-col>
          <a-col :lg="6">
            <a-form-item name="seq">
              <template #label><span title="序列号">序列号</span></template>
              <a-input placeholder="请输入序列号" v-model:value="queryParam.seq"
                       allow-clear></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
              <a-col :lg="6">
                <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
                <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset"
                          style="margin-left: 8px">重置</a-button>
                <!--                                <a @click="toggleSearchStatus = !toggleSearchStatus"-->
                <!--                                   style="margin-left: 8px">-->
                <!--                                  {{ toggleSearchStatus ? '收起' : '展开' }}-->
                <!--                                  <Icon-->
                <!--                                    :icon="toggleSearchStatus ? 'ant-design:up-outlined' : 'ant-design:down-outlined'"/>-->
                <!--                                </a>-->
              </a-col>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--插槽:table标题-->
      <template #tableTitle>
<!--        <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined"> 新增-->
<!--        </a-button>-->
        <!--        <a-button  type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>-->
        <!--        <j-upload-button  type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button>-->
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>批量操作
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
        <!-- 高级查询 -->
        <!--        <super-query :config="superQueryConfig" @search="handleSuperQuery" />-->
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)"
                     :dropDownActions="getDropDownAction(record)"/>
      </template>
      <template v-slot:bodyCell="{ column, record, index, text }">
        <template v-if="column.key == 'countdownTime'">
          <div v-if="!!record.countdownTime">
            <CountdownTimer :start-time="record.countdownTime"
                            :duration="30"/>
          </div>
        </template>
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <TWorkOrderModal ref="registerModal" @success="handleSuccess"></TWorkOrderModal>
    <TextModal ref="applyWorkOrderModal" title="申请协助" label="备注" @submit="handleApply"/>
  </div>
</template>

<script lang="ts" name="tickets-tWorkOrder" setup>
import {ref, reactive} from 'vue';
import {BasicTable, useTable, TableAction} from '/src/components/Table';
import {useListPage} from '/src/hooks/system/useListPage';
import {columns, superQuerySchema} from './TWorkOrder.data';
import {
  list,
  deleteOne,
  batchDelete,
  getImportUrl,
  getExportUrl,
  process,
  processOk, transfer
} from './TWorkOrder.api';
import {downloadFile} from '/src/utils/common/renderUtils';
import TWorkOrderModal from './components/TWorkOrderModal.vue'
import {useUserStore} from '/src/store/modules/user';
import {useMessage} from '/src/hooks/web/useMessage';
import {useModal} from '/src/components/Modal';
import {getDateByPicker} from '/src/utils';
import {listAll as typeList} from "@/views/equipment/devicetype/TDeviceType.api";
import ApiSelect from "@/components/Form/src/components/ApiSelect.vue";
import {listAll as modelList} from "@/views/equipment/devicemodel/TDeviceModel.api";
import {sold} from "@/views/equipment/list/TDevice.api";
import {message} from "ant-design-vue";
import {UserTypeEnum, WorkStatusEnum} from "@/enums/sysEnum";
import TextModal from "@/components/Modal/TextModal.vue";
import InputModal from "@/components/Modal/InputModal.vue";
import {apply} from "@/views/tickets/vpnremote/TVpnRemote.api";
import CountdownTimer from "@/components/CountdownTimer/src/CountdownTimer.vue";

const fieldPickers = reactive({});

const formRef = ref();
const queryParam = reactive<any>({});
const toggleSearchStatus = ref<boolean>(false);
const registerModal = ref();
const userStore = useUserStore();
const {createMessage} = useMessage();
//注册table数据
const {prefixCls, tableContext, onExportXls, onImportXls} = useListPage({
  tableProps: {
    title: '工单表',
    api: list,
    columns,
    canResize: true,
    useSearchForm: false,
    actionColumn: {
      width: 150,
      fixed: 'right',
    },
    showActionColumn: userStore.getUserInfo.userType != UserTypeEnum.CLIENT.value,
    beforeFetch: async (params) => {
      for (let key in fieldPickers) {
        if (queryParam[key] && fieldPickers[key]) {
          queryParam[key] = getDateByPicker(queryParam[key], fieldPickers[key]);
        }
      }
      queryParam.status = WorkStatusEnum.PENDING.value
      return Object.assign(params, queryParam);
    },
  },
  exportConfig: {
    name: "工单表",
    url: getExportUrl,
    params: queryParam,
  },
  importConfig: {
    url: getImportUrl,
    success: handleSuccess
  },
});
const [registerTable, {
  reload,
  collapseAll,
  updateTableDataRecord,
  findTableDataRecord,
  getDataSource
}, {rowSelection, selectedRowKeys}] = tableContext;
const labelCol = reactive({
  span: 6
});
const wrapperCol = reactive({
  xs: 24,
  sm: 20,
});

// 高级查询配置
const superQueryConfig = reactive(superQuerySchema);

/**
 * 高级查询事件
 */
function handleSuperQuery(params) {
  Object.keys(params).map((k) => {
    queryParam[k] = params[k];
  });
  searchQuery();
}

/**
 * 新增事件
 */
function handleAdd() {
  registerModal.value.disableSubmit = false;
  registerModal.value.add();
}

/**
 * 编辑事件
 */
function handleEdit(record: Recordable) {
  registerModal.value.disableSubmit = false;
  registerModal.value.edit(record);
}

/**
 * 开始处理工单
 */
function handleProcess(record: Recordable) {
  process({id: record.id}).then(res => {
    if (res.success) {
      message.success(res.message)
    } else {
      message.error(res.message)
    }
    handleSuccess()
  })
}

/**
 * 结束处理工单
 */
function handleProcessOk(record: Recordable) {
  processOk({id: record.id}).then(res => {
    if (res.success) {
      message.success(res.message)
    } else {
      message.error(res.message)
    }
    handleSuccess()
  })
}

/**
 * 委派工单
 */
// function handleTransfer(record: Recordable) {
//   transfer({id: record.id}).then(res => {
//     if (res.success) {
//       message.success(res.message)
//     } else {
//       message.error(res.message)
//     }
//     handleSuccess()
//   })
// }

const applyWorkOrderModal = ref()

function openApply(record: Recordable) {
  applyWorkOrderModal.value.open(null, record.id)
}

function handleApply(data, id) {
  apply({
    id: id,
    remark: data,
  }).then(res => {
    if (res.success) {
      message.success(res.message)
    } else {
      message.error(res.message)
    }
    handleSuccess()
  })
}

/**
 * 详情
 */
function handleDetail(record: Recordable) {
  registerModal.value.disableSubmit = true;
  registerModal.value.edit(record);
}

/**
 * 删除事件
 */
async function handleDelete(record) {
  await deleteOne({id: record.id}, handleSuccess);
}

/**
 * 批量删除事件
 */
async function batchHandleDelete() {
  await batchDelete({ids: selectedRowKeys.value}, handleSuccess);
}

/**
 * 成功回调
 */
function handleSuccess() {
  (selectedRowKeys.value = []) && reload();
}

/**
 * 操作栏
 */
function getTableAction(record) {
  return [
    {
      label: '处理',
      popConfirm: {
        title: '是否确认处理工单',
        confirm: handleProcess.bind(null, record),
        placement: 'topLeft',
      },
      ifShow: record.status == WorkStatusEnum.PENDING.value && userStore.getUserInfo.companyId == record.companyId
    },
    // {
    //   label: '关闭',
    //   popConfirm: {
    //     title: '是否确认关闭工单',
    //     confirm: handleProcessOk.bind(null, record),
    //     placement: 'topLeft',
    //   },
    //   ifShow: record.status == WorkStatusEnum.INPROCESSED.value && userStore.getUserInfo.companyId == record.companyId
    // },
    // {
    //   label: '委派',
    //   popConfirm: {
    //     title: '是否确认委派工单',
    //     confirm: handleTransfer.bind(null, record),
    //     placement: 'topLeft',
    //   },
    //   ifShow: record.status == WorkStatusEnum.INPROCESSED.value
    //     && userStore.getUserInfo.companyId == record.companyId
    //     && userStore.getUserInfo.userType == UserTypeEnum.AGENT.value
    // },
    // {
    //   label: '远程',
    //   onClick: openApply.bind(null, record),
    //   ifShow: userStore.getUserInfo.userType == UserTypeEnum.AGENT.value && record.status == WorkStatusEnum.INPROCESSED.value
    // },
  ];
}

/**
 * 下拉操作栏
 */
function getDropDownAction(record) {
  return []
}

/**
 * 查询
 */
function searchQuery() {
  reload();
}

/**
 * 重置
 */
function searchReset() {
  formRef.value.resetFields();
  selectedRowKeys.value = [];
  //刷新数据
  reload();
}


</script>

<style lang="less" scoped>
.jeecg-basic-table-form-container {
  padding: 0;

  .table-page-search-submitButtons {
    display: block;
    margin-bottom: 24px;
    white-space: nowrap;
  }

  .query-group-cust {
    min-width: 100px !important;
  }

  .query-group-split-cust {
    width: 30px;
    display: inline-block;
    text-align: center
  }

  .ant-form-item:not(.ant-form-item-with-help) {
    margin-bottom: 16px;
    height: 32px;
  }

  :deep(.ant-picker), :deep(.ant-input-number) {
    width: 100%;
  }
}
</style>
