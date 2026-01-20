"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenerLayer = void 0;
const events_1 = require("events");
const exposed_enum_js_1 = require("../helpers/exposed.enum.js");
const profile_layer_js_1 = require("./profile.layer.js");
const index_js_1 = require("../helpers/index.js");
const messageCache = new index_js_1.DeduplicationCache();
const ackCache = new index_js_1.DeduplicationCache();
class ListenerLayer extends profile_layer_js_1.ProfileLayer {
    browser;
    page;
    listenerEmitter = new events_1.EventEmitter();
    storeListenersInstalled = false;
    wapiListenersInstalled = false;
    constructor(browser, page, session, options) {
        super(browser, page, session, options);
        this.browser = browser;
        this.page = page;
        this.page.on('close', () => {
            this.cancelAutoClose();
            this.log('Page Closed', 'fail');
        });
        this.listenerEmitter.on(exposed_enum_js_1.ExposedFn.onLog, (msg) => {
            this.log(msg);
        });
    }
    async initialize() {
        const functions = [...Object.values(exposed_enum_js_1.ExposedFn)];
        for (const func of functions) {
            const has = await this.page
                .evaluate((func) => typeof window[func] === 'function', func)
                .catch(() => false);
            if (!has) {
                await this.page
                    .exposeFunction(func, (...args) => this.listenerEmitter.emit(func, ...args))
                    .catch(() => { });
            }
        }
        await this.addMsg();
        if (this.wapiListenersInstalled) {
            return;
        }
        this.wapiListenersInstalled = true;
        await this.page
            .evaluate(() => {
            // Guard against duplicate WAPI listeners in browser context
            if (window.__venomWapiListenersInstalled) {
                return;
            }
            window.__venomWapiListenersInstalled = true;
            window.WAPI.onInterfaceChange((e) => {
                window.onInterfaceChange(e);
            });
            window.WAPI.onStreamChange((e) => {
                window.onStreamChange(e);
            });
            window.WAPI.onChatState((e) => {
                window.onChatState(e);
            });
            window.WAPI.onStateChange((e) => {
                window.onStateChange(e);
            });
            window.WAPI.onUnreadMessage((e) => {
                window.onUnreadMessage(e);
            });
            window.WAPI.waitNewMessages(false, (data) => {
                data.forEach((message) => {
                    window.onMessage(message);
                });
            });
            window.WAPI.onAddedToGroup((e) => {
                window.onAddedToGroup(e);
            });
            window.WAPI.onAck((e) => {
                window.onAck(e);
            });
            window.WAPI.onMessageEdit((e) => {
                window.onMessageEdit(e);
            });
            window.WAPI.onMessageDelete((e) => {
                window.onMessageDelete(e);
            });
            window.WAPI.onMessageReaction((e) => {
                window.onMessageReaction(e);
            });
            window.WAPI.onPoll((e) => {
                window.onPoll(e);
            });
        })
            .catch(() => { });
    }
    async addMsg() {
        if (this.storeListenersInstalled) {
            return;
        }
        this.storeListenersInstalled = true;
        this.page
            .evaluate(() => {
            // Guard against duplicate listeners in browser context
            if (window.__venomStoreListenersInstalled) {
                return;
            }
            window.__venomStoreListenersInstalled = true;
            let isHeroEqual = {};
            // Install the new message listener (add event)
            // Serializes once and distributes to both onAnyMessage (immediate) and onMessage (debounced)
            window.Store.Msg.on('add', async (newMessage) => {
                if (!Object.is(isHeroEqual, newMessage)) {
                    isHeroEqual = newMessage;
                    if (newMessage && newMessage.isNewMsg) {
                        const processMessageObj = await window.WAPI.processMessageObj(newMessage, true, false);
                        if (!processMessageObj) {
                            return;
                        }
                        // Immediate callback for all messages
                        window.onAnyMessage(processMessageObj);
                        // Queue incoming messages for debounced onMessage callback
                        if (!newMessage.id?.fromMe) {
                            window.WAPI._queueNewMessage(processMessageObj);
                        }
                    }
                }
            });
            // Install the changed message / deleted message listener (change:body change:caption events)
            window.Store.Msg.on('change:body change:caption', async (newMessage) => {
                if (newMessage && newMessage.isNewMsg) {
                    const processMessageObj = await window.WAPI.processMessageObj(newMessage, true, false);
                    // Edit or Delete?
                    if (newMessage.type == 'revoked') {
                        window.onMessageDelete(processMessageObj);
                    }
                    else {
                        window.onMessageEdit(processMessageObj);
                    }
                }
            });
            // Install the message reaction listener
            // This is a strange one - seems like the way to do it is to override the WhatsApp WAWebAddonReactionTableMode.reactionTableMode.bulkUpsert function
            const module = window.Store.Reaction.reactionTableMode;
            if (!module.__venomPatched) {
                module.__venomPatched = true;
                const ogMethod = module.bulkUpsert;
                module.bulkUpsert = ((...args) => {
                    if (args[0].length > 0) {
                        window.onMessageReaction(args[0][0]);
                    }
                    return ogMethod(...args);
                }).bind(module);
            }
        })
            .catch(() => { });
    }
    async onPoll(fn) {
        const handler = (e) => fn(e);
        this.listenerEmitter.on(exposed_enum_js_1.ExposedFn.onPoll, handler);
        return {
            dispose: () => {
                this.listenerEmitter.off(exposed_enum_js_1.ExposedFn.onPoll, handler);
            }
        };
    }
    /**
     * @event Listens to all new messages
     * @param fn
     */
    async onAnyMessage(fn) {
        const handler = (msg) => fn(msg);
        this.listenerEmitter.on(exposed_enum_js_1.ExposedFn.OnAnyMessage, handler);
        return {
            dispose: () => {
                this.listenerEmitter.off(exposed_enum_js_1.ExposedFn.OnAnyMessage, handler);
            }
        };
    }
    /**
     * @event Listens for edited message
     * @param fn
     */
    async onMessageEdit(fn) {
        const handler = (msg) => fn(msg);
        this.listenerEmitter.on(exposed_enum_js_1.ExposedFn.OnMessageEdit, handler);
        return {
            dispose: () => {
                this.listenerEmitter.off(exposed_enum_js_1.ExposedFn.OnMessageEdit, handler);
            }
        };
    }
    /**
     * @event Listens for deleted message
     * @param fn
     */
    async onMessageDelete(fn) {
        const handler = (msg) => fn(msg);
        this.listenerEmitter.on(exposed_enum_js_1.ExposedFn.OnMessageDelete, handler);
        return {
            dispose: () => {
                this.listenerEmitter.off(exposed_enum_js_1.ExposedFn.OnMessageDelete, handler);
            }
        };
    }
    /**
     * @event Listens for reactions to messages
     * @param fn
     */
    async onMessageReaction(fn) {
        const handler = (reaction) => fn(reaction);
        this.listenerEmitter.on(exposed_enum_js_1.ExposedFn.OnMessageReaction, handler);
        return {
            dispose: () => {
                this.listenerEmitter.off(exposed_enum_js_1.ExposedFn.OnMessageReaction, handler);
            }
        };
    }
    /**
     * @event Listens to messages received
     * @returns Observable stream of messages
     */
    async onStateChange(fn) {
        this.listenerEmitter.on(exposed_enum_js_1.ExposedFn.onStateChange, fn);
        return {
            dispose: () => {
                this.listenerEmitter.off(exposed_enum_js_1.ExposedFn.onStateChange, fn);
            }
        };
    }
    /**
     * @returns Returns chat state
     */
    async onChatState(fn) {
        const handler = (state) => fn(state);
        this.listenerEmitter.on(exposed_enum_js_1.ExposedFn.onChatState, handler);
        return {
            dispose: () => {
                this.listenerEmitter.off(exposed_enum_js_1.ExposedFn.onChatState, handler);
            }
        };
    }
    ////////////////////////////////////////////////////
    /**
     * @returns Returns the current state of the connection
     */
    async onStreamChange(fn) {
        const handler = (state) => fn(state);
        this.listenerEmitter.on(exposed_enum_js_1.ExposedFn.onStreamChange, handler);
        return {
            dispose: () => {
                this.listenerEmitter.off(exposed_enum_js_1.ExposedFn.onStreamChange, handler);
            }
        };
    }
    /**
     * @event Listens to interface mode change See {@link InterfaceState} and {@link InterfaceMode} for details
     * @returns A disposable object to cancel the event
     */
    async onInterfaceChange(fn) {
        this.listenerEmitter.on(exposed_enum_js_1.ExposedFn.onInterfaceChange, fn);
        return {
            dispose: () => {
                this.listenerEmitter.off(exposed_enum_js_1.ExposedFn.onInterfaceChange, fn);
            }
        };
    }
    //////////////////////////////////////PRO
    /**
     * @returns Returns new UnreadMessage
     */
    async onUnreadMessage(fn) {
        this.listenerEmitter.on(exposed_enum_js_1.ExposedFn.onUnreadMessage, fn);
        return {
            dispose: () => {
                this.listenerEmitter.off(exposed_enum_js_1.ExposedFn.onUnreadMessage, fn);
            }
        };
    }
    /**
     * @returns Returns new PicThumb
     */
    async onFilePicThumb(fn) {
        this.listenerEmitter.on(exposed_enum_js_1.ExposedFn.onFilePicThumb, fn);
        return {
            dispose: () => {
                this.listenerEmitter.off(exposed_enum_js_1.ExposedFn.onFilePicThumb, fn);
            }
        };
    }
    /**
     * @event Listens to messages received
     * @returns Observable stream of messages
     */
    async onMessage(fn) {
        const handler = (state) => {
            if (!messageCache.has(state.from, state.id)) {
                messageCache.add(state.from, state.id);
                fn(state);
            }
        };
        this.listenerEmitter.on(exposed_enum_js_1.ExposedFn.OnMessage, handler);
        return {
            dispose: () => {
                this.listenerEmitter.off(exposed_enum_js_1.ExposedFn.OnMessage, handler);
            }
        };
    }
    /**
     * @event Listens to messages acknowledgement Changes
     * @returns Observable stream of messages
     */
    async onAck(fn) {
        const handler = (e) => {
            if (!ackCache.has(e.ack, e.id._serialized)) {
                const existing = ackCache.get(e.id._serialized);
                if (existing) {
                    ackCache.updateId(e.id._serialized, e.ack);
                }
                else {
                    ackCache.add(e.ack, e.id._serialized);
                }
                fn(e);
            }
        };
        this.listenerEmitter.on(exposed_enum_js_1.ExposedFn.onAck, handler);
        return {
            dispose: () => {
                this.listenerEmitter.off(exposed_enum_js_1.ExposedFn.onAck, handler);
            }
        };
    }
    /**
     * @event Listens to live locations from a chat that already has valid live locations
     * @param chatId the chat from which you want to subscribes to live location updates
     * @param fn callback that takes in a LiveLocation
     * @returns boolean, if returns false then there were no valid live locations in the chat of chatId
     * @emits <LiveLocation> LiveLocation
     */
    async onLiveLocation(chatId, fn) {
        const method = 'onLiveLocation_' + chatId.replace('_', '').replace('_', '');
        return this.page
            .exposeFunction(method, (liveLocationChangedEvent) => fn(liveLocationChangedEvent))
            .then((_) => this.page.evaluate(({ chatId, method }) => {
            //@ts-ignore
            return WAPI.onLiveLocation(chatId, window[method]);
        }, { chatId, method }));
    }
    /**
     * @event Listens to participants changed
     * @param to group id: xxxxx-yyyy@us.c
     * @param to callback
     * @returns Stream of ParticipantEvent
     */
    async onParticipantsChanged(groupId, fn) {
        const method = 'onParticipantsChanged_' + groupId.replace('_', '').replace('_', '');
        return this.page
            .exposeFunction(method, (participantChangedEvent) => fn(participantChangedEvent))
            .then((_) => this.page.evaluate(({ groupId, method }) => {
            //@ts-ignore
            WAPI.onParticipantsChanged(groupId, window[method]);
        }, { groupId, method }));
    }
    /**
     * @event Fires callback with Chat object every time the host phone is added to a group.
     * @param to callback
     * @returns Observable stream of Chats
     */
    async onAddedToGroup(fn) {
        this.listenerEmitter.on('onAddedToGroup', fn);
        return {
            dispose: () => {
                this.listenerEmitter.off('onAddedToGroup', fn);
            }
        };
    }
    /**
     * @event Listens to messages received
     * @returns Observable stream of messages
     */
    async onIncomingCall(fn) {
        this.listenerEmitter.on('onIncomingCall', fn);
        return {
            dispose: () => {
                this.listenerEmitter.off('onIncomingCall', fn);
            }
        };
    }
}
exports.ListenerLayer = ListenerLayer;
//# sourceMappingURL=listener.layer.js.map