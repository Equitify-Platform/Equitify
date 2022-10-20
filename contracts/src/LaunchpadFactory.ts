import { NearBindgen, near, call, view, Vector, NearPromise } from 'near-sdk-js';
import { AccountId } from 'near-sdk-js/lib/types';

interface Project{
    projectName:string,
    projectTicker:string,
    projectDescription:string,
    hardCap:number,
    softCap:number,
    saleStartTime:number,
    saleEndTime:number,
    price:number
}

interface ProjectParametes{
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
    idos:Vector;
    // code: string = DEFAULT_CONTRACT;
    
    constructor() {
        this.idos = new Vector('1');
    }

    @call({})
    create_ido({ IDOProperties }: { IDOProperties: ProjectParametes }): void {

        this.idos.push(IDOProperties);
    }

    // @call({})
    // deploy_contract() {
    // // const promise = NearPromise.new('danildovgal.testnet')
    // // .deployContract(this.code)
    // // .then(
    // //     NearPromise.new(near.currentAccountId())
    // //     .functionCall("query_greeting_callback", NO_ARGS, NO_DEPOSIT, FIVE_TGAS)
    // // )
    
    // return promise.asReturn();
    // }

    @view({})
    get_all_idos_info(): Vector {
        
        return this.idos;
    }
}