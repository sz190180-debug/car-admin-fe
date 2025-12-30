<template>
  <BasicModal
      wrapClassName="JSelectUserByCompanyModal"
      v-bind="$attrs"
      @register="register"
      :title="modalTitle"
      width="1000px"
      @ok="handleOk"
      destroyOnClose
      @visible-change="visibleChange"
  >
    <div class="j-select-user-by-company">
      <div class="modal-content">
        <!-- 左侧企业列表 -->
        <div class="left-content">
          <!-- 搜索框 -->
          <div class="search-box">
            <a-input
                v-model:value.trim="searchText"
                placeholder="搜索企业"
                @pressEnter="handleSearch"
                allowClear
                @change="handleSearchChange"
            />
          </div>
          <!-- 企业列表 -->
          <div class="company-box">
            <template v-if="companyList.length">
              <div class="company-list">
                <template v-for="item in companyList" :key="item.id">
                  <div class="company-item" :class="{ active: currentCompany?.id === item.id }"
                       @click="handleCompanyClick(item)">
                    <a-checkbox
                        v-model:checked="item.checked"
                        :indeterminate="item.indeterminate"
                        @click.stop
                        @change="($event) => handleCompanyCheck($event, item)"
                    />
                    <div class="company-item-name">{{ item.companyName }}</div>
                  </div>
                </template>
              </div>
              <!-- 分页组件 -->
              <div class="pagination-container">
                <Pagination
                    v-model:current="pagination.current"
                    v-model:pageSize="pagination.pageSize"
                    :total="pagination.total"
                    :show-size-changer="true"
                    :page-size-options="['10', '20', '50', '100']"
                    @change="handlePageChange"
                    @showSizeChange="handlePageChange"
                    size="small"
                />
              </div>
            </template>
            <template v-else>
              <div class="no-data">
                <a-empty description="暂无企业数据"/>
              </div>
            </template>
          </div>
        </div>

        <!-- 中间企业员工列表 -->
        <div class="middle-content">
          <div class="middle-header">
            <span class="header-title">{{
                currentCompany ? currentCompany.companyName + ' - 员工' : '请选择企业'
              }}</span>
            <div class="header-actions" v-if="currentCompany">
              <a-checkbox
                  v-model:checked="currentCompanyAllUsers"
                  :indeterminate="currentCompanyIndeterminate"
                  @change="handleAllUsers"
              >
                全选
              </a-checkbox>
            </div>
          </div>
          <div class="company-users-box">
            <template v-if="currentCompanyUsers.length">
              <div class="company-users">
                <template v-for="item in currentCompanyUsers" :key="item.id">
                  <div class="company-user-item" @click="handleCompanyUserCheck(item)">
                    <a-checkbox v-model:checked="item.checked"/>
                    <div class="right">
                      <div class="company-user-item-circle">
                        <img v-if="item.avatar" :src="getFileAccessHttpUrl(item.avatar)" alt="avatar"/>
                      </div>
                      <div class="company-user-item-info">
                        <div class="company-user-item-name">{{ item.realname }}</div>
                        <div class="company-user-item-position">{{ item.post }}</div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </template>
            <template v-else>
              <div class="no-data">
                <a-empty :description="currentCompany ? '该企业暂无员工' : '请先选择企业'"/>
              </div>
            </template>
          </div>
        </div>

        <!-- 右侧已选人员展示 -->
        <div class="right-content">
          <div class="selected-header">
            <span>已选人员：{{ selectedUsers.length }}人</span>
            <a-button type="link" @click="handleClearAll" size="small">清空</a-button>
          </div>
          <div class="selected-users">
            <div class="content">
              <div v-for="user in selectedUsers" :key="user.id" class="user-avatar" @click="handleDelUser(user)">
                <div class="avatar-circle">
                  <img v-if="user.avatar" :src="getFileAccessHttpUrl(user.avatar)" alt="avatar"/>
                  <div class="mask">
                    <CloseOutlined></CloseOutlined>
                  </div>
                </div>
                <div class="user-name">{{ user.realname }}</div>
                <div class="user-company">{{ user.companyName }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BasicModal>
</template>

<script setup lang="ts">
import {ref, reactive, computed, watch} from 'vue';
import {CloseOutlined} from '@ant-design/icons-vue';
import {BasicModal, useModalInner} from '/@/components/Modal';
import {getFileAccessHttpUrl} from '/@/utils/common/compUtils';
import {isArray} from '/@/utils/is';
import {defHttp} from '/@/utils/http/axios';
import {Pagination} from 'ant-design-vue';

defineOptions({name: 'JSelectUserByCompanyModal'});
const props = defineProps({
  rowKey: {
    type: String,
    default: 'id',
  },
  labelKey: {
    type: String,
    default: 'name',
  },
  modalTitle: {
    type: String,
    default: '企业用户选择',
  },
  selectedUser: {
    type: Array,
    default: () => [],
  },
  params: {
    type: Object,
    default: () => {
    },
  },
  maxSelectCount: {
    type: Number,
    default: 0,
  },
  isRadioSelection: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'register', 'change']);
import {useMessage} from '/@/hooks/web/useMessage';
import {list} from "@/views/company/TCompany.api";
import {noPageList} from "@/api/common/api";
import {debounce} from "lodash-es";

const {createMessage} = useMessage();

// 搜索文本
const searchText = ref('');
// 分页参数
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});
// 企业列表
const companyList = ref<any[]>([]);
// 当前选中企业
const currentCompany = ref<any>(null);
// 当前企业用户
const currentCompanyUsers = ref<any[]>([]);
// 已选用户
const selectedUsers = ref<any[]>([]);
// 全选状态
const currentCompanyAllUsers = ref(false);
const currentCompanyIndeterminate = ref(false);
// 缓存企业用户关系
const cacheCompanyUser = {};

