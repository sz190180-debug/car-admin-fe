<template>
  <div @wheel.stop>
    <!-- 折叠面板组件 -->
    <a-collapse
      v-model:activeKey="activeKey"
      :bordered="false"
      expand-icon-position="start"
      class="device-collapse"
    >
      <a-collapse-panel key="1">
        <template #header>
          <div
            style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <span>设备列表</span>
            <a-icon :type="activeKey.includes('1') ? 'up' : 'down'"/>
          </div>
        </template>
        <a-card class="device-list-card" :bordered="false">
          <!-- 搜索框 -->
          <div class="search-container">
            <a-input-search
              v-model:value="searchText"
              placeholder="搜索设备编号"
              @search="onSearch"
              enter-button
            />
          </div>
          <!-- 列表内容 -->
          <div class="custom-list-container">
            <div class="device-list">
              <div
                v-for="item in deviceList"
                :key="item.id"
                :class="['list-item', { 'active-device': currentDevice?.id == item.id }]"
                @click="selectDevice(item)"
              >
                <div class="item-content">
                  <div class="item-title">{{item.remark}}{{ item.seq }}</div>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="!loading && deviceList.length === 0" class="empty-state">
                <a-empty description="暂无设备数据"/>
              </div>

              <!-- 加载中 -->
              <div v-if="loading" class="loading-more">
                <a-spin size="small"/>
                <span class="loading-text">加载中...</span>
              </div>
              <!-- 加载更多按钮 -->
              <div
                v-if="!loading && hasMore && deviceList.length > 0"
                class="load-more"
                @click="loadMore"
              >
                点击加载更多
              </div>
              <!-- 无更多 -->
              <div v-if="!hasMore && deviceList.length > 0" class="no-more">
                已加载全部数据
              </div>
            </div>
          </div>
        </a-card>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue';
import {debounce} from 'lodash';
import {message} from 'ant-design-vue';
import {EnableEnum} from '@/enums/sysEnum';
import {getApiByUserType} from "@/views/dashboard/Analysis/api";

interface DeviceItem {
  id: string | number;
  seq: string;
  longitude: number;
  latitude: number;
  remark: string;
  rcs: string;
  ip: string;

  [key: string]: any;
}

interface PageParam {
  pageNo: number;
  pageSize: number;
  enableStatus: number;
  seq?: string | null;
}

const emit = defineEmits(['click']);

// 控制折叠面板的激活状态（空数组=初始隐藏，包含key=初始展开）
const activeKey = ref<string[]>(['1']);

const searchText = ref('');
const queryParam = reactive<PageParam>({
  pageNo: 1,
  pageSize: 6,
  enableStatus: EnableEnum.VALID.value,
  seq: null,
});
const deviceList = ref<DeviceItem[]>([]);
const currentDevice = ref<DeviceItem | null>(null);
const loading = ref(false);
const hasMore = ref(true);

// 加载数据
const loadData = async (reset = false) => {
  const api = getApiByUserType.value;
  if (!api) return;
  if (loading.value) return;

  if (reset) {
    queryParam.pageNo = 1;
    deviceList.value = [];
    hasMore.value = true;
  }

  loading.value = true;
  try {
    const res = await api({...queryParam});
    const records = res?.records ?? [];
    const total = res?.total ?? records.length;

    if (reset) {
      deviceList.value = records;
    } else {
      deviceList.value.push(...records);
    }

    hasMore.value = deviceList.value.length < total;
  } catch (err) {
    message.error('加载失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearchDebounced = debounce((val: string) => {
  queryParam.seq = val || null;
  loadData(true);
}, 400);

const onSearch = (val?: string) => {
  handleSearchDebounced.cancel();
  queryParam.seq = (val ?? searchText.value) || null;
  loadData(true);
};

// 点击加载更多
const loadMore = () => {
  if (loading.value || !hasMore.value) return;
  queryParam.pageNo++;
  loadData();
};

// 选择设备
const selectDevice = (device: DeviceItem) => {
  currentDevice.value = device;
  emit('click', device);
};

// 初始加载
loadData(true);
</script>

<style scoped lang="less">
/* 折叠面板整体样式 */
.device-collapse {
  width: 100%;
}

/* 设备列表卡片样式（适配折叠面板） */
.device-list-card {
  border-radius: 0 0 10px 10px; /* 只保留底部圆角（顶部与折叠面板衔接） */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  background-color: rgba(255, 255, 255, 0.8);
  height: 520px;
  display: flex;
  flex-direction: column;
  margin-top: -1px; /* 消除与折叠面板的缝隙 */

  :deep(.ant-card-body) {
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

/* 折叠面板头部样式（替换原卡片头部） */
:deep(.ant-collapse-header) {
  background: linear-gradient(135deg, #4096ff 0%, #1890ff 100%) !important;
  color: white !important;
  border-radius: 10px 10px 0 0 !important;
  height: 56px !important; /* 与原卡片头部高度一致 */
  align-items: center !important;
  padding: 0 16px !important;
  font-size: 16px !important;
  font-weight: 500 !important;
}

/* 折叠面板内容区域样式 */
:deep(.ant-collapse-content-box) {
  padding: 0 !important; /* 清除默认内边距 */
}

/* 折叠面板图标样式（自定义箭头 + 组件默认箭头） */
:deep(.anticon) {
  color: white !important;
  font-size: 14px !important;
}

/* 隐藏 Ant Design Vue 自带的展开图标（只保留自定义箭头） */
:deep(.ant-collapse-expand-icon) {
  display: none !important;
}

/* 搜索框容器样式 */
.search-container {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  background: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}

/* 列表容器样式 */
.custom-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* 设备列表样式 */
.device-list {
  min-height: 100%;
}

/* 列表项样式 */
.list-item {
  height: 60px;
  padding: 0 16px;
  background-color: rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(245, 245, 245, 0.8);
  }

  .item-content {
    flex: 1;
  }

  .item-title {
    font-size: 14px;
    color: #333;
  }
}

/* 选中设备样式 */
.active-device {
  background-color: rgba(240, 247, 255, 0.9) !important;
  border-left: 3px solid #1890ff;

  .item-title {
    color: #1890ff;
    font-weight: 500;
  }
}

/* 加载中样式 */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  color: #666;
}

.loading-text {
  margin-left: 8px;
  font-size: 12px;
}

/* 加载更多按钮样式 */
.load-more {
  text-align: center;
  padding: 12px;
  font-size: 13px;
  color: #1890ff;
  cursor: pointer;
  border-top: 1px solid #f0f0f0;
  background-color: rgba(255, 255, 255, 0.6);

  &:hover {
    background-color: rgba(230, 247, 255, 0.8);
  }
}

/* 无更多数据样式 */
.no-more {
  text-align: center;
  padding: 12px;
  font-size: 12px;
  color: #999;
  border-top: 1px solid #f0f0f0;
}

/* 空状态样式 */
.empty-state {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 修复折叠面板展开/收起动画卡顿问题 */
:deep(.ant-collapse-content) {
  transition: height 0.3s ease-in-out !important;
}
</style>
