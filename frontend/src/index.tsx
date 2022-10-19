import React from 'react';
import ReactDOM from 'react-dom/client';
import { Buffer } from 'buffer';
import App from './App';
import reportWebVitals from './reportWebVitals';
import "./globals.scss";

import { HelloNear } from './contracts/hello-near';
import { Wallet } from './near-wallet';
import { HELLO_NEAR_ADDRESS } from './constants';


window.Buffer = window.Buffer || Buffer;

const wallet = new Wallet();
const helloNear = new HelloNear(HELLO_NEAR_ADDRESS, wallet);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App wallet={wallet} helloNear={helloNear} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
