import { createContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import ApeContractData from "../blockchain/ApeContract";
import StakingContractData from "../blockchain/StakingContract";

import RewardContractData from "../blockchain/RewardContract";
import Swal from "sweetalert2";
import { Network, Alchemy } from "alchemy-sdk";
export const BlockchainContext = createContext();

const { ethereum } = window;

const getProvider = () => {
  return new ethers.providers.Web3Provider(ethereum);
};

const getSigner = () => {
  const provider = getProvider();
  return provider.getSigner();
};

// returns promise
const getSignerAddress = () => {
  const provider = getProvider();
  return provider.getSigner().getAddress();
};

const getCurrentNetwork = () => {
  const provider = getProvider();
  return provider.getNetwork();
};

// returns Promise
const getNetworkChainId = async () => {
  const network = await getCurrentNetwork();
  return network.chainId;
};

export const BlockchainContextProvider = (props) => {
  const [currentSigner, setCurrentSigner] = useState("");
  const [currentSignerAddress, setCurrentSignerAddress] = useState("");
  const [MainContract, setMainContract] = useState("");
  const [MainContractAddress, setMainContractAddress] = useState("");
  const [StakeContract, setStakeContract] = useState("");
  const [StakeContractAddress, setStakeContractAddress] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [unstakedNfts, setUnstakedNfts] = useState();
  const [stakedNfts, setStakedNfts] = useState();
  //
  const [unstakedBalance, setUnstakeBalance] = useState();
  const [stakedBalance, setStakeBalance] = useState();
  const [totalstakedBalance, setTotalStakeBalance] = useState();
  const [rewardTokenBalance, setRewardTokenBalance] = useState();
  const [rewardAccountBalance, setRewardAccountBalance] = useState();
  let holder = useState(0);

  useEffect(() => {
    //   checkIfWalletIsConnected();
    listenMMAccount(); // Event is registered in background
  }, []);

  async function listenMMAccount() {
    ethereum.on("accountsChanged", async function () {
      window.location.reload();
    });

    ethereum.on("chainChanged", (currentChainId) => {
      window.location.reload();
    });
  }

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install Metamask");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      // Check Network
      const chainId = await getNetworkChainId();
      if (chainId !== 1) {
        alert("Please Change Network to Ethereum !");
        return;
      }

      if (accounts.length) {
        // Set Current Signer
        const signer = getSigner();
        setCurrentSigner(signer);

        // Set Current Signer Address
        const signerAddress = await getSignerAddress();
        setCurrentSignerAddress(signerAddress);

        // Fetch Unstaked Nfts
        const unstakedNfts_fetched = await fetchUnstakedInfo(signerAddress);
        setUnstakedNfts(unstakedNfts_fetched);

        // Fetch Staked Nfts
        //  const stakedNfts_fetched = await fetchStakedInfo(signerAddress);
        //  setStakedNfts(stakedNfts_fetched);

        await getUnstakedBalance(signerAddress);
        //  await getStakedBalance(signerAddress);
        // await gettotalNFTStaked(signerAddress);
        //  await getReawardTokenBalance(signerAddress);
        // await getRewardAccountBalance(signerAddress);
        await getholderbalance(signerAddress);
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      //  alert(error.data.message);

      throw new Error("No Ethereum Object");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install Metamask");
      // Request Metamask for accounts
      await ethereum.request({ method: "eth_requestAccounts" });

      // Check Network
      const chainId = await getNetworkChainId();
      if (chainId !== 1) {
        alert("Please Change Network to Ethereum!");
        return;
      }

      // Set Current Signer
      const signer = getSigner();
      setCurrentSigner(signer);

      // Set Current Signer Address
      const signerAddress = await getSignerAddress();
      setCurrentSignerAddress(signerAddress);

      // Fetch Unstaked Nfts
      const unstakedNfts_fetched = await fetchUnstakedInfo(signerAddress);
      console.log("NFTS", unstakedNfts_fetched);
      setUnstakedNfts(unstakedNfts_fetched);

      // Fetch Staked Nfts
      // const stakedNfts_fetched = await fetchStakedInfo(signerAddress);
      // setStakedNfts(stakedNfts_fetched);
    } catch (error) {
      // alert(error.data.message);

      throw new Error("No Ethereum Object");
    }
  };

  // Get APE Contract

  const getApeContract = async () => {
    if (!currentSigner) {
      alert("Please Connect Wallet First!");
      // setIsLoading(false);
      return;
    }

    const provider = getProvider();
    const ApeContract = new ethers.Contract(
      ApeContractData.address,
      ApeContractData.abi,
      provider
    );
    setMainContract(ApeContract);
    return ApeContract;
  };
  const getRewardContract = async () => {
    if (!currentSigner) {
      alert("Please Connect Wallet First!");
      // setIsLoading(false);
      return;
    }

    const provider = getProvider();
    const RewardContract = new ethers.Contract(
      RewardContractData.address,
      RewardContractData.abi,
      provider
    );
    return RewardContract;
  };

  // Get Staking Contract
  const getStakingContract = async () => {
    if (!currentSigner) {
      alert("Please Connect Wallet First!");
      // setIsLoading(false);
      return;
    }

    const provider = getProvider();
    const StakingContract = new ethers.Contract(
      StakingContractData.address,
      StakingContractData.abi,
      provider
    );
    setStakeContract(StakingContract);
    return StakingContract;
  };

  /* 
  * -------------------------------------------
            Functions
  * -------------------------------------------
  */
  // Get User Owned NFTs (Unstaked)
  const fetchUnstakedInfo = async (signerAddress) => {
    let tokenIds = [];
    let metadatas = [];
    let type = []; // "O" for old and "N" for new

    // Get Ape Contract
    const provider = getProvider();
    const apeContract = new ethers.Contract(
      ApeContractData.address,
      ApeContractData.abi,
      provider
    );

    const newApeContract = new ethers.Contract(
      RewardContractData.address,
      RewardContractData.abi,
      provider
    );

    const balance = await apeContract.balanceOf(signerAddress);
    if (balance > 0) {
      const settings = {
        apiKey: "kioKth2cJnPtgmtoj9ofrpG_B-OhXC_o",
        network: Network.ETH_MAINNET,
      };
      const alchemy = new Alchemy(settings);
      const options = {
        contractAddresses: ["0x2D0D57D004F82e9f4471CaA8b9f8B1965a814154"],
        omitMetadata: true,
      };
      const nfts = await alchemy.nft.getNftsForOwner(
        signerAddress.toString(),
        options
      );

      let a1 = 0;
      for (a1 = 0; a1 < balance; a1++) {
        const tokenId = nfts.ownedNfts[a1].tokenId;
        // const tokenId = await apeContract.tokenOfOwnerByIndex(signerAddress, a1);

        // const metadata = await apeContract.methods.tokenURI(tokenId).call();
        // const image = await getImageHash(metadata);
        const image =
          "https://paycnft.mypinata.cloud/ipfs/QmcVj1U7Ud1HR4mviPEE8yoetxZwQ4rrXbsVF5MuPxqFcd/" +
          tokenId +
          ".png";

        tokenIds.push(tokenId);
        metadatas.push(image);
        type.push("O");
      }
    }

    const newbalance = await newApeContract.balanceOf(signerAddress);

    if (newbalance > 0) {
      let b1 = 0;
      for (b1 = 0; b1 < newbalance; b1++) {
        let tokenId = await newApeContract.tokenOfOwnerByIndex(
          signerAddress,
          b1
        );

        tokenId = parseFloat(tokenId);

        // const metadata = await apeContract.methods.tokenURI(tokenId).call();
        // const image = await getImageHash(metadata);
        let token = await newApeContract.mappingNewtoOldTokens(tokenId);

        token = parseFloat(token);
        token = token.toString();

        const image =
          "https://paycnft.mypinata.cloud/ipfs/QmTQiM3TjqwYbtaTMaoWuVRk8dqSxjvYviCorrLBaGGkdK/" +
          token +
          ".png";

        tokenIds.push(tokenId);
        metadatas.push(image);
        type.push("N");
      }
    }

    return {
      tokenIds,
      metadatas,
      type,
    };
  };

  const stake = async (_tokenIds, type) => {
    const apeContract = await getApeContract();

    const stakingContract = await getStakingContract();
    console.log(_tokenIds, type);

    try {
      const approved = await apeContract.isApprovedForAll(
        currentSignerAddress,
        stakingContract.address
      );

      if (approved === false) {
        let txx = await apeContract
          .connect(currentSigner)
          .setApprovalForAll(stakingContract.address, true);

        await txx.wait();
      }

      // Get Staking Contract

      // Set Stake
      let token = parseFloat(_tokenIds);

      if (type === "O") {
        //  let status = await stakingContract.freeMint();

        let _cost;
        // if (status === true) {
        //  _cost = 0;
        // } else {
        _cost = await stakingContract.cost();
        // }
        /*   let txx = await apeContract
          .connect(currentSigner)
          .approve(stakingContract.address, token);

        await txx.wait();
        */
        const options = {
          value: _cost.toString(),
        };
        let token1 = await stakingContract.mappingOldtoNewTokens(token);
        let totalSupply = await stakingContract.totalSupply();
        token1 = parseFloat(token1);
        totalSupply = parseFloat(totalSupply);

        if (totalSupply > 0) {
          /*let genesis = await stakingContract.mappingGenesis(token);
          if(genesis = true)
          {
           let tx3 = await stakingContract
             .connect(currentSigner)
             .ExchangeOldForNew(token);
           await tx3.wait();
          }
          */

          if (token1 > 0) {
            const exist = await stakingContract.checkIfNFTExist(token1);

            if (exist === false) {
              let tx = await stakingContract
                .connect(currentSigner)
                .mint(token, options);
              await tx.wait();
            } else {
              /*  let token1 = await newApeContract.mappingOldtoNewTokens(token);
        console.log("TOKENID Nostr", token);
        console.log("TOKENID Nostr", token1);
        token = parseFloat(token);
        token1 = parseFloat(token1);

        const exchanged = await stakingContract.exchanged(token1);
        console.log("exchange:", exchanged);

        if (exchanged === true) {
          let tx1 = await stakingContract.connect(currentSigner);
          ExchangeNewForOld(token1);
          await tx1.wait();
          window.location.reload();
        } else {
          let tx2 = await stakingContract.connect(currentSigner);
          ExchangeOldForNew(token);
          await tx2.wait();
          window.location.reload();
        }
        */
              console.log("tokensss :", token);
              let tx2 = await stakingContract
                .connect(currentSigner)
                .ExchangeOldForNew(token);
              await tx2.wait();
              // window.location.reload();
            }
          } else {
            let tx = await stakingContract
              .connect(currentSigner)
              .mint(token, options);
            await tx.wait();
            // window.location.reload();
          }
        } else {
          let tx = await stakingContract
            .connect(currentSigner)
            .mint(token, options);
          await tx.wait();
          //  window.location.reload();
        }
      } else if (type === "N") {
        let tx2 = await stakingContract
          .connect(currentSigner)
          .ExchangeNewForOld(token);
        await tx2.wait();
        // window.location.reload();
      }

      return 1;
    } catch (error) {
      show_error_alert(error);
      /*  if (
        error.message
          .toString()
          .includes(
            "execution reverted: ERC721: transfer caller is not owner nor approved"
          )
      ) {
        console.log("ithayyyy aaaaaa", _tokenIds);
        let txx = await apeContract
          .connect(currentSigner)
          .approve(stakingContract.address, parseFloat(_tokenIds));

        await txx.wait();
        // stake(_tokenIds, type);
      }
      */
    }
  };
  async function show_error_alert(error) {
    let temp_error = error.message.toString();
    console.log(temp_error);
    let error_list = [
      "You have not staked any NFTs",
      "Sent Amount Wrong",
      "No balance to claim",
      "No NFTs selected to stake",
      "No NFTs selected to unstake",
      "Max Supply Reached",
      "You have already Claimed Free Nft.",
      "Presale have not started yet.",
      "You are not in Presale List",
      "Staking Period is still not over",
      "Presale Ended.",
      "You are not Whitelisted.",
      "Sent Amount Not Enough",
      "Exceeds max tx per address",
      "Max 20 Allowed.",
      "insufficient funds",
      "Sale is Paused.",
      "mint at least one token",
      "max per transaction 20",
      "Not enough tokens left",
      "incorrect ether amount",
      "The contract is paused!",
      "5 tokens per wallet allowed in presale",
      "10 tokens per wallet allowed in publicsale",
      "Invalid merkle proof",
      "Not enough tokens allowed in current phase",
      "Sold out!!!",
      "No more tokens left in current phase",
      "Wallet limit Reached",
      "Exceeds max NFT per wallet",
      "You are not whitelisted",
      "Insufficient funds!",
      "Insufficient funds!",
      "Whitelist minting is Paused!",
      "Only 1022 NFTs are available for Presale",
      "Insufficient funds",
    ];

    for (let i = 0; i < error_list.length; i++) {
      if (temp_error.includes(error_list[i])) {
        // set ("Transcation Failed")
        // alert(error_list[i]);
        console.log(error_list[i]);
        Swal.fire({
          icon: "error",
          text: error_list[i],
        });

        // alert(error_list[i]);
      }
    }
  }

  const unstake = async (_tokenIds) => {
    // Get Staking Contract
    const stakingContract = await getStakingContract();
    try {
      // Set unstake

      let tx = await stakingContract.connect(currentSigner).unstake(_tokenIds);
      await tx.wait();
      window.location.reload();
    } catch (error) {
      show_error_alert(error);
    }
  };

  const getholderbalance = async (signerAddress) => {
    try {
      // Get Ape Contract
      const provider = getProvider();
      const apeContract = new ethers.Contract(
        ApeContractData.address,
        ApeContractData.abi,
        provider
      );

      const balance = await apeContract.balanceOf(signerAddress);

      console.log(balance.toString());
    } catch (error) {
      console.log(error);
    }
  };

  const getUnstakedBalance = async (signerAddress) => {
    try {
      // Get Ape Contract
      const provider = getProvider();
      const apeContract = new ethers.Contract(
        ApeContractData.address,
        ApeContractData.abi,
        provider
      );
      const balance = await apeContract.balanceOf(signerAddress);
      setUnstakeBalance(balance.toString());
    } catch (error) {
      console.log(error);
    }
  };

  const getStakedBalance = async (signerAddress) => {
    try {
      // Get Staking Contract
      const provider = getProvider();
      const stakingContract = new ethers.Contract(
        StakingContractData.address,
        StakingContractData.abi,
        provider
      );
      const balance = await stakingContract.checkHowManyStaked(signerAddress);
      setStakeBalance(balance.toString());
    } catch (error) {
      console.log(error);
    }
  };
  const gettotalNFTStaked = async (signerAddress) => {
    try {
      // Get Staking Contract
      const provider = getProvider();
      const stakingContract = new ethers.Contract(
        StakingContractData.address,
        StakingContractData.abi,
        provider
      );
      const balance = await stakingContract.totalNFTStaked();
      setTotalStakeBalance(balance.toString());
    } catch (error) {
      console.log(error);
    }
  };
  const getReawardTokenBalance = async (signerAddress) => {
    try {
      // Get Staking Contract
      const provider = getProvider();
      const stakingContract = new ethers.Contract(
        StakingContractData.address,
        StakingContractData.abi,
        provider
      );
      let balance = await stakingContract.calculateReward(signerAddress);

      balance = ethers.utils.formatEther(balance);
      balance = parseFloat(balance).toFixed(3);
      setRewardTokenBalance(balance.toString());
    } catch (error) {
      console.log(error);
    }
  };
  const getRewardAccountBalance = async (signerAddress) => {
    try {
      // Get Staking Contract
      const provider = getProvider();
      const RewardContract = new ethers.Contract(
        RewardContractData.address,
        RewardContractData.abi,
        provider
      );
      let balance = await RewardContract.balanceOf(signerAddress);

      balance = ethers.utils.formatEther(balance);
      balance = parseFloat(balance).toFixed(3);

      setRewardAccountBalance(balance.toString());
    } catch (error) {
      console.log(error);
    }
  };

  const withdrawToERC20 = async () => {
    try {
      const stakingContract = await getStakingContract();
      console.log(currentSignerAddress);
      let tx = await stakingContract
        .connect(currentSigner)
        .claimAlltokens(currentSignerAddress);
      await tx.wait();
      window.location.reload();
    } catch (error) {
      show_error_alert(error);
    }
  };

  return (
    <BlockchainContext.Provider
      value={{
        currentSigner,
        currentSignerAddress,
        connectWallet,
        unstakedNfts,
        stakedNfts,
        stake,
        unstake,
        withdrawToERC20,
        unstakedBalance,
        stakedBalance,
        totalstakedBalance,
        rewardTokenBalance,
        rewardAccountBalance,
        holder,
        MainContract,
        StakeContract,
      }}
    >
      {props.children}
    </BlockchainContext.Provider>
  );
};
