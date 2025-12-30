import {defHttp} from '/@/utils/http/axios';
import {computed} from "vue";
import {UserTypeEnum} from "@/enums/sysEnum";
import {list as DeviceList} from "@/views/equipment/list/TDevice.api";
import {list as DeviceTraceList} from "@/views/equipment/list/TDeviceTrace.api";
import {list as DeviceClientList} from "@/views/equipment/list/TDeviceClient.api";
import {useUserStore} from "@/store/modules/user";

enum Api {
  loginfo = '/sys/loginfo',
  visitInfo = '/sys/visitInfo',
}

/**
 * 日志统计信息
 * @param params
 */
export const getLoginfo = (params) => defHttp.get({
  url: Api.loginfo,
  params
}, {isTransformResponse: false});
/**
 * 访问量信息
 * @param params
 */
export const getVisitInfo = (params) => defHttp.get({
  url: Api.visitInfo,
  params
}, {isTransformResponse: false});

const userStore = useUserStore();
export const getApiByUserType = computed(() => {
  const userType = userStore.getUserInfo?.userType;
  switch (userType) {
    case UserTypeEnum.SUPER.value:
      return DeviceList;
    case UserTypeEnum.COMPANY.value:
      return DeviceList;
    case UserTypeEnum.AGENT.value:
      return DeviceTraceList;
    case UserTypeEnum.CLIENT.value:
      return DeviceClientList;
    default:
      return null;
  }
});