// 更新企业选择状态
const updateCompanyCheckStatus = (companyId) => {
  const company = companyList.value.find(item => item.id === companyId);
  if (!company) return;

  const users = cacheCompanyUser[companyId] || [];
  const selectedCount = users.filter(user =>
      selectedUsers.value.find(selected => selected.id === user.id)
  ).length;

  company.checked = selectedCount === users.length && users.length > 0;
  company.indeterminate = selectedCount > 0 && selectedCount < users.length;
};

// 更新当前企业全选状态
const updateCurrentCompanyAllUsersStatus = () => {
  if (!currentCompanyUsers.value.length) {
    currentCompanyAllUsers.value = false;
    currentCompanyIndeterminate.value = false;
    return;
  }

  const selectedCount = currentCompanyUsers.value.filter(user => user.checked).length;
  currentCompanyAllUsers.value = selectedCount === currentCompanyUsers.value.length;
  currentCompanyIndeterminate.value = selectedCount > 0 && selectedCount < currentCompanyUsers.value.length;
};

// 更新当前企业员工的选中状态
const updateCurrentCompanyUsersCheckStatus = () => {
  if (!currentCompany.value || !currentCompanyUsers.value.length) return;

  const companyUsers = cacheCompanyUser[currentCompany.value.id] || [];
  currentCompanyUsers.value.forEach(user => {
    const findItem = selectedUsers.value.find(selected => selected.id === user.id);
    user.checked = !!findItem;
  });
};

// 监听选中用户变化，更新企业状态
watch(selectedUsers, () => {
  // 更新所有企业的选择状态
  companyList.value.forEach(company => {
    updateCompanyCheckStatus(company.id);
  });

  // 更新当前企业的全选状态
  updateCurrentCompanyAllUsersStatus();

  // 更新当前企业员工的选中状态
  updateCurrentCompanyUsersCheckStatus();
}, {deep: true});

//注册弹框
const [register, {closeModal}] = useModalInner(async (data) => {
  // 初始化
  if (props.selectedUser.length) {
    selectedUsers.value = props.selectedUser;
  }
  getCompanyList();
});

const visibleChange = (visible) => {
  if (visible === false) {
    setTimeout(() => {
      emit('close');
    }, 300);
  }
};

const handleOk = () => {
  if (selectedUsers.value.length == 0) {
    createMessage.warning('请选择人员');
    return;
  }
  if (props.isRadioSelection && selectedUsers.value.length > 1) {
    createMessage.warning('只允许选择一个用户');
    return;
  }
  if (props.maxSelectCount && selectedUsers.value.length > props.maxSelectCount) {
    createMessage.warning(`最多只能选择${props.maxSelectCount}个用户`);
    return;
  }
  emit('change', selectedUsers.value);
  closeModal();
};

// 搜索输入变化
const handleSearchChange = debounce((value: string) => {
  console.log('ssss')
  // 清空时重置搜索
  if (!searchText.value) {
    pagination.current = 1;
  }
  getCompanyList();
}, 300);

