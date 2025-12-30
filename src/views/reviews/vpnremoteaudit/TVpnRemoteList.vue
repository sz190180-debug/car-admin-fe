<template>
  <div class="p-2">
    <!--查询区域-->
    <div class="jeecg-basic-table-form-container">
      <a-form ref="formRef" @keyup.enter.native="searchQuery" :model="queryParam" :label-col="labelCol"
              :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <!--          <a-col :lg="6">-->
          <!--            <a-form-item name="seq">-->
          <!--              <template #label><span title="序列号">序列号</span></template>-->
          <!--              <a-input placeholder="请输入序列号" v-model:value="queryParam.seq"-->
          <!--                       allow-clear></a-input>-->
          <!--            </a-form-item>-->
          <!--          </a-col>-->
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
              <a-col :lg="6">
                <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
                <!--                <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset"-->
                <!--                          style="margin-left: 8px">重置</a-button>-->
              </a-col>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!--引用表格-->
    <BasicTable @register="registerTable">
      <!--插槽:table标题-->
      <template #tableTitle>
        <!--        <a-dropdown v-if="selectedRowKeys.length > 0">-->
        <!--          <template #overlay>-->
        <!--            <a-menu>-->
        <!--              <a-menu-item key="1" @click="batchHandleDelete">-->
        <!--                <Icon icon="ant-design:delete-outlined"></Icon>-->
        <!--                删除-->
        <!--              </a-menu-item>-->
        <!--            </a-menu>-->
        <!--          </template>-->
        <!--          <a-button v-auth="'purchasemanage:t_vpn_remote:deleteBatch'">批量操作-->
        <!--            <Icon icon="mdi:chevron-down"></Icon>-->
        <!--          </a-button>-->
        <!--        </a-dropdown>-->
        <!-- 高级查询 -->
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)"/>
      </template>
      <template v-slot:bodyCell="{ column, record, index, text }">
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <TVpnRemoteModal ref="registerModal" @success="handleSuccess"></TVpnRemoteModal>
  </div>
</template>

<script lang="ts" name="purchasemanage-tVpnRemote" setup>
import {reactive, ref} from 'vue';
import {BasicTable, TableAction} from '/@/components/Table';
import {useListPage} from '/@/hooks/system/useListPage';
import {columns, superQuerySchema} from './TVpnRemote.data';
import TVpnRemoteModal from './components/TVpnRemoteModal.vue'
import {useUserStore} from '/@/store/modules/user';
import {useMessage} from '/@/hooks/web/useMessage';
import {getDateByPicker} from '/@/utils';
import {
  agree,
  batchDelete,
  deleteOne,
  getExportUrl,
  getImportUrl,
  list,
  refuse
} from "@/views/tickets/vpnremote/TVpnRemote.api";
import {message} from "ant-design-vue";
import {RemoveStatusEnum} from "@/enums/sysEnum";

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
    title: '远程协助审核',
    api: list,
    columns,
    canResize: true,
    useSearchForm: false,
    actionColumn: {
      width: 120,
      fixed: 'right',
    },
    beforeFetch: async (params) => {
      for (let key in fieldPickers) {
        if (queryParam[key] && fieldPickers[key]) {
          queryParam[key] = getDateByPicker(queryParam[key], fieldPickers[key]);
        }
      }
      return Object.assign(params, queryParam);
    },
  },
  exportConfig: {
    name: "vpn远程协助",
    url: getExportUrl,
    params: queryParam,
  },
  importConfig: {
    url: getImportUrl,
    success: handleSuccess
  },
});
const [registerTable, {reload, collapseAll, updateTableDataRecord, findTableDataRecord, getDataSource}, {rowSelection, selectedRowKeys}] = tableContext;
const labelCol = reactive({
  xs: 24,
  sm: 4,
  xl: 6,
  xxl: 4
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

function handleAgree(record: Recordable) {
  agree({id: record.id}).then(res => {
    if (res.success) {
      message.success(res.message)
    } else {
      message.error(res.message)
    }
    handleSuccess()
  })
}

function handleRefuse(record: Recordable) {
  refuse({id: record.id}).then(res => {
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
      label: '同意',
      popConfirm: {
        title: '是否确认同意远程协助',
        confirm: handleAgree.bind(null, record),
        placement: 'topLeft',
      },
      ifShow: record.status == RemoveStatusEnum.NOTAPPROVED.value
    },
    {
      label: '拒绝',
      popConfirm: {
        title: '是否确认拒绝远程协助',
        confirm: handleRefuse.bind(null, record),
        placement: 'topLeft',
      },
      ifShow: record.status == RemoveStatusEnum.NOTAPPROVED.value
    },
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
