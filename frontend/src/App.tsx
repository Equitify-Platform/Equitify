import React, { FC, FormEvent, useEffect, useRef, useState } from 'react';
import type { HelloNear } from "./contracts/hello-near";
import type { Wallet } from "./near-wallet";
import { EducationalText, SignInPrompt, SignOutButton } from "./components";
import { ReduxProvider } from './providers/ReduxProvider';

interface AppProps {
    helloNear: HelloNear;
    wallet: Wallet;
}

const App: FC<AppProps> = ({ wallet, helloNear }) => {
    const ref = useRef<HTMLInputElement>(null);

    const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
    const [uiPleaseWait, setUiPleaseWait] = useState<boolean>(true);
    const [valueFromBlockchain, setValueFromBlockchain] = useState<string>("");

    useEffect(() => {
        wallet.startUp()
            .then(setIsSignedIn)
            .then(() => {
                helloNear.getGreeting()
                .then(setValueFromBlockchain)
                .catch(alert)
                .finally(() => {
                    setUiPleaseWait(false);
                });
            })
            .catch(alert)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!isSignedIn) {
        return <SignInPrompt greeting={valueFromBlockchain} onClick={() => wallet.signIn() } />;
    }

    const changeGreeting = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUiPleaseWait(true);
        const greetingInput = ref?.current?.value || "";
        helloNear.setGreeting(greetingInput)
            .then(() => helloNear.getGreeting())
            .then(setValueFromBlockchain)
            .finally(() => {
                setUiPleaseWait(false);
            });
    };

    return (
        <ReduxProvider>
            <SignOutButton accountId={wallet.accountId || ""} onClick={() => wallet.signOut()} />
            <main className={uiPleaseWait ? 'please-wait' : ''}>
                <h1>
                    The contract says: <span className="greeting">{valueFromBlockchain}</span>
                </h1>
                <form onSubmit={changeGreeting} className="change">
                    <label>Change greeting:</label>
                    <div>
                        <input
                            autoComplete="off"
                            defaultValue={valueFromBlockchain}
                            id="greetingInput"
                            ref={ref}
                        />
                        <button>
                            <span>Save</span>
                            <div className="loader"></div>
                        </button>
                    </div>
                </form>
                <EducationalText />
            </main>
        </ReduxProvider>
    );
};

export default App;
