export function require(res: boolean, msg?: string) { 
    if(!res) throw msg ?? 'tx reverted';
}