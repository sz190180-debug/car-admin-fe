<template>
  <div>
    <a-select
      v-model:value="model"
      :placeholder="placeholder"
      :disabled="disabled"
      allowClear
      style="width: 100%"
      :options="options"
    >
    </a-select>
  </div>
</template>
<script setup lang="ts">
import {computed, defineProps, ref} from "vue";

const props = defineProps({
  enum: {type: Object, default: {}},
  placeholder: {type: String, default: ''},
  disabled: {type: Boolean, default: false},
});
const model = defineModel();
const options = computed(() => {
  const values = Object.values(props.enum);
  if (values.length === 0) return [];
  if (typeof values[0] === 'string') {
    return values.map(item => ({
      value: item,
      label: item
    }));
  } else if (typeof values[0] === 'object' && values[0] !== null) {
    return values;
  }
  return [];
})
</script>

<style scoped lang="less">

</style>
