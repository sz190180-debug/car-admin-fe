import {defHttp} from '/@/utils/http/axios';

enum Api {
  queryPostEngineer = '/sys/user/queryPostEngineer',
  audit = '/sys/user/workOrder/audit',
}

/**
 * 查询工程师审核列表
 * @param params
 */
export const queryPostEngineer = (params) => {
  return defHttp.get({url: Api.queryPostEngineer, params});
};

/**
 * 工程师审核通过
 * @param params
 */
export const audit = (params) => {
  return defHttp.post({url: Api.audit, params}, {isTransformResponse: false});
};
