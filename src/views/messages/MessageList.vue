<template>
  <div class="message-center-page">
    <!-- 主内容区域 -->
    <div class="page-content">
      <!-- 筛选区域 -->
      <div class="filter-section">
        <div class="filter-tabs">
          <div
            class="filter-tab"
            :class="{ active: activeKey === 'all' }"
            @click="handleChangeTab('all')"
          >
            全部消息
          </div>
          <div
            class="filter-tab"
            :class="{ active: activeKey === 'star' }"
            @click="handleChangeTab('star')"
          >
            标星消息
          </div>
        </div>

        <div class="filter-actions">
          <div style="display: inline-block;margin-right: 10px">
            <a-button type="primary" @click="refreshData">
              <template #icon>
                <reload-outlined/>
              </template>
              刷新
            </a-button>
          </div>


          <a-popover
            placement="bottomRight"
            :overlayStyle="{ width: '400px' }"
            trigger="click"
            v-model:open="showSearch"
          >
            <template #content>
              <div class="filter-popover-content">
                <!-- 人员筛选 -->
                <div class="filter-item">
                  <span class="filter-label">回复、提到我的人：</span>
                  <div class="filter-control">
                    <div v-if="searchParams.fromUser" class="selected-user">
                      <span>{{ searchParams.realname }}</span>
                      <span class="clear-user-icon">
                        <close-outlined style="font-size: 12px" @click="clearSearchParamsUser"/>
                      </span>
                    </div>
                    <a-button v-else type="dashed" shape="circle" @click="openSelectPerson">
                      <plus-outlined/>
                    </a-button>
                  </div>
                </div>

                <!-- 时间筛选 -->
                <div class="filter-item">
                  <div class="filter-label">时间：</div>
                  <div class="filter-control">
                    <div class="tags-container">
                      <div
                        v-for="item in dateTags"
                        :class="item.active ? 'tag active' : 'tag'"
                        @click="handleClickDateTag(item)"
                      >
                        {{ item.text }}
                      </div>
                    </div>
                    <div class="cust-range-date" v-if="showRangeDate">
                      <a-range-picker v-model:value="searchRangeDate"
                                      @change="handleChangeSearchDate"/>
                    </div>
                  </div>
                </div>

                <!-- 类型筛选 -->
                <div class="filter-item">
                  <div class="filter-label">类型：</div>
                  <div class="filter-control">
                    <div class="tags-container">
                      <div
                        v-for="item in noticeTypeOption"
                        :class="item.active ? 'tag active flex' : 'tag flex'"
                        @click="handleClickNoticeType(item)"
                      >
                        <img class="notice-type-img" v-if="item.img" :src="item.img"/>
                        {{ item.text }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 筛选操作按钮 -->
                <div class="filter-actions">
                  <a-button type="link" @click="clearAll">清除筛选</a-button>
                </div>
              </div>
            </template>
            <a-button>
              <template #icon>
                <filter-outlined/>
              </template>
              筛选
              <span v-if="conditionStr" class="filter-badge">
                {{ conditionStr }}
              </span>
            </a-button>
          </a-popover>
        </div>
      </div>

      <!-- 消息列表区域 -->
      <div class="message-list-section">
        <div class="message-list-container">
          <sys-message-list
            v-if="activeKey === 'all'"
            ref="allMessageRef"
            :isLowApp="isLowApp"
            @close="handleMessageClose"
            @detail="showDetailModal"
            @clear="clearAll"
            :messageCount="messageCount"
          />

          <sys-message-list
            v-if="activeKey === 'star'"
            ref="starMessageRef"
            :isLowApp="isLowApp"
            star
            @close="handleMessageClose"
            @detail="showDetailModal"
            @clear="clearAll"
            :messageCount="messageCount"
            :cancelStarAfterDel="true"
          />
        </div>
      </div>
    </div>

    <!-- 用户选择弹窗 -->
    <user-select-modal
      isRadioSelection
      :showButton="false"
      labelKey="realname"
      rowKey="username"
      @register="regModal"
      @getSelectResult="getSelectedUser"
    />

    <!-- 消息详情弹窗 -->
    <detail-modal
      @register="registerDetail"
      :zIndex="1001"
      @close="handleDetailColse"
    />
  </div>
</template>

<script>
import {ref, unref, reactive, computed, onMounted} from 'vue';
import {
  FilterOutlined,
  CloseOutlined,
  ReloadOutlined,
  PlusOutlined
} from '@ant-design/icons-vue';
import {BasicModal, useModalInner, useModal} from '/src/components/Modal';
import UserSelectModal from '/src/components/Form/src/jeecg/components/modal/UserSelectModal.vue';
import DetailModal from '/src/views/monitor/mynews/DetailModal.vue';
import {createAsyncComponent} from '/src/utils/factory/createAsyncComponent';

// 图标资源
import calendar from '/src/assets/icons/calendarNotice.png';
import folder from '/src/assets/icons/folderNotice.png';
import system from '/src/assets/icons/systemNotice.png';
import flow from '/src/assets/icons/flowNotice.png';
import {editCementSend} from "@/layouts/default/header/components/notify/notify.api";

export default {
  name: 'MessageCenterPage',
  components: {
    FilterOutlined,
    CloseOutlined,
    ReloadOutlined,
    PlusOutlined,
    SysMessageList: createAsyncComponent(() => import('/@/views/system/message/components/SysMessageList.vue')),
    UserSelectModal,
    DetailModal
  },
  setup() {
    const allMessageRef = ref();
    const starMessageRef = ref();
    const activeKey = ref('all');
    const noticeType = ref('');
    const noticeImg = ref('');
    const showSearch = ref(false);
    const isLowApp = ref(false);
    const messageCount = ref(0);

    // 通知类型选项
    const noticeTypeOption = reactive([
      {key: 'system', text: '系统通知', active: false, img: system},
      {key: 'flow', text: '流程通知', active: false, img: flow},
      {key: 'plan', text: '日程通知', active: false, img: calendar},
      {key: 'file', text: '知识通知', active: false, img: folder},
    ]);

    // 查询参数
    const searchParams = reactive({
      fromUser: '',
      realname: '',
      rangeDateKey: '7day',
      rangeDate: [],
    });

    // 日期标签
    const dateTags = reactive([
      {key: 'jt', text: '今天', active: false},
      {key: 'zt', text: '昨天', active: false},
      {key: 'qt', text: '前天', active: false},
      {key: 'bz', text: '本周', active: false},
      {key: 'sz', text: '上周', active: false},
      {key: 'by', text: '本月', active: false},
      {key: 'sy', text: '上月', active: false},
      {key: '7day', text: '七日', active: true},
      {key: 'zdy', text: '自定义', active: false},
    ]);

    const searchRangeDate = ref([]);

    // 计算属性
    const showRangeDate = computed(() => {
      const temp = dateTags.filter(i => i.active);
      return temp.length > 0 && temp[0].text === '自定义';
    });

    const conditionStr = computed(() => {
      const {fromUser, rangeDateKey, realname} = searchParams;
      if (!fromUser && !rangeDateKey) return '';

      const arr = [];
      if (fromUser) arr.push(realname);
      if (rangeDateKey) {
        const rangDates = dateTags.filter(item => item.key === rangeDateKey);
        if (rangDates.length > 0) arr.push(rangDates[0].text);
      }
      return arr.join('、');
    });

    // 方法
    function handleChangeTab(key) {
      activeKey.value = key;
      loadData();
    }

    function loadData() {
      const params = {
        fromUser: searchParams.fromUser,
        rangeDateKey: searchParams.rangeDateKey,
        rangeDate: searchParams.rangeDate,
        noticeType: noticeType.value || ''
      };

      if (activeKey.value === 'all') {
        getRefPromise(allMessageRef).then(() => {
          allMessageRef.value.reload(params);
        });
      } else {
        getRefPromise(starMessageRef).then(() => {
          starMessageRef.value.reload(params);
        });
      }
    }

    function getRefPromise(componentRef) {
      return new Promise((resolve) => {
        (function next() {
          const ref = componentRef.value;
          if (ref) {
            resolve(ref);
          } else {
            setTimeout(() => {
              next();
            }, 100);
          }
        })();
      });
    }

    function handleClickDateTag(item) {
      dateTags.forEach(a => {
        a.active = a.key === item.key ? !a.active : false;
      });

      searchParams.rangeDateKey = item.active ? item.key : '';

      if (item.key !== 'zdy' || !item.active) {
        loadData();
      }
    }

    function handleChangeSearchDate(_value, dateStringArray) {
      searchParams.rangeDate = [...dateStringArray];
      loadData();
    }

    function handleClickNoticeType(item) {
      noticeTypeOption.forEach(a => {
        a.active = a.key === item.key ? !a.active : false;
      });

      noticeType.value = item.active ? item.key : '';
      noticeImg.value = item.active ? item.img : '';
      loadData();
    }

    function refreshData() {
      loadData();
    }

    // 用户选择相关
    const [regModal, {openModal}] = useModal();

    function openSelectPerson() {
      openModal(true, {});
    }

    function getSelectedUser(options, value) {
      if (options && options.length > 0) {
        searchParams.fromUser = value;
        searchParams.realname = options[0].label;
      }
    }

    function clearSearchParamsUser() {
      searchParams.fromUser = '';
      searchParams.realname = '';
    }

    function clearAll() {
      searchParams.fromUser = '';
      searchParams.realname = '';
      searchParams.rangeDateKey = '';
      searchParams.rangeDate = [];

      dateTags.forEach(a => {
        a.active = false;
      });

      noticeType.value = '';
      noticeImg.value = '';
      noticeTypeOption.forEach(item => {
        item.active = false;
      });

      loadData();
    }

    // 消息详情相关
    const [registerDetail, {openModal: openDetailModal}] = useModal();

    function showDetailModal(record) {
      openDetailModal(true, {record: unref(record), isUpdate: true});
    }

    function handleDetailColse() {
      loadData();
    }

    function handleMessageClose(id) {
      reloadCount(id)
    }

    async function reloadCount(id) {
      try {
        await editCementSend(id);
        await loadData();
      } catch (e) {
        console.error(e);
      }
    }

    // 生命周期
    onMounted(() => {
      loadData();
    });

    return {
      activeKey,
      noticeTypeOption,
      noticeImg,
      showSearch,
      searchParams,
      dateTags,
      searchRangeDate,
      showRangeDate,
      conditionStr,
      allMessageRef,
      starMessageRef,
      isLowApp,
      messageCount,

      handleChangeTab,
      handleClickDateTag,
      handleChangeSearchDate,
      handleClickNoticeType,
      refreshData,
      openSelectPerson,
      getSelectedUser,
      clearSearchParamsUser,
      clearAll,
      showDetailModal,
      handleDetailColse,
      handleMessageClose,

      regModal,
      registerDetail,
    };
  },
};
</script>

<style lang="less" scoped>
.message-center-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.page-content {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

.filter-section {
  background: #fff;
  border-radius: 6px;
  padding: 16px 24px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

  .filter-tabs {
    display: flex;

    .filter-tab {
      padding: 8px 16px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.45);
      transition: all 0.3s;

      &.active {
        color: @primary-color;
        border-bottom-color: @primary-color;
      }

      &:hover {
        color: @primary-color;
      }

      & + .filter-tab {
        margin-left: 24px;
      }
    }
  }

  .filter-actions {
    .filter-badge {
      margin-left: 6px;
      background: @primary-color;
      color: white;
      border-radius: 10px;
      padding: 0 6px;
      font-size: 12px;
      line-height: 18px;
    }
  }
}

.filter-popover-content {
  .filter-item {
    margin-bottom: 16px;

    .filter-label {
      font-weight: 500;
      color: #757575;
      margin-bottom: 8px;
      display: block;
    }

    .filter-control {
      .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .tag {
          background-color: #f5f5f5;
          border-radius: 17px;
          font-size: 13px;
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.3s;

          &.active {
            background-color: #d3eafd !important;
            color: @primary-color;
          }

          &:hover {
            background-color: #e8e8e8;
          }

          &.flex {
            display: flex;
            align-items: center;
          }
        }
      }

      .cust-range-date {
        margin-top: 12px;
      }
    }
  }

  .filter-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e8e8e8;
  }
}

.message-list-section {
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

  .message-list-container {
    min-height: 400px;
  }
}

.selected-user {
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 30px;
  display: inline-flex;
  align-items: center;

  .clear-user-icon {
    margin-left: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;

    &:hover {
      color: #ff4d4f;
    }
  }
}

.notice-type-img {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

// 响应式设计
@media (max-width: 768px) {
  .page-content {
    padding: 16px;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;

    .filter-tabs {
      margin-bottom: 16px;
      justify-content: center;
    }
  }
}
</style>
