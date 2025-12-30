<template>
  <!-- 空模板，不显示内容 -->
</template>

<script setup lang="ts">
import { defineExpose } from "vue";
import QRCode from "qrcode";
import printJS from "print-js";

// 生成并打印二维码
const printQrCode = async (value) => {
  try {
    // 生成二维码DataURL
    const qrDataUrl = await QRCode.toDataURL(value, {
      width: 200,
      margin: 1
    });

    // 使用print-js打印，通过自定义样式让二维码居中
    printJS({
      printable: qrDataUrl,
      type: 'image',
      // 自定义打印样式，让图片居中
      style: `
        @media print {
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
          }
          img {
            display: block;
            margin: 0 auto;
          }
        }
      `,
      imageStyle: 'width: 500px; height: 500px; margin: 0 auto;'
    });
  } catch (error) {
    console.error('打印失败:', error);
    alert('二维码打印失败');
  }
};

// 暴露打印方法
defineExpose({
  printQrCode
});
</script>
