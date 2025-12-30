import {defHttp} from '/src/utils/http/axios';
import {useMessage} from "/src/hooks/web/useMessage";

const {createConfirm} = useMessage();

enum Api {
  list = '/tWorkOrder/list',
  save = '/tWorkOrder/add',
  edit = '/tWorkOrder/edit',
  apply = '/tWorkOrder/apply',
  process = '/tWorkOrder/process',
  processOk = '/tWorkOrder/processOk',
  transfer = '/tWorkOrder/transfer',
  deleteOne = '/tWorkOrder/delete',
  deleteBatch = '/tWorkOrder/deleteBatch',
  importExcel = '/tWorkOrder/importExcel',
  exportXls = '/tWorkOrder/exportXls',
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
 * 申请工单
 * @param params
 */
export const apply = (params) => {
  return defHttp.post({url: Api.apply, params}, {isTransformResponse: false});
}

/**
 * 开始处理工单
 * @param params
 */
export const process = (params) => {
  return defHttp.post({url: Api.process, params}, {isTransformResponse: false});
}

/**
 * 结束处理工单
 * @param params
 */
export const processOk = (params) => {
  return defHttp.post({url: Api.processOk, params}, {isTransformResponse: false});
}

/**
 * 委派工单
 * @param params
 */
export const transfer = (params) => {
  return defHttp.post({url: Api.transfer, params}, {isTransformResponse: false});
}
