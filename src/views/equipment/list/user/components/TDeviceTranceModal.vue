<template>
  <j-modal :title="title" maxHeight="500px" :width="800" :visible="visible" @cancel="handleCancel" cancelText="关闭">
    <div class="p-10">
      <a-steps
          direction="vertical"
          :current="1"
      >
        <a-step v-for="data in dataSource" :key="data.id">
          <template #icon>
            <DownCircleTwoTone/>
          </template>
          <template #description>
            <h3 style="color: slategrey">{{ data.first }}</h3>
            <h3 style="color: slategrey">{{ data.second }}</h3>
            <br/>
          </template>
        </a-step>
      </a-steps>
    </div>
    <template #footer>
      <a-button @click="handleCancel">关闭</a-button>
    </template>
  </j-modal>
</template>

<script lang="ts" setup>
import {defineExpose, ref} from 'vue';
import JModal from '/@/components/Modal/src/JModal/JModal.vue';
import {deviceAll} from "@/views/equipment/list/TDeviceTrace.api";
import {DownCircleTwoTone} from "@ant-design/icons-vue";

const title = ref<string>('');
const width = ref<number>(800);
const visible = ref<boolean>(false);
const id = ref();
const dataSource = ref([]);

/**
 * 取消按钮回调事件
 */
function handleCancel() {
  visible.value = false;
}

function reload() {
  deviceAll({id: id.value}).then(res => {
    if (res) {
      dataSource.value = res.map(item => {
        return {
          first: item.inTime ? `${item.companyName}  入库： ${item.inTime}` : '',
          second: item.outTime ? `${item.companyName}  出库： ${item.outTime}` : '',
        }
      })
    }
  })
}

function open(deviceId) {
  id.value = deviceId
  reload()
  visible.value = true;
}

defineExpose({
  open
});
</script>

<style lang="less">
/**隐藏样式-modal确定按钮 */
.jee-hidden {
  display: none !important;
}
</style>
<style lang="less" scoped></style>
