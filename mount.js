export function mount(init) {
}
export class Mount extends EventTarget {
    mountInit;
    #refs = [];
    //TODO share mutation observers
    #mutationObserver;
    get refs() {
        return this.#refs;
    }
    constructor(mountInit) {
        super();
        this.mountInit = mountInit;
        this.#mutationObserver = new MutationObserver(this.#onMutationEvent);
        this.#init();
    }
    #onMutationEvent() {
        const { mountInit } = this;
        const {} = mountInit;
    }
    async #init() {
        const { mountInit } = this;
        const { within } = mountInit;
        if (!(within instanceof Node))
            throw 'within must be instance of Node';
        this.#mutationObserver.observe(within, {
            subtree: true,
            childList: true,
        });
    }
    disconnect() {
        this.#mutationObserver.disconnect();
    }
}
