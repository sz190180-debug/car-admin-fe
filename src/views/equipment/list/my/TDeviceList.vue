<template>
  <div class="p-2">
    <div class="jeecg-basic-table-form-container">
      <a-form ref="formRef" @keyup.enter.native="searchQuery" :model="queryParam" :label-col="labelCol">
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
            <a-form-item name="mac">
              <template #label><span title="MAC地址">MAC地址</span></template>
              <a-input placeholder="请输入MAC地址" v-model:value="queryParam.mac" allow-clear></a-input>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :lg="6">
              <a-form-item name="seq">
                <template #label><span title="序列号">序列号</span></template>
                <a-input placeholder="请输入序列号" v-model:value="queryParam.seq" allow-clear></a-input>
              </a-form-item>
            </a-col>
            <a-col :lg="6">
              <a-form-item name="status">
                <template #label><span title="运行状态">运行状态</span></template>
                <SelectEnum v-model="queryParam.status" :enum="RunEnum" />
              </a-form-item>
            </a-col>
            <a-col :lg="6">
              <a-form-item name="activeStatus">
                <template #label><span title="激活状态">激活状态</span></template>
                <SelectEnum v-model="queryParam.activeStatus" :enum="ActiveEnum" />
              </a-form-item>
            </a-col>
          </template>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
              <a-col :lg="6">
                <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
                <a-button type="primary" preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
                <a @click="toggleSearchStatus = !toggleSearchStatus" style="margin-left: 8px">
                  {{ toggleSearchStatus ? '收起' : '展开' }}
                  <Icon :icon="toggleSearchStatus ? 'ant-design:up-outlined' : 'ant-design:down-outlined'" />
                </a>
              </a-col>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button
            >批量操作
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
      </template>

      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>

      <template v-slot:bodyCell="{ column, record }">
        <template v-if="column.key == 'location'">
          <a v-if="record.longitude && record.latitude" @click="skipLocation(record)"> {{ record.longitude }}, {{ record.latitude }} </a>
        </template>
      </template>
    </BasicTable>

    <TDeviceModal ref="registerModal" @success="handleSuccess"></TDeviceModal>
    <TDeviceTranceModal ref="tDeviceTranceModal" />
    <QrCodePrinter ref="qrPrinter" />

    <a-modal
      v-model:open="vpnAuthModalVisible"
      title="VPN授权"
      width="500px"
      centered
      :confirmLoading="vpnLoading"
      @ok="handleVpnAuthSubmit"
      @cancel="handleVpnAuthCancel"
    >
      <div class="p-4">
        <a-form
          ref="vpnAuthFormRef"
          :model="vpnAuthForm"
          layout="vertical"
        >
          <a-form-item
            name="remark"
            label="备注信息"
            :rules="[{ required: true, message: '请输入VPN授权备注' }]"
          >
            <a-textarea
              v-model:value="vpnAuthForm.remark"
              placeholder="请详细描述授权原因..."
              :auto-size="{ minRows: 4, maxRows: 6 }"
              show-count
              :maxlength="200"
            ></a-textarea>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" name="tDevice-tDevice" setup>
  import { reactive, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { message } from 'ant-design-vue';

  // 组件与Hooks导入
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useMessage } from '/@/hooks/web/useMessage';
  import ApiSelect from '@/components/Form/src/components/ApiSelect.vue';
  import SelectEnum from '@/components/Select/SelectEnum.vue';
  import QrCodePrinter from '@/components/Print/QrCodePrinter.vue';
  import TDeviceModal from './components/TDeviceModal.vue';
  import TDeviceTranceModal from '@/views/equipment/list/my/components/TDeviceTranceModal.vue';

  // 工具与数据导入
  import { getDateByPicker } from '/@/utils';
  import { ActiveEnum, EnableEnum, RunEnum } from '@/enums/sysEnum';
  import { deviceSkip, rcsSkip } from '@/views/equipment/common';
  import { columns, superQuerySchema } from './TDevice.data';
  import { listAll as typeList } from '@/views/equipment/devicetype/TDeviceType.api';

  // API 导入 (假设已将 vpnRemoteAuth 加入到 API 文件)
  import {
    batchDelete,
    deleteOne,
    getExportUrl,
    getImportUrl,
    list,
    sold,
    vpnRemoteAuth, // 替换原有的 axios 直接调用
  } from '/@/views/equipment/list/TDevice.api';

  const router = useRouter();
  const formRef = ref();
  const queryParam = reactive<any>({});
  const toggleSearchStatus = ref<boolean>(false);
  const registerModal = ref();
  const tDeviceTranceModal = ref();
  const qrPrinter = ref();
  const { createMessage } = useMessage();

  // ---------------- VPN 授权相关状态 ----------------
  const vpnAuthModalVisible = ref<boolean>(false);
  const vpnLoading = ref<boolean>(false); // 按钮加载状态
  const vpnAuthFormRef = ref();
  const vpnAuthForm = reactive({
    id: '', // 存储当前操作的设备ID
    remark: '',
  });
  // ------------------------------------------------

  // 注册表格
  const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
    tableProps: {
      title: '设备表',
      api: list,
      columns,
      canResize: true,
      useSearchForm: false,
      actionColumn: {
        width: 120,
        fixed: 'right',
      },
      beforeFetch: async (params) => {
        // 这里的 fieldPickers 如果不需要可以移除，或者补全定义
        queryParam.enableStatus = EnableEnum.VALID.value;
        return Object.assign(params, queryParam);
      },
    },
    exportConfig: {
      name: '设备表',
      url: getExportUrl,
      params: queryParam,
    },
    importConfig: {
      url: getImportUrl,
      success: handleSuccess,
    },
  });

  const [registerTable, { reload, getDataSource }, { rowSelection, selectedRowKeys }] = tableContext;

  const labelCol = reactive({ span: 6 });

  /**
   * 操作栏配置
   */
  function getTableAction(record) {
    return [
      {
        label: '出库',
        popConfirm: {
          title: '是否确认出库',
          confirm: handleSold.bind(null, record),
          placement: 'topLeft',
        },
        ifShow: record.soldStatus == 0,
      },
    ];
  }

  /**
   * 下拉菜单配置
   */
  function getDropDownAction(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
          placement: 'topLeft',
        },
      },
      {
        label: '设备轨迹',
        onClick: handleDeviceAll.bind(null, record),
      },
      {
        label: '控制中心跳转',
        onClick: rcsSkip.bind(null, record),
      },
      {
        label: '设备中心跳转',
        onClick: deviceSkip.bind(null, record),
      },
      {
        label: '打印二维码',
        onClick: printQrcode.bind(null, record),
      },
      {
        label: '网络授权',
        onClick: openVpnAuthModal.bind(null, record),
      },
    ];
  }

  /* ---------------- 业务逻辑方法 ---------------- */

  function skipLocation(row) {
    router.push({ path: '/dashboard/analysis', query: { deviceId: row.id } });
  }

  function handleEdit(record: Recordable) {
    registerModal.value.disableSubmit = false;
    registerModal.value.edit(record);
  }

  function handleDetail(record: Recordable) {
    registerModal.value.disableSubmit = true;
    registerModal.value.edit(record);
  }

  function handleSold(record: Recordable) {
    sold({ id: record.id }).then((res) => {
      res.success ? message.success(res.message) : message.error(res.message);
      handleSuccess();
    });
  }

  function handleDeviceAll(record: Recordable) {
    tDeviceTranceModal.value.open(record.id);
  }

  async function handleDelete(record) {
    await deleteOne({ id: record.id }, handleSuccess);
  }

  async function batchHandleDelete() {
    await batchDelete({ ids: selectedRowKeys.value }, handleSuccess);
  }

  function handleSuccess() {
    (selectedRowKeys.value = []) && reload();
  }

  function printQrcode(record: Recordable) {
    qrPrinter.value.printQrCode(record.seq);
  }

  function searchQuery() {
    reload();
  }

  function searchReset() {
    formRef.value.resetFields();
    selectedRowKeys.value = [];
    reload();
  }

  /* ---------------- VPN 授权逻辑优化 ---------------- */

  /**
   * 打开 VPN 授权弹窗
   * @param record 当前行数据
   */
  function openVpnAuthModal(record: Recordable) {
    vpnAuthFormRef.value?.resetFields();

    // 赋值当前操作的ID和重置表单
    vpnAuthForm.id = record.id;
    vpnAuthForm.remark = '';

    vpnAuthModalVisible.value = true;
  }

  function handleVpnAuthCancel() {
    vpnAuthModalVisible.value = false;
  }

  /**
   * 提交 VPN 授权
   */
  async function handleVpnAuthSubmit() {
    try {
      await vpnAuthFormRef.value.validate();

      // 开启加载状态
      vpnLoading.value = true;

      // 调用封装好的 API
      const result = await vpnRemoteAuth({
        id: vpnAuthForm.id, // 传递真实的设备ID
        remark: vpnAuthForm.remark,
      });

      // 这里通常不需要判断 status===200，框架的 defHttp 默认只返回 data 或者在错误时抛出异常
      // 视具体的 defHttp 封装而定，如果是标准 Jeecg/Vben 封装：
      vpnAuthModalVisible.value = false;

      // 可选：刷新列表
      // reload();
    } catch (error: any) {
      console.error('VPN授权失败：', error);
      // 错误消息通常由框架拦截器统一处理，如果需要单独处理：
      // createMessage.error(error.message || '操作失败');
    } finally {
      // 关闭加载状态
      vpnLoading.value = false;
    }
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

    .ant-form-item:not(.ant-form-item-with-help) {
      margin-bottom: 16px;
      height: 32px;
    }

    :deep(.ant-picker),
    :deep(.ant-input-number) {
      width: 100%;
    }
  }
</style>
