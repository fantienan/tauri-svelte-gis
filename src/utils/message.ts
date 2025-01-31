export type MessageOptions = {
  duration?: number;
  align?: 'auto' | 'top' | 'bottom';
  type: 'error' | 'basic';
};

const createMessage = (msg: string, options?: MessageOptions) => {
  const { duration, align = 'top', type } = options ?? {};
  const sSnackbar = document.createElement('s-snackbar');
  const sButton = document.createElement('s-button');
  sButton.slot = 'trigger';
  sButton.textContent = '提示';
  if (duration) sSnackbar.setAttribute('duration', duration.toString());
  if (align) sSnackbar.setAttribute('align', align);
  if (type) sSnackbar.setAttribute('type', type);
  sSnackbar.textContent = msg;
  sSnackbar.appendChild(sButton);
  document.body.appendChild(sSnackbar);
};

export const message = {
  error: (msg: string, options?: MessageOptions) => {
    createMessage(msg, { ...options, type: 'error' });
  },
  success: (msg: string, options?: MessageOptions) => {
    createMessage(msg, options);
  }
};
