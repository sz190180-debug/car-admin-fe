import {defHttp} from '/@/utils/http/axios';
import {useMessage} from "/@/hooks/web/useMessage";

const {createConfirm} = useMessage();

enum Api {
  list = '/tVpnRemote/list',
  save = '/tVpnRemote/add',
  edit = '/tVpnRemote/edit',
  apply = '/tVpnRemote/apply',
  agree = '/tVpnRemote/agree',
  refuse = '/tVpnRemote/refuse',
  deleteOne = '/tVpnRemote/delete',
  deleteBatch = '/tVpnRemote/deleteBatch',
  importExcel = '/tVpnRemote/importExcel',
  exportXls = '/tVpnRemote/exportXls',
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
 * 申请远程协助
 * @param params
 */
export const apply = (params) => {
  return defHttp.post({url: Api.apply, params}, {isTransformResponse: false});
}

/**
 * 同意远程协助
 * @param params
 */
export const agree = (params) => {
  return defHttp.post({url: Api.agree, params}, {isTransformResponse: false});
}

/**
 * 拒绝远程协助
 * @param params
 */
export const refuse = (params) => {
  return defHttp.post({url: Api.refuse, params}, {isTransformResponse: false});
}
