
import { call, near, view } from "near-sdk-js"
import { WithCallback } from "./WithCallback";

export abstract class Ownable extends WithCallback { 
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