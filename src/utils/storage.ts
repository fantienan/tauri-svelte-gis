let _localKeyPrefix = 'unknown';

const getLocalKey = (key: string) => `${_localKeyPrefix}-${key}`;

export const initStorage = (options: { prefix: string }) => {
  _localKeyPrefix = options.prefix;
};

export const setStorageItem = (key: string, value: any) => {
  localStorage.setItem(getLocalKey(key), JSON.stringify(value));
};

export const getStorageItem = (key: string) => {
  try {
    const value = localStorage.getItem(getLocalKey(key));
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error('getStorageItem error: ', e);
  }
};

export const clearStorage = () => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(_localKeyPrefix)) {
      localStorage.removeItem(key);
    }
  }
};

export const removeStorageItem = (key: string) => {
  localStorage.removeItem(getLocalKey(key));
};
