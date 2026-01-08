let tryCount = 0;
const checkLoaded = (callback: any) => {
  tryCount++;
  if (tryCount > 600) {
    // some error happen?
    return;
  }
  if (document.readyState === 'complete') {
    callback();
    return true;
  } else {
    setTimeout(() => {
      checkLoaded(callback); 
    }, 100);
  }
};
const domReadyCall = (callback: any) => {
  checkLoaded(callback);
};

const $ = document.querySelector.bind(document);

export { $, domReadyCall };
