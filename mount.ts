import {MountInit, ImportContext} from './types';

export function mount(init: MountInit){

}

export class Mount extends EventTarget implements ImportContext{
    #refs: Array<WeakRef<Element>> = [];
    //TODO share mutation observers?
    #mutationObserver: MutationObserver;
    get refs(){
        return this.#refs;
    }
    constructor(public mountInit: MountInit){
        super();
        this.#mutationObserver = new MutationObserver(this.#onMutationEvent);
        this.#init();
    }

    async #onMutationEvent(mutationRecords: Array<MutationRecord>){
        const {mountInit} = this;
        const {match, actsOn} = mountInit;
        for(const record of mutationRecords){
            const {addedNodes} = record;
            for(const node of addedNodes){
                let hasMatchesMethod = false;
                if(match !== undefined && ('matches' in node) && typeof node.matches === 'function'){
                    hasMatchesMethod = true;
                    if(!node.matches(match)) continue;
                }
                if(actsOn !== undefined){
                    const {cssMatch, instanceOf} = actsOn;
                    if(hasMatchesMethod && cssMatch !== undefined && !(node as Element).matches(cssMatch)){
                        if(instanceOf !== undefined){
                            if(instanceOf.find(x => node instanceof x) === undefined) continue;
                        }else{
                            continue;
                        }
                    }
                }
            }
        }
    }

    async #init(){
        const {mountInit} = this;
        const {within} = mountInit;
        if(!(within instanceof Node)) throw 'within must be instance of Node';
        this.#mutationObserver.observe(within, {
            subtree: true,
            childList: true,
        });
    }

    disconnect(){
        this.#mutationObserver.disconnect();
    }

}