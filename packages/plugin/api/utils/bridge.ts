const dispatchUI = (event: string, data: unknown) => {
  figma.ui.postMessage({ event, data });
};

const listenUI = (event: string, callback: (data: unknown) => void) => {
  figma.ui.onmessage = (message) => {
    if (message.event === event) {
      callback(message.data);
    }
  };
};

export { dispatchUI, listenUI };
