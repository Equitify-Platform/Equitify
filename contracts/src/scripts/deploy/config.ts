type Config = {
    launchpadFactory?: string,
    idos: Array<{
        name: string, // also used as prefix
        idoAccountId?: string,
        nftAccountId?: string,
        idoTokenAccountId?: string,
    }>
}

export const testnetConfig: Config = {
    idos: [{
        name: 'default',
        idoTokenAccountId: 'ido-token-default.launchpad-deployer.testnet',
        
    },{
        name: 'test8',
    }]
}