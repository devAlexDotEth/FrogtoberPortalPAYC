import React, { useCallback } from "react";
import { render } from "../assets";

const Popup = (props) => {
  const endPopup = async () => {
    props.setShowPopup(false);
    window.location.reload();
  };

  return props.showPopup ? (
    <div className="absolute z-[9] h-[100%] w-[100%] left-[50%] top-[50%] translate-[-50%, -50%] bg-slate-800 -translate-xy flex justify-center items-center">
      <video
        id="popup_video"
        className="video object-fill h-[100%] w-[100%]"
        autoPlay
        onEnded={endPopup}
      >
        <source type="video/mp4" src={render} />
      </video>
    </div>
  ) : (
    ""
  );
};

export default Popup;
