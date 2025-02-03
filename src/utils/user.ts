import { setStorageItem, getStorageItem, removeStorageItem } from './storage';
import type { IUserRecord } from '@/types';

export const userInfoStorageKey = 'userinfo';

export const getUserInfoString = () => getStorageItem(userInfoStorageKey);

export const getUserInfo = () => {
  try {
    return getStorageItem(userInfoStorageKey) as IUserRecord;
  } catch (e) {
    console.warn(e);
  }
};

export const setUserInfo = (value: IUserRecord) => {
  try {
    setStorageItem(userInfoStorageKey, value);
  } catch (e) {
    console.warn(e);
  }
};

export const removeUserInfo = () => removeStorageItem(userInfoStorageKey);

export const setUserInfoWithLocal = async () => {
  const fpRes = await import('@fingerprintjs/fingerprintjs').then((res) => res.load()).then((fp) => fp.get());
  setUserInfo({ userId: fpRes.visitorId, userName: '', id: 'local', phone: '', createTime: '' });
};
