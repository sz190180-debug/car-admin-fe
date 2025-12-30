<template>
  <a-spin :spinning="confirmLoading">
    <JFormContainer :disabled="disabled">
      <template #detail>
        <a-form ref="formRef" class="antd-modal-form" :labelCol="labelCol" :wrapperCol="wrapperCol"
                name="TWorkOrderForm">
          <a-row>
            <a-col :span="24">
              <a-form-item label="设备id" v-bind="validateInfos.deviceId"
                           id="TWorkOrderForm-deviceId" name="deviceId">
                <a-input-number v-model:value="formData.deviceId" placeholder="请输入设备id"
                                style="width: 100%"/>
              </a-form-item>
            </a-col>
            <!--						<a-col :span="24">-->
            <!--							<a-form-item label="工单编号" v-bind="validateInfos.orderNo" id="TWorkOrderForm-orderNo" name="orderNo">-->
            <!--								<a-input v-model:value="formData.orderNo" placeholder="请输入工单编号"  allow-clear ></a-input>-->
            <!--							</a-form-item>-->
            <!--						</a-col>-->
            <a-col :span="24">
              <a-form-item label="问题描述" v-bind="validateInfos.description"
                           id="TWorkOrderForm-description" name="description">
                <a-input v-model:value="formData.description" placeholder="请输入问题描述"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <!--						<a-col :span="24">-->
            <!--							<a-form-item label="联系人（提报人）" v-bind="validateInfos.contactUser" id="TWorkOrderForm-contactUser" name="contactUser">-->
            <!--								<a-input v-model:value="formData.contactUser" placeholder="请输入联系人（提报人）"  allow-clear ></a-input>-->
            <!--							</a-form-item>-->
            <!--						</a-col>-->
            <!--						<a-col :span="24">-->
            <!--							<a-form-item label="处理人" v-bind="validateInfos.handlerUser" id="TWorkOrderForm-handlerUser" name="handlerUser">-->
            <!--								<a-input v-model:value="formData.handlerUser" placeholder="请输入处理人"  allow-clear ></a-input>-->
            <!--							</a-form-item>-->
            <!--						</a-col>-->
            <!--						<a-col :span="24">-->
            <!--							<a-form-item label="工单状态：0-待处理，1-处理中，2-结单" v-bind="validateInfos.status" id="TWorkOrderForm-status" name="status">-->
            <!--								<a-input-number v-model:value="formData.status" placeholder="请输入工单状态：0-待处理，1-处理中，2-结单" style="width: 100%" />-->
            <!--							</a-form-item>-->
            <!--						</a-col>-->
            <a-col :span="24">
              <a-form-item label="备注" v-bind="validateInfos.remark" id="TWorkOrderForm-remark"
                           name="remark">
                <a-input v-model:value="formData.remark" placeholder="请输入备注"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <!--						<a-col :span="24">-->
            <!--							<a-form-item label="转派操作人（原处理人）" v-bind="validateInfos.transferUser" id="TWorkOrderForm-transferUser" name="transferUser">-->
            <!--								<a-input v-model:value="formData.transferUser" placeholder="请输入转派操作人（原处理人）"  allow-clear ></a-input>-->
            <!--							</a-form-item>-->
            <!--						</a-col>-->
            <!--						<a-col :span="24">-->
            <!--							<a-form-item label="转派原因" v-bind="validateInfos.transferRemark" id="TWorkOrderForm-transferRemark" name="transferRemark">-->
            <!--								<a-input v-model:value="formData.transferRemark" placeholder="请输入转派原因"  allow-clear ></a-input>-->
            <!--							</a-form-item>-->
            <!--						</a-col>-->
            <!--						<a-col :span="24">-->
            <!--							<a-form-item label="处理人手机号" v-bind="validateInfos.handlerUserPhone" id="TWorkOrderForm-handlerUserPhone" name="handlerUserPhone">-->
            <!--								<a-input v-model:value="formData.handlerUserPhone" placeholder="请输入处理人手机号"  allow-clear ></a-input>-->
            <!--							</a-form-item>-->
            <!--						</a-col>-->
            <!--						<a-col :span="24">-->
            <!--							<a-form-item label="开始处理工单的时间" v-bind="validateInfos.processDate" id="TWorkOrderForm-processDate" name="processDate">-->
            <!--								<a-date-picker placeholder="请选择开始处理工单的时间"  v-model:value="formData.processDate" showTime value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%"  allow-clear />-->
            <!--							</a-form-item>-->
            <!--						</a-col>-->
            <!--						<a-col :span="24">-->
            <!--							<a-form-item label="处理完成工单的时间" v-bind="validateInfos.processOkDate" id="TWorkOrderForm-processOkDate" name="processOkDate">-->
            <!--								<a-date-picker placeholder="请选择处理完成工单的时间"  v-model:value="formData.processOkDate" showTime value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%"  allow-clear />-->
            <!--							</a-form-item>-->
            <!--						</a-col>-->
          </a-row>
        </a-form>
      </template>
    </JFormContainer>
  </a-spin>
</template>

<script lang="ts" setup>
import {computed, defineExpose, defineProps, nextTick, reactive, ref} from 'vue';
import {useMessage} from '/src/hooks/web/useMessage';
import {getDateByPicker, getValueType} from '/src/utils';
import {apply} from '@/views/tickets/list/TWorkOrder.api';
import {Form} from 'ant-design-vue';
import JFormContainer from '/src/components/Form/src/container/JFormContainer.vue';

const props = defineProps({
  formDisabled: {type: Boolean, default: false},
  formData: {type: Object, default: () => ({})},
  formBpm: {type: Boolean, default: true}
});
const formRef = ref();
const useForm = Form.useForm;
const emit = defineEmits(['register', 'ok']);
const formData = reactive<Record<string, any>>({
  id: '',
  deviceId: undefined,
  orderNo: '',
  description: '',
  contactUser: '',
  contactUserId: '',
  handlerUser: '',
  handlerUserId: '',
  status: undefined,
  remark: '',
  transferUser: '',
  transferUserId: '',
  transferRemark: '',
  companyId: undefined,
  transferCompanyId: undefined,
  handlerUserPhone: '',
  processDate: '',
  processOkDate: '',
});
const {createMessage} = useMessage();
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
    Object.assign(formData, tmpData);
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
  await apply(model)
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
