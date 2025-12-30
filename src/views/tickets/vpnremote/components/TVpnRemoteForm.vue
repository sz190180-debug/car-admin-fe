<template>
  <a-spin :spinning="confirmLoading">
    <JFormContainer :disabled="disabled">
      <template #detail>
        <a-form ref="formRef" class="antd-modal-form" :labelCol="labelCol" :wrapperCol="wrapperCol" name="TVpnRemoteForm">
          <a-row>
						<a-col :span="24">
							<a-form-item label="设备id" v-bind="validateInfos.deviceId" id="TVpnRemoteForm-deviceId" name="deviceId">
								<a-input-number v-model:value="formData.deviceId" placeholder="请输入设备id" style="width: 100%" />
							</a-form-item>
						</a-col>
						<a-col :span="24">
							<a-form-item label="设备vpn ip地址" v-bind="validateInfos.vpnIp" id="TVpnRemoteForm-vpnIp" name="vpnIp">
								<a-input v-model:value="formData.vpnIp" placeholder="请输入设备vpn ip地址"  allow-clear ></a-input>
							</a-form-item>
						</a-col>
						<a-col :span="24">
							<a-form-item label="设备mac地址" v-bind="validateInfos.mac" id="TVpnRemoteForm-mac" name="mac">
								<a-input v-model:value="formData.mac" placeholder="请输入设备mac地址"  allow-clear ></a-input>
							</a-form-item>
						</a-col>
						<a-col :span="24">
							<a-form-item label="审批状态 0-未审批，1-审批通过，2-审批拒绝" v-bind="validateInfos.status" id="TVpnRemoteForm-status" name="status">
								<a-input-number v-model:value="formData.status" placeholder="请输入审批状态 0-未审批，1-审批通过，2-审批拒绝" style="width: 100%" />
							</a-form-item>
						</a-col>
						<a-col :span="24">
							<a-form-item label="工单id" v-bind="validateInfos.workOrderId" id="TVpnRemoteForm-workOrderId" name="workOrderId">
								<a-input-number v-model:value="formData.workOrderId" placeholder="请输入工单id" style="width: 100%" />
							</a-form-item>
						</a-col>
						<a-col :span="24">
							<a-form-item label="vpn证书下发状态 0-未生成，1-已生成" v-bind="validateInfos.vpnCertStatus" id="TVpnRemoteForm-vpnCertStatus" name="vpnCertStatus">
								<a-input-number v-model:value="formData.vpnCertStatus" placeholder="请输入vpn证书下发状态 0-未生成，1-已生成" style="width: 100%" />
							</a-form-item>
						</a-col>
						<a-col :span="24">
							<a-form-item label="拒绝原因" v-bind="validateInfos.refuseMsg" id="TVpnRemoteForm-refuseMsg" name="refuseMsg">
								<a-input v-model:value="formData.refuseMsg" placeholder="请输入拒绝原因"  allow-clear ></a-input>
							</a-form-item>
						</a-col>
						<a-col :span="24">
							<a-form-item label="申请备注" v-bind="validateInfos.remark" id="TVpnRemoteForm-remark" name="remark">
								<a-input v-model:value="formData.remark" placeholder="请输入申请备注"  allow-clear ></a-input>
							</a-form-item>
						</a-col>
          </a-row>
        </a-form>
      </template>
    </JFormContainer>
  </a-spin>
</template>

<script lang="ts" setup>
  import { ref, reactive, defineExpose, nextTick, defineProps, computed, onMounted } from 'vue';
  import { defHttp } from '/@/utils/http/axios';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getDateByPicker, getValueType } from '/@/utils';
  import { saveOrUpdate } from '../TVpnRemote.api';
  import { Form } from 'ant-design-vue';
  import JFormContainer from '/@/components/Form/src/container/JFormContainer.vue';
  const props = defineProps({
    formDisabled: { type: Boolean, default: false },
    formData: { type: Object, default: () => ({})},
    formBpm: { type: Boolean, default: true }
  });
  const formRef = ref();
  const useForm = Form.useForm;
  const emit = defineEmits(['register', 'ok']);
  const formData = reactive<Record<string, any>>({
    id: '',
    deviceId: undefined,
    vpnIp: '',   
    mac: '',   
    status: undefined,
    workOrderId: undefined,
    vpnCertStatus: undefined,
    refuseMsg: '',   
    remark: '',   
  });
  const { createMessage } = useMessage();
  const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 5 } });
  const wrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 16 } });
  const confirmLoading = ref<boolean>(false);
  //表单验证
  const validatorRules = reactive({
  });
  const { resetFields, validate, validateInfos } = useForm(formData, validatorRules, { immediate: false });
  //日期个性化选择
  const fieldPickers = reactive({
  });

  // 表单禁用
  const disabled = computed(()=>{
    if(props.formBpm === true){
      if(props.formData.disabled === false){
        return false;
      }else{
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
        if(record.hasOwnProperty(key)){
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
    } catch ({ errorFields }) {
      if (errorFields) {
        const firstField = errorFields[0];
        if (firstField) {
          formRef.value.scrollToField(firstField.name, { behavior: 'smooth', block: 'center' });
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
