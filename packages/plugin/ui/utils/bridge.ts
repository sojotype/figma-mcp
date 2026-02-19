const dispatchAPI = (event: string, data: unknown) => {
  parent.postMessage({ pluginMessage: { event, data } }, "*");
};

const listenAPI = (event: string, callback: (data: unknown) => void) => {
  window.onmessage = (message) => {
    if (message.data.pluginMessage?.event === event) {
      callback(message.data.pluginMessage.data);
    }
  };
};

export { dispatchAPI, listenAPI };