// 搜索企业
const handleSearch = () => {
  pagination.current = 1;
  getCompanyList();
};

// 分页变化
const handlePageChange = (page, pageSize) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  getCompanyList();
};

// 点击企业复选框触发
const handleCompanyCheck = async (e, item) => {
  const {checked} = e.target;

  if (checked) {
    // 选中企业，添加该企业所有用户
    const users = await getUsersByCompanyId(item.id);
    const usersToAdd = users.filter(user =>
        !selectedUsers.value.find(selected => selected.id === user.id)
    );
    addUsers(usersToAdd);
  } else {
    // 取消选中企业，移除该企业所有用户
    const users = await getUsersByCompanyId(item.id);
    const userIdsToRemove = users.map(user => user.id);
    selectedUsers.value = selectedUsers.value.filter(user =>
        !userIdsToRemove.includes(user.id)
    );
  }

  // 强制更新当前企业员工的选中状态（如果当前显示的就是被操作的企业）
  if (currentCompany.value && currentCompany.value.id === item.id) {
    updateCurrentCompanyUsersCheckStatus();
    updateCurrentCompanyAllUsersStatus();
  }
};

// 点击企业项触发
const handleCompanyClick = (item) => {
  currentCompany.value = item;
  getUsersByCompanyId(item.id).then((users) => {
    // 更新选中状态
    users.forEach((user) => {
      const findItem = selectedUsers.value.find((selectedUser) => selectedUser.id === user.id);
      user.checked = !!findItem;
    });
    currentCompanyUsers.value = users;

    // 更新全选状态
    updateCurrentCompanyAllUsersStatus();
  });
};

// 点击企业用户复选框触发
const handleCompanyUserCheck = (item) => {
  item.checked = !item.checked;
  if (item.checked) {
    addUsers([item]);
  } else {
    selectedUsers.value = selectedUsers.value.filter((user) => user.id !== item.id);
  }

  // 更新企业选择状态
  if (currentCompany.value) {
    updateCompanyCheckStatus(currentCompany.value.id);
  }
};

// 全选
const handleAllUsers = (e) => {
  const {checked} = e.target;

  if (checked) {
    // 全选当前企业所有用户
    currentCompanyUsers.value.forEach((item) => (item.checked = true));
    const usersToAdd = currentCompanyUsers.value.filter(user =>
        !selectedUsers.value.find(selected => selected.id === user.id)
    );
    addUsers(usersToAdd);
  } else {
    // 取消全选当前企业所有用户
    currentCompanyUsers.value.forEach((item) => (item.checked = false));
    const userIdsToRemove = currentCompanyUsers.value.map(user => user.id);
    selectedUsers.value = selectedUsers.value.filter(user =>
        !userIdsToRemove.includes(user.id)
    );
  }
};

// 删除人员
const handleDelUser = (item) => {
  const findIndex = selectedUsers.value.findIndex((user) => user.id === item.id);
  if (findIndex != -1) {
    selectedUsers.value.splice(findIndex, 1);
  }

  // 更新当前企业用户选中状态
  const findItem = currentCompanyUsers.value.find((user) => user.id === item.id);
  if (findItem) {
    findItem.checked = false;
  }

  // 更新企业选择状态
  if (currentCompany.value) {
    updateCompanyCheckStatus(currentCompany.value.id);
  }
};

// 清空所有已选
const handleClearAll = () => {
  selectedUsers.value = [];
  // 清空所有选中状态
  companyList.value.forEach(company => {
    company.checked = false;
    company.indeterminate = false;
  });
  currentCompanyUsers.value.forEach(user => {
    user.checked = false;
  });
  currentCompanyAllUsers.value = false;
  currentCompanyIndeterminate.value = false;
};

// 添加人员到右侧
const addUsers = (users) => {
  if (!users.length) return;

  const newUsers = users.filter((user: any) =>
      !selectedUsers.value.find((item) => item.id === user.id)
  );

  selectedUsers.value = [...selectedUsers.value, ...newUsers];

  // 更新企业选择状态
  if (currentCompany.value) {
    updateCompanyCheckStatus(currentCompany.value.id);
  }
};

