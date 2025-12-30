<template>
  <div class="aui-content">
    <div class="aui-container">
      <a-card title="网点注册" bordered>
        <a-form ref="formRef" :model="formData" :rules="rules" :label-col="{ span: 6 }">
          <a-form-item label="真实姓名" name="name">
            <a-input v-model:value="formData.name" placeholder="请输入联系人名称"/>
          </a-form-item>

          <a-form-item label="电子邮箱" name="email">
            <a-input v-model:value="formData.email" placeholder="请输入电子邮箱"/>
          </a-form-item>

          <a-form-item label="邀请码" name="invitationCode">
            <a-input v-model:value="formData.invitationCode" placeholder="请输入邀请码（可选）"/>
          </a-form-item>

          <a-form-item label="密码" name="password">
            <a-input-password v-model:value="formData.password" placeholder="请输入密码"
                              autocomplete="new-password"/>
          </a-form-item>

          <a-form-item label="确认密码" name="confirmPassword">
            <a-input-password v-model:value="formData.confirmPassword" placeholder="请再次输入密码"
                              autocomplete="new-password"/>
          </a-form-item>

          <a-form-item label="手机号" name="phone">
            <a-input v-model:value="formData.phone" placeholder="请输入手机号"/>
          </a-form-item>

          <!-- 验证码输入 -->
          <a-form-item label="短信验证码" name="smsCode">
            <a-input-group compact style="width: 100%">
              <a-input v-model:value="formData.smsCode" placeholder="请输入短信验证码"
                       style="width: calc(100% - 120px)"/>
              <a-button type="primary" style="width: 120px" :disabled="!showInterval"
                        @click="getLoginCode">
                {{ showInterval ? '获取验证码' : timeRuning + 's' }}
              </a-button>
            </a-input-group>
          </a-form-item>
        </a-form>
        <div style="text-align: center; margin-top: 40px">
          <a-space>
            <a-button type="primary" @click="registerHandleClick">注册</a-button>
            <a-button @click="goBackHandleClick">返回</a-button>
          </a-space>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script lang="ts" setup name="mini-register">
import {reactive, ref} from 'vue';
import {useMessage} from '/@/hooks/web/useMessage';
import {getRegisterCaptcha} from '/@/api/sys/user';
import {ExceptionEnum} from '/@/enums/exceptionEnum';
import {notification} from 'ant-design-vue';
import {companyRegisterApi} from '@/api/sys/company';
import {UserTypeEnum} from '@/enums/sysEnum';

const {createMessage} = useMessage();
const emit = defineEmits(['go-back', 'success']);
const formRef = ref();

const formData = reactive({
  companyType: UserTypeEnum.AGENT.value,
  companyName: '',
  phone: '',
  name: '',
  address: '',
  email: '',
  invitationCode: '',
  telephone: '',
  tin: '',
  backName: '',
  corporateName: '',
  smsCode: '',
  password: '',
  confirmPassword: '',
});
const current = ref<number>(0);
const next = async () => {
  await formRef.value?.validate();
  current.value++;
};
const prev = () => {
  current.value--;
};
const steps = [
  {
    title: '基本信息',
    icon: '',
  },
  {
    title: '账号信息',
    icon: '',
  },
];
const items = steps.map((item) => ({key: item.title, title: item.title}));
const showInterval = ref(true);
const timeRuning = ref(60);
let timer: any = null;

