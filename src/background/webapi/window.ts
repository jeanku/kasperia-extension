/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const IS_WINDOWS = /windows/i.test(navigator.userAgent);

const BROWSER_HEADER = 80;
const WINDOW_SIZE = {
  width: 360 + (IS_WINDOWS ? 14 : 0),   // idk why windows cut the width.
  height: 600
};

const create = async ({ url, ...rest }: { url: string } & Record<string, any>): Promise<number> => {
  const {
    top: cTop,
    left: cLeft,
    width
  } = await chrome.windows.getCurrent({ windowTypes: ['normal'] });

  const top = cTop! + BROWSER_HEADER;
  const left = cLeft! + width! - WINDOW_SIZE.width;

  const currentWindow = await chrome.windows.getCurrent();
  let win;
  if (currentWindow.state === 'fullscreen') {
    win = await chrome.windows.create({
      focused: true,
      url,
      type: 'popup',
      ...rest,
      width: undefined,
      height: undefined,
      left: undefined,
      top: undefined,
      state: 'fullscreen'
    });
  } else {
    win = await chrome.windows.create({
      focused: true,
      url,
      type: 'popup',
      top,
      left,
      ...WINDOW_SIZE,
      ...rest
    });
  }

  if (win.left !== left) {
    await chrome.windows.update(win.id!, { left, top });
  }

  if (win.id === undefined) {
    throw new Error('Failed to open notification window');
  }
  return win.id!;
};

const remove = async (winId: number) => {
  return chrome.windows.remove(winId);
};

const openNotification = ({ route = '', ...rest } = {}): Promise<number | undefined> => {
  const url = `/index.html${route && `#${route}`}`;
  return create({ url, ...rest });
};

export default {
  openNotification,
  remove
};