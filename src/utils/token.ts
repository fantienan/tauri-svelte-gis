import { getStorageItem, removeStorageItem, setStorageItem } from './storage';

export const tokenStorageKey = 'accessToken';

export const refreshTokenKey = 'refreshToken';

export const getAccessToken = () => getStorageItem(tokenStorageKey);

export const setAccessToken = (token: string) => setStorageItem(tokenStorageKey, token);

export const removeAccessToken = () => removeStorageItem(tokenStorageKey);

export const getRefreshToken = () => getStorageItem(refreshTokenKey);

export const setRefreshToken = (refreshToken: string) => setStorageItem(refreshTokenKey, refreshToken);

export const removeRefreshToken = () => removeStorageItem(refreshTokenKey);

export const getTokens = () => {
  return {
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
  };
};

export const setTokens = (token: { accessToken: string; refreshToken: string }) => {
  setAccessToken(token.accessToken);
  setRefreshToken(token.refreshToken);
};

export const removeTokens = () => {
  removeAccessToken();
  removeRefreshToken();
};
