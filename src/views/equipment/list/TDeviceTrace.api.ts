import {defHttp} from '/src/utils/http/axios';
import {useMessage} from "/src/hooks/web/useMessage";

const {createConfirm} = useMessage();

enum Api {
  list = '/tDeviceTrace/my/list',
  save = '/tDeviceTrace/add',
  edit = '/tDeviceTrace/edit',
  deleteOne = '/tDeviceTrace/delete',
  deleteBatch = '/tDeviceTrace/deleteBatch',
  importExcel = '/tDeviceTrace/importExcel',
  exportXls = '/tDeviceTrace/exportXls',
  deviceAll = '/tDeviceTrace/device/all',
  returnDevice = '/tDeviceTrace/return/device',
  returnAgree = '/tDeviceTrace/return/agree',
  returnList = '/tDeviceTrace/return/list',
  returnRefuse = '/tDeviceTrace/return/refuse',
  deviceExpire = '/tDeviceTrace/my/deviceExpire',
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
 * 分页退货列表查询
 * @param params
 */
export const returnList = (params) => defHttp.get({url: Api.returnList, params});

/**
 * 流动轨迹
 * @param params
 */
export const deviceAll = (params) => defHttp.post({url: Api.deviceAll, params});

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
 * 申请退货
 * @param params
 */
export const returnDevice = (params) => {
  return defHttp.post({url: Api.returnDevice, params}, {isTransformResponse: false});
}

/**
 * 同意申请退货
 * @param params
 */
export const returnAgree = (params) => {
  return defHttp.post({url: Api.returnAgree, params}, {isTransformResponse: false});
}

/**
 * 拒绝申请退货
 * @param params
 */
export const returnRefuse = (params) => {
  return defHttp.post({url: Api.returnRefuse, params}, {isTransformResponse: false});
}
/**
 * 检查快到期设备
 */
export const deviceExpire = () => defHttp.get({url: Api.deviceExpire});