const rules = {
  companyName: [{required: true, message: '请输入服务网点名称', trigger: 'blur'}],
  phone: [{required: true, message: '请输入联系电话', trigger: 'blur'}],
  name: [{required: true, message: '请输入联系人名称', trigger: 'blur'}],
  address: [{required: true, message: '请输入服务网点地址', trigger: 'blur'}],
  smsCode: [{required: true, message: '请输入短信验证码', trigger: 'blur'}],
  telephone: [{required: true, message: '请输入企业电话', trigger: 'blur'}],
  tin: [{required: true, message: '请输入纳税人识别号', trigger: 'blur'}],
  backName: [{required: true, message: '请输入开户行名称', trigger: 'blur'}],
  corporateName: [{required: true, message: '请输入法人名称', trigger: 'blur'}],
  password: [{required: true, message: '请输入密码', trigger: 'blur'}],
  confirmPassword: [
    {required: true, message: '请确认密码', trigger: 'blur'},
    {
      validator: (_, value) => {
        if (value !== formData.password) {
          return Promise.reject('两次输入的密码不一致');
        }
        return Promise.resolve();
      },
      trigger: 'blur',
    },
  ],
};

/** 获取验证码 */
async function getLoginCode() {
  if (!formData.phone) {
    createMessage.warn('请输入手机号');
    return;
  }
  try {
    const result = await getRegisterCaptcha({
      phone: formData.phone,
    }).catch((res) => {
      if (res.code === ExceptionEnum.PHONE_SMS_FAIL_CODE) {
        createMessage.error('短信发送过于频繁，请稍后再试');
      }
    });

    if (result) {
      createMessage.success('验证码发送成功');
      const TIME_COUNT = 60;
      if (!timer) {
        timeRuning.value = TIME_COUNT;
        showInterval.value = false;
        timer = setInterval(() => {
          if (timeRuning.value > 0 && timeRuning.value <= TIME_COUNT) {
            timeRuning.value -= 1;
          } else {
            showInterval.value = true;
            clearInterval(timer);
            timer = null;
          }
        }, 1000);
      }
    }
  } catch (e) {
    createMessage.error('验证码发送失败');
  }
}

/** 注册 */
async function registerHandleClick() {
  await formRef.value?.validate();
  formData.companyType = UserTypeEnum.AGENT.value;
  const result = await companyRegisterApi(formData);
  if (result && result.data.success) {
    notification.success({
      message: '注册成功',
      description: result.data.message,
    });
    emit('success', {username: formData.phone, password: formData.password});
    initForm();
  } else {
    notification.warning({
      message: '注册失败',
      description: result.data?.message || '网络异常，请重试',
    });
  }
}

/** 返回 */
function goBackHandleClick() {
  emit('go-back');
  initForm();
}

/** 初始化表单 */
function initForm() {
  current.value = 0
  Object.keys(formData).forEach((k) => (formData[k] = ''));
  formRef.value?.clearValidate();
  if (timer) {
    clearInterval(timer);
    showInterval.value = true;
    timeRuning.value = 60;
  }
}

function setData(data) {
  formData.invitationCode = data.invitationCode
}

defineExpose({
  initForm,
  setData,
});
</script>

<style lang="less" scoped>
.aui-container {
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 4px 8px 1px rgba(0, 0, 0, 0.2);
  width: 92%;
  height: auto;

  /* PC端保持原有固定定位 */
  @media (min-width: 769px) {
    position: fixed;
    top: 50%;
    left: 50%;
    -webkit-transform: translateX(-50%) translateY(-50%);
    -moz-transform: translateX(-50%) translateY(-50%);
    -ms-transform: translateX(-50%) translateY(-50%);
    transform: translateX(-50%) translateY(-50%);
    -webkit-transform: translateX(-50%) translateY(-50%);
  }

  /* 移动端移除固定定位，支持滑动 */
  @media (max-width: 768px) {
    position: relative;
    top: auto;
    left: auto;
    transform: none;
    -webkit-transform: none;
    -moz-transform: none;
    -ms-transform: none;
    margin: 20px auto;
    padding: 10px;
    box-sizing: border-box;
  }
}

/* 移动端页面允许滚动 */
@media (max-width: 768px) {
  :deep(html),
  :deep(body) {
    overflow-y: auto !important;
    height: auto !important;
  }

  .aui-content {
    min-height: 100vh;
    overflow-y: auto;
  }
}
</style>
