<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit"
              width="600px" :bodyStyle="{ padding: '20px 40px 20px 20px'}">
    <BasicForm @register="registerForm"/>
  </BasicModal>
</template>
<script lang="ts" setup>
import {ref, unref} from 'vue';
import {rules} from '/@/utils/helper/validator';
import {defHttp} from '/@/utils/http/axios';
import {BasicModal, useModalInner} from '/@/components/Modal';
import BasicForm from '/@/components/Form/src/BasicForm.vue';
import {useForm} from '/@/components/Form/src/hooks/useForm';
import {useMessage} from '/@/hooks/web/useMessage';
import {useLocaleStore} from '/@/store/modules/locale';
import {useI18n} from '/@/hooks/web/useI18n';
import {companyEditApi, companyPerfectApi, companyQueryByIdApi} from "@/api/sys/company";

const localeStore = useLocaleStore();
const {t} = useI18n();
// 声明Emits
const emit = defineEmits(['register']);
const $message = useMessage();
const formRef = ref();
const companyId = ref();
// update-begin--author:liaozhiyang---date:20240124---for：【QQYUN-7970】国际化
const title = ref('基本信息');
//表单配置
const [registerForm, {resetFields, setFieldsValue, validate, clearValidate}] = useForm({
  schemas: [
    {
      label: '企业名称',
      field: 'companyName',
      component: 'Input',
      required: true,
    },
    {
      label: '企业地址',
      field: 'address',
      component: 'Input',
      required: true,
    },
    {
      label: '企业电话',
      field: 'telephone',
      component: 'Input',
      required: true,
    },
    {
      label: '纳税人识别号',
      field: 'tin',
      component: 'Input',
      required: true,
    },
    {
      label: '开户行名称',
      field: 'backName',
      component: 'Input',
      required: true,
    },
    {
      label: '法人名称',
      field: 'corporateName',
      component: 'Input',
      required: true,
    },
  ],
  showActionButtonGroup: false,
  wrapperCol: null,
  labelWidth: localeStore.getLocale == 'zh_CN' ? 120 : 160,
});
// update-end--author:liaozhiyang---date:20240124---for：【QQYUN-7970】国际化
//表单赋值
const [registerModal, {setModalProps, closeModal}] = useModalInner();

//表单提交事件
async function handleSubmit() {
  try {
    const values = await validate();
    setModalProps({confirmLoading: true});
    //提交表单
    let params = Object.assign({id: unref(companyId)}, values);
    companyPerfectApi(params).then((res) => {
      if (res.success) {
        $message.createMessage.success('保存成功');
        //关闭弹窗
        closeModal();
      } else {
        $message.createMessage.error(res.message);
      }
    });
  } finally {
    setModalProps({confirmLoading: false});
  }
}
function loadData(){
  companyQueryByIdApi({id:companyId.value}).then(res =>{
    if(res){
      setFieldsValue({
        ...res,
      });
    }
  })
}
async function show(id) {
  if (id == null) {
    $message.createMessage.warning('当前系统无登录用户!');
    return;
  } else {
    companyId.value = id;
    await setModalProps({visible: true});
    // await resetFields();
    // await clearValidate();
    loadData();
  }
}

defineExpose({
  title,
  show,
});
</script>
