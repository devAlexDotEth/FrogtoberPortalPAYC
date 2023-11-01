import React from "react";
import Gallery from "./components/Gallery";
import Video from "./components/Video";

const App = () => {
  return (
    <section
      id="main"
      className="min-h-[100vh] w-[100%] overflow-hidden relative flex flex-col items-center justify-center px-10 mx-auto"
    >
      <Video />
      <div className="flex flex-row my-[2rem] z-[1]">
        <h2 className="font-poppins font-semibold text-white text-[3rem] sm:text-[4rem] text-center">
          PAYC FROGTOBER
        </h2>
      </div>
      <Gallery />
    </section>
  );
};

export default App;
