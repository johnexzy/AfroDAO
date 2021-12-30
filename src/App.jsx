import { ThirdwebSDK } from "@3rdweb/sdk";
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";
// import { ConnectWallet } from "@3rdweb/react";

// We instantiate the sdk on Rinkeby.
const sdk = new ThirdwebSDK("rinkeby");


// We can grab a reference to our ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(
  "0x593ae01AA255a5Cb080F452d5a5Aaf4f1350dE24",
);

const tokenModule = sdk.getTokenModule(
  "0x436825c29b380b72eafdcc03ab40c3a9bf8324e1"
);

const App = () => {
  // Holds the amount of token each member has in state.
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  // The array holding all of our members addresses.
  const [memberAddresses, setMemberAddresses] = useState([]);

  // A fancy function to shorten someones wallet address, no need to show the whole thing. 
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  // Use the connectWallet hook thirdweb gives us.
  const { connectWallet, address, error, provider, disconnectWallet } = useWeb3();
  console.log("👋 Address:", address)
  // The signer is required to sign transactions on the blockchain.
  // Without it we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined;

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming lets us easily keep a loading state while the NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false);

const HasClaimedNFT = () => {
  return (
    <div className="member-page">
      <h1>AfroDAO Member Page</h1>
      <p>Congratulations on being a member</p>
      <div>
        <div>
          <h2>Member List</h2>
          <table className="card">
            <thead>
              <tr>
                <th>Address</th>
                <th>Token Amount</th>
              </tr>
            </thead>
            <tbody>
              {memberList.map((member) => {
                return (
                  <tr key={member.address}>
                    <td>{shortenAddress(member.address)}</td>
                    <td>{member.tokenAmount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
// This useEffect grabs all the addresses of our members holding our NFT.
useEffect(() => {
  if (!hasClaimedNFT) {
    return (<HasClaimedNFT />);
  }
  
  // Just like we did in the 7-airdrop-token.js file! Grab the users who hold our NFT
  // with tokenId 0.
  bundleDropModule
    .getAllClaimerAddresses("0")
    .then((addresess) => {
      console.log("🚀 Members addresses", addresess)
      setMemberAddresses(addresess);
    })
    .catch((err) => {
      console.error("failed to get member list", err);
    });
}, [hasClaimedNFT]);

// This useEffect grabs the # of token each member holds.
useEffect(() => {
  if (!hasClaimedNFT) {
    return;
  }

  // Grab all the balances.
  tokenModule
    .getAllHolderBalances()
    .then((amounts) => {
      console.log("👜 Amounts", amounts)
      setMemberTokenAmounts(amounts);
    })
    .catch((err) => {
      console.error("failed to get token amounts", err);
    });
}, [hasClaimedNFT]);

// Now, we combine the memberAddresses and memberTokenAmounts into a single array
const memberList = useMemo(() => {
  return memberAddresses.map((address) => {
    return {
      address,
      tokenAmount: ethers.utils.formatUnits(
        // If the address isn't in memberTokenAmounts, it means they don't
        // hold any of our token.
        memberTokenAmounts[address] || 0,
        18,
      ),
    };
  });
}, [memberAddresses, memberTokenAmounts]);
  // Another useEffect!
  useEffect(() => {
    // We pass the signer to the sdk, which enables us to interact with
    // our deployed contract!
    sdk.setProviderOrSigner(signer);
  }, [signer]);
  useEffect(() => {
    // If they don't have an connected wallet, exit!
    if (!address) {
      return;
    }

    // Check if the user has the NFT by using bundleDropModule.balanceOf
    return bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        // If balance is greater than 0, they have our NFT!
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!")
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.")
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("failed to nft balance", error);
      });
  }, [address]);
  // This is the case where the user hasn't connected their wallet
  // to your web app. Let them call connectWallet.
  const DisconnectWallet = () => {
    return (
      <div>
        <button className="btn-hero margin" onClick={disconnectWallet}>
          Disconnect
        </button>
      </div>
    )
  }
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
  // Add this little piece!
  if (hasClaimedNFT) {
     return (<HasClaimedNFT />);
  };
  // This is the case where we have the user's address
  const mintNft = () => {
    setIsClaiming(true);
    // Call bundleDropModule.claim("0", 1) to mint nft to user's wallet.
    bundleDropModule
      .claim("0", 1)
      .then(() => {
        // Set claim state.
        setHasClaimedNFT(true);
        // Show user their fancy new NFT!
        console.log(
          `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
        );
      })
      .catch((err) => {
        console.error("failed to claim", err);
      })
      .finally(() => {
        // Stop loading state.
        setIsClaiming(false);
      });
  }

  // Render mint nft screen.
  return (
    <div className="mint-nft">
      <h1>Mint your free 🍪DAO Membership NFT</h1>
      <button
        disabled={isClaiming}
        onClick={() => mintNft()}
      >
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
      <DisconnectWallet />
    </div>
  );
};

export default App;
