<template>
  <a-modal :title="title" :width="width" :visible="visible" @cancel="handleCancel" @ok="handleOk">
    <div class="p-2">
      <a-form ref="formRef" :model="formData"
              :label-col="labelCol">
        <a-row>
          <a-col :lg="22">
            <a-form-item label="产品">
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
        </a-row>
        <a-row>
          <a-col :lg="22">
            <a-form-item label="设备车型">
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
        </a-row>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">

import {defineExpose, reactive, ref} from "vue";
import {listAll as modelList} from "@/views/equipment/devicemodel/TDeviceModel.api";
import ApiSelect from "@/components/Form/src/components/ApiSelect.vue";
import {listAll as typeList} from "@/views/equipment/devicetype/TDeviceType.api";
import {message} from "ant-design-vue";

const emit = defineEmits(['submit']);
const visible = ref<boolean>(false);
const title = ref<string>('启用设备');
const width = ref<number>(600);
const labelCol = reactive({
  span: 4,
});

const formData = reactive({
  deviceTypeId: null,
  deviceModelId: null,
});

/**
 * 取消按钮回调事件
 */
function handleCancel() {
  visible.value = false;
}

/**
 * 选择回调
 */

const handleOk = () => {
  if (!formData.deviceTypeId) {
    message.error('请选择产品')
    return
  }
  if (!formData.deviceModelId) {
    message.error('请选择设备车型')
    return
  }
  visible.value = false;
  emit('submit', formData)
}

/**
 * 打开
 */
function open() {
  visible.value = true;
}

defineExpose({
  open,
});
</script>

<style scoped lang="less">

</style>
