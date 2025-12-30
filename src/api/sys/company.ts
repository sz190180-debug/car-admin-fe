import { defHttp } from '/@/utils/http/axios';
enum Api {
    //网点注册接口
    companyRegisterApi = '/company/register',
    companyListAllApi = '/company/listAll',
    companyClientListAllApi = '/company/client/listAll',
    companyQueryByIdApi = '/company/queryById',
    companyEditApi = '/company/edit',
    companyPerfectApi = '/company/perfect',
}

/**
 * @description: 网点注册接口
 */
export function companyRegisterApi(params) {
    return defHttp.post({url: Api.companyRegisterApi, params}, {isReturnNativeResponse: true});
}

/**
 * @description: 服务网点编辑接口
 */
export function companyEditApi(params) {
    return defHttp.post({url: Api.companyEditApi, params}, {isTransformResponse: false});
}

/**
 * @description: 服务网点编辑接口
 */
export function companyPerfectApi(params) {
    return defHttp.post({url: Api.companyPerfectApi, params}, {isTransformResponse: false});
}

/**
 * @description: 服务网点列表接口
 */
export const companyListAllApi = (params) => defHttp.get({ url: Api.companyListAllApi, params });

/**
 * @description: 客户企业列表接口
 */
export const companyClientListAllApi = (params) => defHttp.get({ url: Api.companyClientListAllApi, params });

/**
 * @description: 服务网点查询单条
 */
export const companyQueryByIdApi = (params) => defHttp.get({ url: Api.companyQueryByIdApi, params });
