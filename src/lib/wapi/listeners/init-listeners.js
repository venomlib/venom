export function initNewMessagesListener() {
  // Queue a message for the debounced onMessage callbacks
  // Called from addMsg() in listener.layer.ts after serialization
  window.WAPI._queueNewMessage = function (message) {
    if (!message) return;

    window.WAPI._newMessagesQueue.push(message);
    window.WAPI._newMessagesBuffer.push(message);

    // Start debouncer if not already running
    if (
      !window.WAPI._newMessagesDebouncer &&
      window.WAPI._newMessagesQueue.length > 0
    ) {
      window.WAPI._newMessagesDebouncer = setTimeout(() => {
        // Atomically swap the queue to prevent losing messages added during processing
        let queuedMessages = window.WAPI._newMessagesQueue;
        window.WAPI._newMessagesQueue = [];
        window.WAPI._newMessagesDebouncer = null;

        let removeCallbacks = [];

        window.WAPI._newMessagesCallbacks.forEach(function (callbackObj) {
          if (callbackObj.callback !== undefined) {
            callbackObj.callback(queuedMessages);
          }
          if (callbackObj.rmAfterUse === true) {
            removeCallbacks.push(callbackObj);
          }
        });

        // Remove removable callbacks.
        removeCallbacks.forEach(function (rmCallbackObj) {
          let callbackIndex =
            window.WAPI._newMessagesCallbacks.indexOf(rmCallbackObj);
          window.WAPI._newMessagesCallbacks.splice(callbackIndex, 1);
        });
      }, 1000);
    }
  };

  window.WAPI._unloadInform = (event) => {
    // Save in the buffer the ungot unreaded messages
    window.WAPI._newMessagesBuffer.forEach((message) => {
      Object.keys(message).forEach((key) =>
        message[key] === undefined ? delete message[key] : ''
      );
    });

    sessionStorage.setItem(
      'saved_msgs',
      JSON.stringify(window.WAPI._newMessagesBuffer)
    );

    // Inform callbacks that the page will be reloaded.
    window.WAPI._newMessagesCallbacks.forEach(function (callbackObj) {
      if (callbackObj.callback !== undefined) {
        callbackObj.callback({
          status: -1,
          message: 'page will be reloaded, wait and register callback again.'
        });
      }
    });
  };
}
