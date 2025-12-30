<template>
  <a-modal :title="title" :width="width" :visible="visible" @cancel="handleCancel" @ok="handleOk">
    <div class="p-2">
      <a-form ref="formRef" :label-col="labelCol">
        <a-row>
          <a-col :span="24">
            <a-form-item :label="label">
              <a-input v-model:value="data"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
  </a-modal>
</template>
<script setup lang="ts">

import {defineExpose, reactive, ref} from "vue";

const emit = defineEmits(['submit']);
const props = defineProps(['title', 'label'])
const visible = ref<boolean>(false);
const width = ref<number>(600);
const labelCol = reactive({
  span: 4,
});

const data = ref();

/**
 * 取消按钮回调事件
 */
function handleCancel() {
  visible.value = false;
}

/**
 * 打开
 */
function open(defaultText) {
  data.value = defaultText
  visible.value = true;
}

/**
 * 选择回调
 */

const handleOk = () => {
  visible.value = false;
  emit('submit', data.value?.trim())
}

defineExpose({
  open,
});
</script>

<style scoped lang="less">

</style>
