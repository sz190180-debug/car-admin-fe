<template>
  <a-spin :spinning="confirmLoading">
    <JFormContainer :disabled="disabled">
      <template #detail>
        <a-form ref="formRef" class="antd-modal-form" :labelCol="labelCol" :wrapperCol="wrapperCol"
                name="TDeviceForm">
          <a-row>
            <a-col :span="24">
              <a-form-item label="产品" v-bind="validateInfos.deviceTypeId"
                           id="TDeviceForm-deviceTypeId" name="deviceTypeId">
                <ApiSelect
                  :api="typeList"
                  showSearch
                  allow-clear
                  placeholder="请选择产品"
                  v-model:value="formData.deviceTypeId"
                  optionFilterProp="label"
                  resultField="list"
                  labelField="type"
                  valueField="id"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="设备车型" v-bind="validateInfos.deviceModelId"
                           id="TDeviceForm-deviceModelId" name="deviceModelId">
                <ApiSelect
                  :api="modelList"
                  showSearch
                  allow-clear
                  placeholder="请选择设备车型"
                  v-model:value="formData.deviceModelId"
                  optionFilterProp="label"
                  resultField="list"
                  labelField="model"
                  valueField="id"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24" v-if="disabled">
              <a-form-item label="车型名称" v-bind="validateInfos.deviceModelName" id="TDeviceForm-deviceModelName"
                           name="deviceModelName">
                <a-input v-model:value="formData.deviceModelName" placeholder="请输入车型名称"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24" v-if="disabled">
              <a-form-item label="MAC地址" v-bind="validateInfos.mac" id="TDeviceForm-mac"
                           name="mac">
                <a-input v-model:value="formData.mac" placeholder="请输入MAC地址"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="控制中心" v-bind="validateInfos.rcs" id="TDeviceForm-rcs"
                           name="rcs">
                <a-input v-model:value="formData.rcs" placeholder="请输入控制中心"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24" v-if="disabled">
              <a-form-item label="经度" v-bind="validateInfos.longitude" id="TDeviceForm-longitude"
                           name="longitude">
                <a-input-number v-model:value="formData.longitude" placeholder="请输入经度"
                                style="width: 100%"/>
              </a-form-item>
            </a-col>
            <a-col :span="24" v-if="disabled">
              <a-form-item label="维度" v-bind="validateInfos.latitude" id="TDeviceForm-latitude"
                           name="latitude">
                <a-input-number v-model:value="formData.latitude" placeholder="请输入维度"
                                style="width: 100%"/>
              </a-form-item>
            </a-col>
            <a-col :span="24" v-if="disabled">
              <a-form-item label="最后定位时间" v-bind="validateInfos.lastTime"
                           id="TDeviceForm-lastTime" name="lastTime">
                <a-date-picker placeholder="请选择最后定位时间" v-model:value="formData.lastTime"
                               showTime value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%"
                               allow-clear/>
              </a-form-item>
            </a-col>
            <a-col :span="24" v-if="disabled">
              <a-form-item label="最后定位地址" v-bind="validateInfos.addr" id="TDeviceForm-addr"
                           name="addr">
                <a-input v-model:value="formData.addr" placeholder="请输入最后定位地址"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="整机编号" v-bind="validateInfos.deviceNumber"
                           id="TDeviceForm-deviceNumber" name="deviceNumber">
                <a-input v-model:value="formData.deviceNumber" placeholder="请输入整机编号"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="ICCID" v-bind="validateInfos.simIccid"
                           id="TDeviceForm-simIccid" name="simIccid">
                <a-input v-model:value="formData.simIccid" placeholder="请输入ICCID"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="电池编码" v-bind="validateInfos.batterySn"
                           id="TDeviceForm-batterySn" name="batterySn">
                <a-input v-model:value="formData.batterySn" placeholder="请输入电池编码"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="UUID" v-bind="validateInfos.uuid" id="TDeviceForm-uuid"
                           name="uuid">
                <a-input v-model:value="formData.uuid" placeholder="请输入UUID"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="备注" v-bind="validateInfos.remark"
                           id="TDeviceForm-remark" name="remark">
                <a-input v-model:value="formData.remark" placeholder="请输入备注"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24" v-if="disabled">
              <a-form-item label="IP地址" v-bind="validateInfos.ip"
                           id="TDeviceForm-ip" name="ip">
                <a-input v-model:value="formData.ip" placeholder="请输入IP地址"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24" v-if="disabled">
              <a-form-item label="网关" v-bind="validateInfos.ipGateway"
                           id="TDeviceForm-ipGateway" name="ipGateway">
                <a-input v-model:value="formData.ipGateway" placeholder="请输入网关"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24" v-if="disabled">
              <a-form-item label="售后到期日" v-bind="validateInfos.activeEndTimeText"
                           id="TDeviceForm-activeEndTimeText"
                           name="activeEndTimeText">
                <a-input v-model:value="formData.activeEndTimeText"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24"
                   v-if="!disabled && userStore.getUserInfo.userType == UserTypeEnum.SUPER.value">
              <a-form-item label="售后到期日" v-bind="validateInfos.activeEndTime"
                           id="TDeviceForm-activeEndTime"
                           name="activeEndTime">
                <a-date-picker v-model:value="formData.activeEndTime"
                               style="width: 100%;"
                               show-time
                               placeholder="请选择售后到期日"
                               :format="dateFormat"/>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </template>
    </JFormContainer>
  </a-spin>
