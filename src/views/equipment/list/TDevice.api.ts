import {defHttp} from '/src/utils/http/axios';
import {useMessage} from "/src/hooks/web/useMessage";

const {createConfirm} = useMessage();

enum Api {
  list = '/tDevice/list',
  queryById = '/tDevice/queryById',
  save = '/tDevice/add',
  edit = '/tDevice/edit',
  deleteOne = '/tDevice/delete',
  deleteBatch = '/tDevice/deleteBatch',
  importExcel = '/tDevice/importExcel',
  exportXls = '/tDevice/exportXls',
  enable = '/tDevice/enable',
  sold = '/tDevice/sold',
  inStore = '/tDevice/in/store',
  active = '/tDevice/active',
  flushGps = '/tDevice/flushGps',
  vpnRemoteAuth = '/tVpnRemote/add',
}

/**
 * 导出api
 * @param params
 */
export const getExportUrl = Api.exportXls;

/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;

/**
 * 列表接口
 * @param params
 */
export const list = (params) => defHttp.get({url: Api.list, params});

/**
 * 通过id查询
 * @param params
 */
export const queryById = (params) => defHttp.get({url: Api.queryById, params});

/**
 * 删除单个
 * @param params
 * @param handleSuccess
 */
export const deleteOne = (params, handleSuccess) => {
  return defHttp.delete({url: Api.deleteOne, params}, {joinParamsToUrl: true}).then(() => {
    handleSuccess();
  });
}

/**
 * 批量删除
 * @param params
 * @param handleSuccess
 */
export const batchDelete = (params, handleSuccess) => {
  createConfirm({
    iconType: 'warning',
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({
        url: Api.deleteBatch,
        data: params
      }, {joinParamsToUrl: true}).then(() => {
        handleSuccess();
      });
    }
  });
}

/**
 * 保存或者更新
 * @param params
 * @param isUpdate
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({url: url, params}, {isTransformResponse: false});
}
/**
 * 启用设备
 * @param params
 */
export const enable = (params) => {
  return defHttp.post({url: Api.enable, params}, {isTransformResponse: false});
}

/**
 * 设备出库
 * @param params
 */
export const sold = (params) => {
  return defHttp.post({url: Api.sold, params}, {isTransformResponse: false});
}

/**
 * 设备入库
 * @param params
 */
export const inStore = (params) => {
  return defHttp.post({url: Api.inStore, params}, {isTransformResponse: false});
}

/**
 * 设备激活
 * @param params
 */
export const active = (params) => {
  return defHttp.post({url: Api.active, params}, {isTransformResponse: false});
}
/**
 * 刷新定位
 * @param params
 */
export const flushGps = () => defHttp.get({url: Api.flushGps});

/**
 * 刷新定位
 * @param params
 */
export const vpnRemoteAuth = (params) => defHttp.post({url: Api.vpnRemoteAuth, params});
