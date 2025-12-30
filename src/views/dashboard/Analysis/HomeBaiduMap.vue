<template>
  <div class="map-container-wrapper">
    <baidu-map :style="mapStyle"
               class="bm-view"
               :zoom="zoom"
               :center="center"
               :scroll-wheel-zoom="true"
               @ready="handler"
               @click="clickHandler"
    >
      <bm-marker v-for="item in validPoints" :position="{lng: item.longitude, lat: item.latitude}"
                 :dragging="true"
                 animation="BMAP_ANIMATION_BOUNCE"
                 @click="infoWindowOpen(item)"/>
      <!-- 信息窗口 -->
      <bm-info-window style="width: 300px;"
                      :position="{lng: currentPoint.longitude, lat: currentPoint.latitude}"
                      :show="show" @close="infoWindowClose" @open="show = true"
                      :offset="{ height: -32}">
        <div
          style="font-size: 15px; font-weight: 600; color: #0c98b2;">
          <div>序列号：{{ currentPoint.seq }}</div>
          <div>型号：{{ currentPoint.deviceModel }}</div>
          <div>备注：{{ currentPoint.remark }}</div>
          <div><a @click="rcsSkip(currentPoint)">控制中心跳转</a> | <a @click="deviceSkip(currentPoint)">设备中心跳转</a></div>
          <div></div>
          <!--        <div>详细地址：{{ currentPoint.address }};{{ currentPoint.detailAddress }}</div>-->
        </div>
      </bm-info-window>
      <!--  缩放控件（右上角）-->
      <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-navigation>
      <!-- 设备列表 -->
      <bm-control>
        <DeviceList ref="deviceList" @click="selectDevice"/>
      </bm-control>
    </baidu-map>
    <!-- 自定义备案信息 -->
    <div class="custom-beian">
      <a href="https://beian.miit.gov.cn" target="_blank">
        <img src="@/assets/images/beian.png" style="vertical-align: middle;margin-bottom: 3px"/>
        浙ICP备15018480号-1
      </a>
      <span class="separator">|</span>
      <span>©2023-汇芯科技 版权所有</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, reactive, ref} from "vue";
import DeviceList from "@/views/dashboard/Analysis/components/DeviceList.vue";
import {EnableEnum} from "@/enums/sysEnum";
import {queryById} from '@/views/equipment/list/TDevice.api';
import {message} from "ant-design-vue";
import {useRoute} from "vue-router";
import {deviceSkip, rcsSkip} from "@/views/equipment/common";
import {getApiByUserType} from "@/views/dashboard/Analysis/api";

interface MapPoint {
  id: number | string | null;
  longitude: number | null;
  latitude: number | null;
  seq: string | null;
  deviceModel: string | null;
  remark: string | null;
  address: string | null;
  detailAddress: string | null;
  rcs: string | null;
  ip: string | null;
}

const route = useRoute();
const defaultZoom = 10;
const center = ref({lng: 0, lat: 0});
const zoom = ref(defaultZoom);
const show = ref(false);

const points = ref<MapPoint[]>([]);
// 计算属性，只返回有效的坐标点
const validPoints = computed(() => {
  return points.value.filter(point =>
    point.longitude && point.latitude &&
    !isNaN(Number(point.longitude)) &&
    !isNaN(Number(point.latitude))
  );
});

const currentPoint = ref<MapPoint>({
  id: null,
  longitude: null,
  latitude: null,
  seq: null,
  deviceModel: null,
  remark: null,
  address: null,
  detailAddress: null,
  rcs: null,
  ip: null,
});

const queryParam = reactive({
  pageNum: 1,
  pageSize: 100000,
  enableStatus: EnableEnum.VALID.value
});

// 加载数据
const loadData = async () => {
  const api = getApiByUserType.value;
  if (!api) return;
  api({...queryParam}).then(res => {
    points.value = res?.records ?? []
  });
};

const clickHandler = (e) => {
  // alert(`单击点的坐标为：${e.point.lng}，${e.point.lat}`);
};

const infoWindowOpen = (item: MapPoint) => {
  if (item.longitude && item.latitude) {
    currentPoint.value = item
    show.value = true;
  } else {
    message.warning('坐标信息无效');
  }

};

const infoWindowClose = () => {
  show.value = false;
};

const selectDevice = (item: MapPoint) => {
  if (item.longitude && item.latitude) {
    center.value.lng = item.longitude;
    center.value.lat = item.latitude;
    zoom.value = defaultZoom
    infoWindowOpen(item)
  } else {
    message.warning('该设备没有有效的坐标信息');
  }
};

const windowHeight = ref(window.innerHeight)

const updateWindowHeight = () => {
  windowHeight.value = window.innerHeight
}
const mapStyle = computed(() => {
  let base = windowHeight.value - 110
  const height = Math.max(base, 200)
  return {
    height: height + 'px'
  }
})

function handler({BMap, map}) {
  center.value.lng = 116.404;
  center.value.lat = 39.915;
  if (route.query.deviceId) {
    queryById({id: route.query.deviceId}).then(res => {
      if (res) {
        nextTick(() => {
          selectDevice(res)
        })
      }
    })
  }
  loadData()
}

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowHeight)
})

onMounted(() => {
  window.addEventListener('resize', updateWindowHeight)
})
defineExpose({
  selectDevice,
});
</script>

<style scoped lang="less">
.map-container-wrapper {
  position: relative;
  width: 100%;
}

.bm-view {
  width: 100%;
}

.custom-beian {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 16px;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.custom-beian a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s;
}

.custom-beian a:hover {
  color: #1890ff;
}

.separator {
  margin: 0 8px;
  color: #ccc;
}
</style>


