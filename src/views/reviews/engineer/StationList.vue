<template>
  <div class="p-2">
    <!--查询区域-->
    <div class="jeecg-basic-table-form-container">
      <a-form ref="formRef" @keyup.enter.native="searchQuery" :model="queryParam"
              :label-col="labelCol">
        <a-row :gutter="24">
          <a-col :lg="6">
            <a-form-item name="realName">
              <template #label><span title="真实姓名">真实姓名</span></template>
              <a-input placeholder="请输入真实姓名" v-model:value="queryParam.realName"
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
    <BasicTable @register="registerTable">
      <!--插槽:table标题-->
      <template #tableTitle>
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

<script lang="ts" name="engineer" setup>
import {reactive, ref} from 'vue';
import {BasicTable, TableAction} from '/@/components/Table';
import {useListPage} from '/@/hooks/system/useListPage';
import {columns} from './StationList.data';
import {useUserStore} from '/@/store/modules/user';
import {useMessage} from '/@/hooks/web/useMessage';
import {getDateByPicker} from '/@/utils';
import {message} from "ant-design-vue";

import {audit, queryPostEngineer} from "@/views/reviews/engineer/engineer.api";

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
    title: '工程师审核列表',
    api: queryPostEngineer,
    columns,
    canResize: true,
    useSearchForm: false,
    actionColumn: {
      width: 80,
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
  // exportConfig: {
  //   name: "工程师审核列表",
  //   url: getExportUrl,
  //   params: queryParam,
  // },
  // importConfig: {
  //   url: getImportUrl,
  //   success: handleSuccess
  // },
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
 * 审核通过
 */
function handleAudit(record: Recordable) {
  audit({id: record.id}).then(res => {
    if (res.success) {
      message.success(res.message)
    } else {
      message.error(res.message)
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
      label: '审核通过',
      popConfirm: {
        title: '是否确认审核通过',
        confirm: handleAudit.bind(null, record),
        placement: 'topLeft',
      },
    },
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
