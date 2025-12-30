<template>
  <span :style="{ color }">
    {{ countdownText }}
  </span>
</template>

<script lang="ts">
import {computed, defineComponent, onUnmounted, ref, watch} from 'vue';
import {isNumber, isObject, isString} from '/@/utils/is';
import {propTypes} from '/@/utils/propTypes';

const ONE_SECOND = 1000;

export default defineComponent({
  name: 'CountdownTimer',
  props: {
    /** 开始时间（时间戳/Date对象/时间字符串） */
    startTime: propTypes.oneOfType([
      propTypes.number,
      propTypes.instanceOf(Date),
      propTypes.string,
    ]).isRequired,

    /** 持续时长（分钟） */
    duration: propTypes.number.def(30),

    /** 结束后显示的文本 */
    finishText: propTypes.string.def('已结束'),

    /** 字体颜色 */
    color: propTypes.string,

    /** 是否显示小时（false则只显示分:秒） */
    showHour: propTypes.bool.def(true),
  },
  emits: ['finish'], // 倒计时结束触发事件
  setup(props, { emit }) {
    // 剩余时间（秒）
    const remainingSeconds = ref(0);
    let timer: NodeJS.Timeout | null = null;

    // 解析开始时间为时间戳
    const getStartTimeStamp = () => {
      const { startTime } = props;
      if (isNumber(startTime)) {
        return startTime.toString().length > 10 ? startTime : startTime * 1000;
      } else if (isString(startTime)) {
        return new Date(startTime).getTime();
      } else if (isObject(startTime)) {
        return (startTime as Date).getTime();
      }
      return Date.now();
    };

    // 计算结束时间戳
    const getEndTimeStamp = () => {
      return getStartTimeStamp() + props.duration * 60 * 1000;
    };

    // 更新剩余时间
    const updateRemaining = () => {
      const endTime = getEndTimeStamp();
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        remainingSeconds.value = 0;
        clearInterval(timer!);
        timer = null;
        emit('finish');
        return;
      }

      remainingSeconds.value = Math.floor(diff / ONE_SECOND);
    };

    // 格式化倒计时文本
    const countdownText = computed(() => {
      if (remainingSeconds.value <= 0) {
        return props.finishText;
      }

      let hours = Math.floor(remainingSeconds.value / 3600);
      let minutes = Math.floor((remainingSeconds.value % 3600) / 60);
      const seconds = remainingSeconds.value % 60;

      // 补零格式化
      const pad = (num: number) => String(num).padStart(2, '0');

      if (props.showHour) {
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
      } else {
        // 不显示小时时，分钟需要累加小时部分
        minutes += hours * 60;
        return `${pad(minutes)}:${pad(seconds)}`;
      }
    });

    // 启动倒计时
    const startTimer = () => {
      updateRemaining();
      if (remainingSeconds.value > 0 && !timer) {
        timer = setInterval(updateRemaining, ONE_SECOND);
      }
    };

    // 监听依赖变化重启倒计时
    watch([() => props.startTime, () => props.duration], () => {
      if (timer) clearInterval(timer);
      timer = null;
      startTimer();
    }, { immediate: true });

    // 组件卸载清除定时器
    onUnmounted(() => {
      if (timer) clearInterval(timer);
    });

    return { countdownText };
  },
});
</script>
