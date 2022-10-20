
import { call, near, view } from "near-sdk-js"

export abstract class Ownable { 
    private _owner: string;

    @call({ privateFunction: true })
    __Ownable_init() {
        this.transferOwnership({to: near.predecessorAccountId()})
    }


    @call({ privateFunction: true })
    transferOwnership({to} : {to: string}) {
        this._owner = to;
    }


    @view({})
    owner(){
        return this._owner;
    }
}