<template>
  <div class="p-2">
    <!--查询区域-->
    <div class="jeecg-basic-table-form-container">
      <a-form ref="formRef" @keyup.enter.native="searchQuery" :model="queryParam"
              :label-col="labelCol">
        <a-row :gutter="24">
          <a-col :lg="6">
            <a-form-item name="companyName">
              <template #label><span title="企业客户名称">企业客户名称</span></template>
              <a-input placeholder="请输入企业客户名称" v-model:value="queryParam.companyName"
                       allow-clear></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
              <a-col :lg="6">
                <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
                <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset"
                          style="margin-left: 8px">重置</a-button>
                <!--                <a @click="toggleSearchStatus = !toggleSearchStatus" style="margin-left: 8px">-->
                <!--                  {{ toggleSearchStatus ? '收起' : '展开' }}-->
                <!--                  <Icon :icon="toggleSearchStatus ? 'ant-design:up-outlined' : 'ant-design:down-outlined'"/>-->
                <!--                </a>-->
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
        <!--        <a-button type="primary"  @click="handleAdd" preIcon="ant-design:plus-outlined"> 新增</a-button>-->
        <!--        <a-button  type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>-->
        <!--        <j-upload-button  type="primary"  preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button>-->
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
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)"
                     :dropDownActions="getDropDownAction(record)"/>
      </template>
      <template v-slot:bodyCell="{ column, record, index, text }">
      </template>
    </BasicTable>
  </div>
</template>

<script lang="ts" name="aaa-tCompany" setup>
import {reactive, ref} from 'vue';
import {BasicTable, TableAction} from '/@/components/Table';
import {useListPage} from '/@/hooks/system/useListPage';
import {columns} from './StationList.data';
import {useUserStore} from '/@/store/modules/user';
import {useMessage} from '/@/hooks/web/useMessage';
import {getDateByPicker} from '/@/utils';
import {message} from "ant-design-vue";
import {StatusEnum, UserTypeEnum} from "@/enums/sysEnum";
import {
  batchDelete,
  deleteOne,
  getExportUrl,
  getImportUrl,
  list,
  review
} from "@/views/company/TCompany.api";

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
    title: '服务网点表',
    api: list,
    columns,
    canResize: true,
    useSearchForm: false,
    actionColumn: {
      width: 150,
      fixed: 'right',
    },
    beforeFetch: async (params) => {
      for (let key in fieldPickers) {
        if (queryParam[key] && fieldPickers[key]) {
          queryParam[key] = getDateByPicker(queryParam[key], fieldPickers[key]);
        }
      }
      queryParam.status = StatusEnum.INVALID.value
      queryParam.companyType = UserTypeEnum.CLIENT.value
      return Object.assign(params, queryParam);
    },
  },
  exportConfig: {
    name: "服务网点表",
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
  span: 8
});

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
 * 审核通过
 */
function handleReview(record: Recordable) {
  review({id: record.id, hasPass: true}).then(res => {
    if (res.success) {
      message.success('已通过')
    } else {
      message.error('审核失败')
    }
    reload()
  })
}

/**
 * 审核拒绝
 */
function handleRefuse(record: Recordable) {
  review({id: record.id, hasPass: false}).then(res => {
    if (res.success) {
      message.success('已拒绝')
    } else {
      message.error('审核失败')
    }
    reload()
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
      label: '通过',
      popConfirm: {
        title: '是否确认通过',
        confirm: handleReview.bind(null, record),
        placement: 'topLeft',
      },
    },
    {
      label: '拒绝',
      popConfirm: {
        title: '是否确认拒绝',
        confirm: handleRefuse.bind(null, record),
        placement: 'topLeft',
      },
    },
    {
      label: '删除',
      popConfirm: {
        title: '是否确认删除',
        confirm: handleDelete.bind(null, record),
        placement: 'topLeft',
      },
    }
  ];
}

/**
 * 下拉操作栏
 */
function getDropDownAction(record) {
  return [
    // {
    //   label: '详情',
    //   onClick: handleDetail.bind(null, record),
    // },

  ]
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
