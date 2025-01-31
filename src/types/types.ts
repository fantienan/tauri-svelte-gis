export type ApiResult<T = unknown> = {
  data: T;
  msg: string;
  success?: boolean;
};
