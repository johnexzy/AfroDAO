import { useEffect, useMemo, useState } from "react";

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";
// import { ConnectWallet } from "@3rdweb/react";
const App = () => {
  // Use the connectWallet hook thirdweb gives us.
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("👋 Address:", address)
  // This is the case where the user hasn't connected their wallet
  // to your web app. Let them call connectWallet.
  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to AfroDAO</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect your Metamask
        </button>
        <button onClick={() => connectWallet("walletconnect")} className="btn-hero margin" >
          Connect your wallet with walletconnect
        </button>

        <button onClick={() => connectWallet("walletlink")} className="btn-hero margin" >
          Connect your coinbase wallet
        </button>
      </div>
    );
  }

  // This is the case where we have the user's address
  // which means they've connected their wallet to our site!
  return (
    <div className="landing">
      <h1>👀 wallet connected, now what!</h1>
    </div>);
};

export default App;
