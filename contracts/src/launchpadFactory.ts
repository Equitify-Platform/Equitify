import { NearBindgen, near, call, view, Vector, NearPromise, assert } from 'near-sdk-js';
import { PublicKey } from 'near-sdk-js/lib/types';
import { AccountId } from 'near-sdk-js/lib/types/account_id';
import { WithCallback} from "./utils/contracts/withCallback";
@NearBindgen({})
class LaunchpadFactory extends WithCallback {
    public idos: Vector<string> = new Vector('idos');

    @call({privateFunction:true})
    add_ido({ account_id  }: { account_id: string }): void {
        this.idos.push(account_id);
    }

    // @call({payableFunction: true})
    // create_ido({ 
    //     prefix,
    //     public_key
    // }: { 
    //     prefix: string, 
    //     public_key: PublicKey 
    // }): NearPromise {
    //     const account_id = `${prefix}.${near.currentAccountId()}`;
        
    //     return this._createNewIdo({account_id, public_key}).asReturn()
    // }


    // private _createNewIdo({
    //     account_id,
    //     public_key
    // }: { 
    //     account_id: string, 
    //     public_key: PublicKey 
    // }){

    //     const promise =  NearPromise
    //         .new(account_id)
    //         .createAccount()
    //         .transfer(near.attachedDeposit())
    //         .addFullAccessKey(public_key)
    //         .deployContract('../../build/launchpad.wasm')
    //         .

    //     return this._execute_callback_private({
    //         callback:{
    //             function:'',
    //             args: JSON.stringify({account_id})
    //         },
    //         promise
    //     })
    // }

    
    // private _on_ido_created_callback(){

    // }

    @view({})
    get_all_idos() {
        return this.idos.toArray();
    }
}