// 获取企业列表
const getCompanyList = () => {
  const params = {
    pageNo: pagination.current,
    pageSize: pagination.pageSize,
    ...props.params
  };

  // 添加搜索条件
  if (searchText.value) {
    params.companyName = `*${searchText.value}*`;
  }

  list(params).then(res => {
    const companies = res.records || [];
    // 初始化企业状态
    companyList.value = companies.map(company => ({
      ...company,
      checked: false,
      indeterminate: false
    }));

    // 更新分页信息
    pagination.total = res.total || 0;

    // 预加载当前页企业的用户数量
    companyList.value.forEach(company => {
      getUsersByCompanyId(company.id).then(users => {
        // 初始化企业选择状态
        updateCompanyCheckStatus(company.id);
      });
    });
  });
};

// 根据企业ID获取用户
const getUsersByCompanyId = (companyId) => {
  return new Promise<any[]>((resolve) => {
    if (cacheCompanyUser[companyId]) {
      resolve(cacheCompanyUser[companyId]);
    } else {
      noPageList({companyId: companyId}).then((res: any) => {
        const users = res.records || res || [];
        // 为用户添加企业名称
        const company = companyList.value.find(c => c.id === companyId);
        if (company) {
          users.forEach(user => {
            user.companyName = company.companyName;
            user.checked = false;
          });
        }
        cacheCompanyUser[companyId] = users;
        resolve(users);
      });
    }
  });
};
</script>

<style lang="less">
.JSelectUserByCompanyModal {
  .scroll-container {
    padding: 0;
  }
}
</style>

<style lang="less" scoped>
.j-select-user-by-company {
  background: #fff;
  border-radius: 4px;
}

.modal-content {
  display: flex;
  padding: 20px;
  padding-bottom: 0;
  height: 500px;
  font-size: 12px;
  gap: 16px;
}

.left-content {
  display: flex;
  flex-direction: column;
  width: 280px;
  border-right: 1px solid #e8e8e8;

  .search-box {
    :deep(.ant-input-affix-wrapper) {
      border-color: #d9d9d9 !important;
    }

    margin: 0 16px 16px 0;
  }

  .company-box {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;

    .no-data {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .company-list {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px;

    .company-item {
      padding: 8px 16px;
      display: flex;
      align-items: center;
      cursor: pointer;
      border-radius: 4px;
      margin-right: 16px;

      &:hover {
        background-color: #f4f6fa;
      }

      &.active {
        background-color: #e6f7ff;
        border-right: 3px solid @primary-color;
      }

      .company-item-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin: 0 8px;
      }

      .company-user-count {
        color: #999;
        font-size: 11px;
      }
    }
  }

  .pagination-container {
    padding: 16px 0;
    margin-right: 16px;

    :deep(.ant-pagination) {
      text-align: center;
    }
  }
}

.middle-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  border-right: 1px solid #e8e8e8;

  .middle-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px 16px 0;
    border-bottom: 1px solid #e8e8e8;
    margin-bottom: 16px;

    .header-title {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .header-actions {
      :deep(.ant-checkbox-wrapper) {
        font-size: 12px;
      }
    }
  }

  .company-users-box {
    flex: 1;
    overflow-y: auto;
    padding-right: 16px;

    .no-data {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .company-users {
    .company-user-item {
      padding: 8px 0;
      display: flex;
      align-items: center;
      cursor: pointer;
      border-radius: 4px;

      &:hover {
        background-color: #f4f6fa;
      }

      .right {
        flex: 1;
        display: flex;
        align-items: center;
        margin: 0 8px;
      }

      .company-user-item-circle {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: #aaa;
        overflow: hidden;

        img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .company-user-item-info {
        margin-left: 8px;
        display: flex;
        flex-direction: column;
      }

      .company-user-item-name {
        font-weight: 500;
        margin-bottom: 2px;
      }

      .company-user-item-position {
        color: #999;
        font-size: 11px;
      }
    }
  }
}

.right-content {
  width: 280px;
  display: flex;
  flex-direction: column;

  .selected-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e8e8e8;

    span {
      font-size: 14px;
      font-weight: 500;
    }
  }

  .selected-users {
    flex: 1;
    overflow-y: auto;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .user-avatar {
    display: flex;
    align-items: center;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #f4f6fa;
    }

    .avatar-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      position: relative;
      background-color: rgba(0, 0, 0, 0.5);
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &:hover {
        .mask {
          opacity: 1;
        }
      }

      .mask {
        opacity: 0;
        transition: opacity 0.3s;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.5);
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .user-name {
      margin: 0 8px;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-company {
      color: #999;
      font-size: 11px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 80px;
    }
  }
}

.no-data {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
