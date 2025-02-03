export type ApiResult<T = unknown> = {
  data: T;
  msg: string;
  success?: boolean;
};

export interface IUserRecord {
  /**
   * 用户名
   */
  userName: string;
  /**
   * 手机号
   */
  phone: string | null;
  /**
   * 主键
   */
  id: string;
  /**
   * 用户id
   */
  userId: string;
  /**
   * 创建时间
   */
  createTime: string;
}

export type IConfig = {
  SM_MAPBOX_TOKEN: string;
  SM_GEOVIS_TOKEN: string;
  SM_TIANDITU_TOKEN: string;
};
