export function getEnumLabel(enumS: Object, value: number): string {
  const entry = Object.values(enumS).find((item) => item.value === value);
  return entry?.label || '';
}

/**
 * 审核状态
 */
export const StatusEnum = {
  VALID: {value: 1, label: '已审核'},
  INVALID: {value: 0, label: '未审核'},
};

export function getStatusLabel(value: number): string {
  const entry = Object.values(StatusEnum).find((item) => item.value == value);
  return entry?.label || '';
}

/**
 * 启用状态
 */
export const EnableEnum = {
  VALID: {value: 1, label: '已启用'},
  INVALID: {value: 0, label: '未启用'},
};

export function getEnableLabel(value: number): string {
  const entry = Object.values(EnableEnum).find((item) => item.value == value);
  return entry?.label || '';
}

/**
 * 运行状态
 */
export const RunEnum = {
  VALID: {value: 1, label: '在线'},
  INVALID: {value: 0, label: '离线'},
};

export function getRunLabel(value: number): string {
  const entry = Object.values(RunEnum).find((item) => item.value == value);
  return entry?.label || '';
}

/**
 * 激活状态
 */
export const ActiveEnum = {
  VALID: {value: 1, label: '已激活'},
  INVALID: {value: 0, label: '未激活'},
};

export function getActiveLabel(value: number): string {
  const entry = Object.values(ActiveEnum).find((item) => item.value == value);
  return entry?.label || '';
}

/**
 * 退货状态
 */
export const ReturnStatusEnum = {
  NORETURN: {value: 0, label: '未退货'},
  RETURNIN: {value: 1, label: '申请退货中'},
  RETURN: {value: 2, label: '同意退货'},
};

export function getReturnStatusLabel(value: number): string {
  const entry = Object.values(ReturnStatusEnum).find((item) => item.value == value);
  return entry?.label || '';
}

/**
 * 售出状态
 */
export const SoldStatusEnum = {
  NORETURN: {value: 0, label: '未启用'},
  RETURNIN: {value: 1, label: '启用'},
};

export function getSoldStatusEnumLabel(value: number): string {
  const entry = Object.values(SoldStatusEnum).find((item) => item.value == value);
  return entry?.label || '';
}

/**
 * 工单状态
 */
export const WorkStatusEnum = {
  PENDING: {value: 0, label: '待处理'},
  INPROCESSED: {value: 1, label: '处理中'},
  STATEMENT: {value: 2, label: '结单'},
};

export function getWorkStatusEnumLabel(value: number): string {
  const entry = Object.values(WorkStatusEnum).find((item) => item.value == value);
  return entry?.label || '';
}

/**
 * 出库状态
 */
export const OutStatusEnum = {
  NOTDELIVERY: {value: 0, label: '未出库'},
  DELIVERY: {value: 1, label: '已出库'},
};

export function getOutStatusEnumLabel(value: number): string {
  return getEnumLabel(OutStatusEnum, value)
}

/**
 * 审批状态
 */
export const RemoveStatusEnum = {
  NOTAPPROVED: {value: 0, label: '未审批'},
  APPROVE: {value: 1, label: '审批通过'},
  APPROVALREJECTION: {value: 2, label: '审批拒绝'},
};

/**
 * vpn证书下发状态
 */
export const VpnCertStatusEnum = {
  NOTGENERATE: {value: 0, label: '未生成'},
  GENERATED: {value: 1, label: '已生成'},
  EXPIRE: {value: 2, label: '已失效'},
};

/**
 * 用户类型
 */
export const UserTypeEnum = {
  SUPER: {value: 1, label: '超管'},
  COMPANY: {value: 2, label: '企业'},
  AGENT: {value: 3, label: '服务网点'},
  CLIENT: {value: 4, label: '客户'},
};

/**
 * 连接类型
 */
export const ConnectTypeEnum = {
  ORDER: {value: 1, label: '工单'},
  REMOTE: {value: 2, label: '远程'},
};
/**
 * 委派类型
 */
export const TransferTypeEnum = {
  SAME: {value: 1, label: '同级'},
  PARENT: {value: 2, label: '上级'},
};
