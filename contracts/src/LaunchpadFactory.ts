import { NearBindgen, near, call, view, Vector, NearPromise, assert } from 'near-sdk-js';
import { AccountId } from 'near-sdk-js/lib/types/account_id';

interface Project {
    projectName:string,
    projectTicker:string,
    projectDescription:string,
    hardCap:number,
    softCap:number,
    saleStartTime:number,
    saleEndTime:number,
    price:number
}

interface ProjectParametes {
    creator:AccountId,
    launchedToken:string,
    founder:AccountId,
    project:Project,
    softCap:number,
    nft:AccountId,
    projectUID:string
}
// const DEFAULT_CONTRACT = includeBytes('./testContract/hello_near.wasm')

@NearBindgen({})
class LaunchpadFactory {
    idos:Vector<string>;
    
    constructor() {
        this.idos = new Vector('1');
    }

    @call({})
    create_ido({ IDOAddress }: { IDOAddress: string }): void {

        this.idos.push(IDOAddress);
    }

    @call({})
    deploy_contract({name}: {name: string;}): NearPromise {
    
    const currentAccount = near.currentAccountId();
    const subaccount = `${name}.${currentAccount}`;
        
    const promise = NearPromise.new(subaccount)
    .deployContract('../../build/lauchpad.wasm')

    return promise.asReturn();
    }

    @view({})
    get_all_idos_info(): Vector<any> {
        
        return this.idos;
    }
}