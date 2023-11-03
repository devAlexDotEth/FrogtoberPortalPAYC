import React, { useState } from "react";
import Popup from "./Popup";
import Swal from "sweetalert2";
import { useContext, useEffect } from "react";
import { BlockchainContext } from "../context/BlockchainContext";
import Tile from '../components/tile';
import Button from '../components/button';
import Navigation from '../components/navigation';
import Wallet from '../components/wallet';
import Portal from "../template/portal";
import ChevronDown from "./icons/chevron";

const Gallery = () => {

  const filterClick = () => {
    alert('Filter Dialog');
  };


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

    <>
      <Navigation
        localStyles={{ position: 'fixed', top: 0 }}
        wallet={
          currentSignerAddress.toString() === "" ? (
            <Button size='M' onClick={handleConnectWallet}>Connect Wallet</Button>
          ) : (
            <Wallet balance={0.0389} address="0x6972b4e81673bcec5f8b4c280E6F752C800D6ED6" profile={image} />
          )
        }>
        <Button as="a" variant='TERTIARY' size='M' href='https://pepeapeyachtclub.com' target="_blank">Return home</Button>
      </Navigation>

      <Portal
        title="Frogtober"
        popover={<Popup showPopup={showPopup} setShowPopup={setShowPopup} />}
        toolbar={
          <>
            <Button size='S' variant='SECONDARY' active after={<ChevronDown size="S" />} onClick={filterClick}>Filter by</Button>
            {currentSignerAddress.toString() === "" && <Button size='S' variant='PRIMARY' onClick={stakeHandler}>Exchange Selected</Button>}
          </>
        }
        children={
          <>
            {unstakedNfts &&
              unstakedNfts.tokenIds &&
              unstakedNfts.tokenIds.map((tokenId, i) => {
                return (
                  <div className="form-group">
                    <input type="checkbox" hidden />
                    <label className="flex justify-center items-center rounded-[1rem] cursor-pointer p-2">
                      {
                        selectedImages.includes(tokenId)
                          ?
                          // ACTIVE TILE COMPONENT
                          <Tile
                            active
                            image={unstakedNfts.metadatas[i]}
                            title="" // We should insert the ID here
                            onClick={() => {
                              imageHandler(tokenId, unstakedNfts.type[i]);
                            }}
                          />
                          :
                          // INACTIVE TILE COMPONENT
                          <Tile
                            image={unstakedNfts.metadatas[i]}
                            title="" // We should insert the ID here
                            onClick={() => {
                              imageHandler(tokenId, unstakedNfts.type[i]);
                            }}
                          />
                      }
                    </label>
                  </div>
                );
              })
            }
          </>
        }
      />

    </>

  );
};

export default Gallery;
