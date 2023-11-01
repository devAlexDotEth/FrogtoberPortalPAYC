import React, { useState } from "react";
import Popup from "./Popup";
import Swal from "sweetalert2";
import { useContext, useEffect } from "react";
import { BlockchainContext } from "../context/BlockchainContext";

const Gallery = () => {
  const { connectWallet } = useContext(BlockchainContext);
  function handleConnectWallet() {
    connectWallet();
  }

  const {
    checkMutation,
    stakedNfts,
    unstakedNfts,
    stake,
    mint,
    unstakedBalance,
    stakedBalance,
    totalstakedBalance,
    holder,
    unstake,
    currentSigner,
    currentSignerAddress,
    MainContract,
    StakeContract,
  } = useContext(BlockchainContext);

  const [showPopup, setShowPopup] = useState(false);

  const selectedImages1 = [];
  const [selectedImages, setSelectedImages] = useState([]);
  const [nftType, setNftType] = useState("");

  const selectImageHandle = (imageId) => {
    if (selectedImages.includes(imageId)) {
      const removeImage = selectedImages.indexOf(imageId);
      selectedImages.splice(removeImage, 1);
    } else {
      selectedImages.push(imageId);
    }
    // console.log(selectedImages);
  };
  const imageHandler = (tokenId, type) => {
    if (selectedImages.includes(tokenId)) {
      setSelectedImages(
        selectedImages.filter((token_id) => token_id !== tokenId)
      );
    } else {
      setSelectedImages((oldArray) => [...oldArray, tokenId]);
    }

    setNftType(type);
  };
  const stakeHandler = async () => {
    if (selectedImages.length !== 1) {
      Swal.fire({
        icon: "error",
        text: "Please select 1 NFT",
      });
    } else {
      let val = await stake(selectedImages, nftType);

      if (val === 1) {
        setShowPopup(true);
      }
    }
  };

  return (
    <div className="flex flex-col z-[2]">
      <div className="flex-1 grid gap-10 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-[60rem] max-h-[10rem] min-h-[30rem] h-[100%] w-[100%] overflow-y-auto overflow-x-hidden mb-10 mx-auto rounded-lg bg-slate-300 bg-opacity-40 p-10">
        {unstakedNfts &&
          unstakedNfts.tokenIds &&
          unstakedNfts.tokenIds.map((tokenId, i) => {
            return (
              <div className="form-group">
                <input type="checkbox" hidden />
                <label className="flex justify-center items-center rounded-[1rem] cursor-pointer p-2">
                  <img
                    style={{
                      border: selectedImages.includes(tokenId)
                        ? "4px solid red"
                        : "",
                    }}
                    src={unstakedNfts.metadatas[i]}
                    alt=""
                    onClick={() => {
                      imageHandler(tokenId, unstakedNfts.type[i]);
                    }}
                    className="h-[100%] w-[100%] rounded-[1rem]"
                  />
                </label>
              </div>
            );
          })}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center my-5">
        <p className="font-poppins font-normal text-[2rem] text-white text-center max-w-[100%] sm:max-w-[60%] mx-auto mb-5">
          SELECT THE NFT YOU WOULD LIKE TO EXCHANGE AND CLICK THE EXCHANGE
          BUTTON BELOW
        </p>
        {currentSignerAddress.toString() === "" ? (
          <button
            className="inline-block bg-slate-400 px-16 py-10 rounded-[1rem] font-poppins font-medium text-[2rem] leading-[1] hover:text-white"
            onClick={handleConnectWallet}
          >
            Connect
          </button>
        ) : (
          <button
            className="inline-block bg-slate-400 px-16 py-10 rounded-[1rem] font-poppins font-medium text-[2rem] leading-[1] hover:text-white"
            onClick={stakeHandler}
          >
            Exchange
          </button>
        )}
      </div>

      <Popup showPopup={showPopup} setShowPopup={setShowPopup} />
    </div>
  );
};

export default Gallery;
