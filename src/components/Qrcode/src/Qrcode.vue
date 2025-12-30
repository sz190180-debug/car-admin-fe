<template>
  <div>
    <component :is="tag" ref="wrapRef"/>
  </div>
</template>
<script lang="ts">
import {defineComponent, watch, PropType, ref, unref, onMounted} from 'vue';
import {toCanvas, QRCodeRenderersOptions, LogoType} from './qrcodePlus';
import {toDataURL} from 'qrcode';
import {downloadByUrl} from '/@/utils/file/download';
import {QrcodeDoneEventParams} from './typing';
import html2pdf from 'html2pdf.js';
import {message} from "ant-design-vue";

export default defineComponent({
  name: 'QrCode',
  props: {
    value: {
      type: [String, Array] as PropType<string | any[]>,
      default: null,
    },
    // 参数
    options: {
      type: Object as PropType<QRCodeRenderersOptions>,
      default: null,
    },
    // 宽度
    width: {
      type: Number as PropType<number>,
      default: 200,
    },
    // 中间logo图标
    logo: {
      type: [String, Object] as PropType<Partial<LogoType> | string>,
      default: '',
    },
    // img 不支持内嵌logo
    tag: {
      type: String as PropType<'canvas' | 'img'>,
      default: 'canvas',
      validator: (v: string) => ['canvas', 'img'].includes(v),
    },
  },
  emits: {done: (data: QrcodeDoneEventParams) => !!data, error: (error: any) => !!error},
  setup(props, {emit}) {
    const wrapRef = ref<HTMLCanvasElement | HTMLImageElement | null>(null);

    async function createQrcode() {
      try {
        const {tag, value, options = {}, width, logo} = props;
        const renderValue = String(value);
        const wrapEl = unref(wrapRef);

        // 无值不生成
        if (renderValue == null || renderValue === '') {
          return;
        }

        if (!wrapEl) return;

        if (tag === 'canvas') {
          const url: string = await toCanvas({
            canvas: wrapEl,
            width,
            logo: logo as any,
            content: renderValue,
            options: options || {},
          });
          emit('done', {url, ctx: (wrapEl as HTMLCanvasElement).getContext('2d')});
          return;
        }

        if (tag === 'img') {
          const url = await toDataURL(renderValue, {
            errorCorrectionLevel: 'H',
            width,
            ...options,
          });
          (unref(wrapRef) as HTMLImageElement).src = url;
          emit('done', {url});
        }
      } catch (error) {
        emit('error', error);
      }
    }

    /**
     * file download
     */
    function download(fileName?: string) {
      let url = '';
      const wrapEl = unref(wrapRef);
      if (wrapEl instanceof HTMLCanvasElement) {
        url = wrapEl.toDataURL();
      } else if (wrapEl instanceof HTMLImageElement) {
        url = wrapEl.src;
      }
      if (!url) return;
      downloadByUrl({
        url,
        fileName,
      });
    }

    /**
     * 新增：下载为PDF文件
     * @param fileName PDF文件名
     */
    async function downloadAsPdf(fileName?: string) {
      try {
        const wrapEl = unref(wrapRef);
        if (!wrapEl) {
          message.error('PDF下载失败')
          return;
        }
        // 配置PDF（保持二维码比例和清晰度）
        const opt = {
          margin: 10, // PDF边距
          filename: fileName || 'qrcode.pdf', // 默认文件名
          image: {type: 'jpeg', quality: 1.0}, // 图片质量（无损）
          html2canvas: {
            scale: 2, // 缩放比例（提升PDF清晰度）
            useCORS: true, // 解决跨域图片问题（如有logo跨域）
            logging: false // 关闭日志
          },
          jsPDF: {
            unit: 'mm', // 单位：毫米
            format: 'a4', // 纸张尺寸：A4
            orientation: 'portrait' // 纵向
          }
        };

        // 生成并下载PDF（直接传入二维码元素）
        await html2pdf().set(opt).from(wrapEl).save();
      } catch (error) {
        message.error('PDF下载失败')
        console.error('PDF下载失败：', error);
      }
    }

    onMounted(createQrcode);

    // 监听参数变化重新生成二维码
    watch(
      props,
      () => {
        createQrcode();
      },
      {
        deep: true,
      }
    );

    return {wrapRef, download, downloadAsPdf};
  },
});
</script>
