<template>
  <a-spin :spinning="confirmLoading">
    <JFormContainer :disabled="disabled">
      <template #detail>
        <a-form ref="formRef" class="antd-modal-form" :labelCol="labelCol" :wrapperCol="wrapperCol"
                name="TCompanyForm">
          <a-row>
            <a-col :span="24">
              <a-form-item label="服务网点名称" v-bind="validateInfos.companyName"
                           id="TCompanyForm-companyName" name="companyName">
                <a-input v-model:value="formData.companyName" placeholder="请输入服务网点名称"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <!--            <a-col :span="24">-->
            <!--              <a-form-item label="父服务网点id" v-bind="validateInfos.parentId" id="TCompanyForm-parentId" name="parentId">-->
            <!--                <a-input v-model:value="formData.parentId" placeholder="请输入父服务网点id"  allow-clear ></a-input>-->
            <!--              </a-form-item>-->
            <!--            </a-col>-->
            <a-col :span="24">
              <a-form-item label="联系电话" v-bind="validateInfos.phone" id="TCompanyForm-phone"
                           name="phone">
                <a-input v-model:value="formData.phone" placeholder="请输入联系电话"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="联系人名称" v-bind="validateInfos.name" id="TCompanyForm-name"
                           name="name">
                <a-input v-model:value="formData.name" placeholder="请输入联系人名称"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="服务网点地址" v-bind="validateInfos.address"
                           id="TCompanyForm-address" name="address">
                <a-input v-model:value="formData.address" placeholder="请输入服务网点地址"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="电子邮箱" v-bind="validateInfos.email" id="TCompanyForm-email"
                           name="email">
                <a-input v-model:value="formData.email" placeholder="请输入电子邮箱"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24" v-if="disabled">
              <a-form-item label="邀请码" v-bind="validateInfos.invitationCode"
                           id="TCompanyForm-invitationCode" name="invitationCode">
                <a-input v-model:value="formData.invitationCode" placeholder="请输入邀请码-展示"
                         allow-clear></a-input>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </template>
    </JFormContainer>
  </a-spin>
</template>

<script lang="ts" setup>
import {ref, reactive, defineExpose, nextTick, defineProps, computed, onMounted} from 'vue';
import {defHttp} from '/@/utils/http/axios';
import {useMessage} from '/@/hooks/web/useMessage';
import {getDateByPicker, getValueType} from '/@/utils';
import {Form} from 'ant-design-vue';
import JFormContainer from '/@/components/Form/src/container/JFormContainer.vue';
import {saveOrUpdate} from "@/views/company/TCompany.api";

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
  companyName: '',
  parentId: '',
  phone: '',
  name: '',
  address: '',
  email: '',
  invitationCode: '',
  status: undefined,
  pid: '',
});
const {createMessage} = useMessage();
const labelCol = ref<any>({xs: {span: 24}, sm: {span: 5}});
const wrapperCol = ref<any>({xs: {span: 24}, sm: {span: 16}});
const confirmLoading = ref<boolean>(false);
//表单验证
const validatorRules = reactive({
  companyName: [{required: true, message: '请输入服务网点名称!'}],
  phone: [{required: true, message: '请输入联系电话!'}],
  name: [{required: true, message: '请输入联系人名称!'}],
  address: [{required: true, message: '请输入服务网点地址!'}],
});
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
