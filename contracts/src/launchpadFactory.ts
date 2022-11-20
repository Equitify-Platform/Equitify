import { NearBindgen, near, call, view, Vector, NearPromise, assert } from 'near-sdk-js';
import { PublicKey } from 'near-sdk-js/lib/types';
import { AccountId } from 'near-sdk-js/lib/types/account_id';
import { WithCallback} from "./utils/contracts/withCallback";

@NearBindgen({})
class LaunchpadFactory extends WithCallback {
    public idos: Vector<string> = new Vector('idos');

    @call({privateFunction:true, payableFunction: true})
    add_ido({ account_id  }: { account_id: string }): void {
        this.idos.push(account_id);
    }

    @view({})
    get_all_idos() {
        return this.idos.toArray();
    }
}