</template>

<script lang="ts" setup>
import {computed, defineExpose, defineProps, nextTick, reactive, ref} from 'vue';
import {useMessage} from '/@/hooks/web/useMessage';
import {getDateByPicker, getValueType} from '/@/utils';
import {saveOrUpdate} from '/@/views/equipment/list/TDevice.api';
import {Form} from 'ant-design-vue';
import JFormContainer from '/@/components/Form/src/container/JFormContainer.vue';
import {listAll as modelList} from "@/views/equipment/devicemodel/TDeviceModel.api";
import ApiSelect from "@/components/Form/src/components/ApiSelect.vue";
import {listAll as typeList} from "@/views/equipment/devicetype/TDeviceType.api";
import {UserTypeEnum} from "@/enums/sysEnum";
import {useUserStore} from "@/store/modules/user";
import dayjs from "dayjs";
import {getActiveEndTimeText} from "@/views/equipment/common";

const props = defineProps({
  formDisabled: {type: Boolean, default: false},
  formData: {type: Object, default: () => ({})},
  formBpm: {type: Boolean, default: true}
});
const userStore = useUserStore();
const formRef = ref();
const useForm = Form.useForm;
const emit = defineEmits(['register', 'ok']);
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const formData = reactive<Record<string, any>>({
  id: '',
  deviceTypeId: '',
  deviceModelId: '',
  deviceModelName: '',
  mac: '',
  rcs: '',
  seq: '',
  status: undefined,
  activeStatus: undefined,
  enableStatus: undefined,
  companyId: undefined,
  longitude: undefined,
  latitude: undefined,
  lastTime: '',
  addr: '',
  deviceNumber: '',
  simIccid: '',
  simImei: '',
  batterySn: '',
  uuid: '',
  remark: '',
  ip: '',
  ipGateway: '',
  activeEndTime: null,
  activeEndTimeDay: null,
  activeEndTimeText: '',
});
const {createMessage, createConfirm} = useMessage();
const labelCol = ref<any>({xs: {span: 24}, sm: {span: 5}});
const wrapperCol = ref<any>({xs: {span: 24}, sm: {span: 16}});
const confirmLoading = ref<boolean>(false);
//表单验证
const validatorRules = reactive({});
const {
  resetFields,
  validate,
  validateInfos
} = useForm(formData, validatorRules, {immediate: false});
//日期个性化选择
const fieldPickers = reactive({});

// 表单禁用
const disabled = computed(() => {
  if (props.formBpm === true) {
    if (props.formData.disabled === false) {
      return false;
    } else {
      return true;
    }
  }
  return props.formDisabled;
});


/**
 * 新增
 */
function add() {
  edit({});
}

/**
 * 编辑
 */
function edit(record) {
  nextTick(() => {
    resetFields();
    const tmpData = {};
    Object.keys(formData).forEach((key) => {
      if (record.hasOwnProperty(key)) {
        tmpData[key] = record[key]
      }
    })
    //赋值
    Object.assign(formData, {
      ...tmpData,
      activeEndTime: tmpData.activeEndTime ? dayjs(tmpData.activeEndTime) : dayjs(),
      activeEndTimeText: getActiveEndTimeText(tmpData.activeEndTimeDay),
    });
  });
}

/**
 * 提交数据
 */
async function submitForm() {
  try {
    // 触发表单验证
    await validate();
  } catch ({errorFields}) {
    if (errorFields) {
      const firstField = errorFields[0];
      if (firstField) {
        formRef.value.scrollToField(firstField.name, {behavior: 'smooth', block: 'center'});
      }
    }
    return Promise.reject(errorFields);
  }
  confirmLoading.value = true;
  const isUpdate = ref<boolean>(false);
  //时间格式化
  let model = formData;
  if (model.id) {
    isUpdate.value = true;
  }
  //循环数据
  for (let data in model) {
    // 更新个性化日期选择器的值
    model[data] = getDateByPicker(model[data], fieldPickers[data]);
    //如果该数据是数组并且是字符串类型
    if (model[data] instanceof Array) {
      let valueType = getValueType(formRef.value.getProps, data);
      //如果是字符串类型的需要变成以逗号分割的字符串
      if (valueType === 'string') {
        model[data] = model[data].join(',');
      }
    }
  }
  await saveOrUpdate(model, isUpdate.value)
    .then((res) => {
      if (res.success) {
        createMessage.success(res.message);
        emit('ok');
      } else {
        createMessage.warning(res.message);
      }
    })
    .finally(() => {
      confirmLoading.value = false;
    });
}


defineExpose({
  add,
  edit,
  submitForm,
});
</script>

<style lang="less" scoped>
.antd-modal-form {
  padding: 14px 20px;
}
</style>
