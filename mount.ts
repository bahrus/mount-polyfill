import {MountInit, ImportContext} from './types';

export function mount(init: MountInit){

}

export class Mount extends EventTarget implements ImportContext{
    #refs: Array<WeakRef<Element>> = [];
    get refs(){
        return this.#refs;
    }
    constructor(public mountInit: MountInit){
        super();
    }
}