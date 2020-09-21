import React from "react";
import { ClipLoader } from "react-spinners";

const Loading = () => (
  <div className="lazy-loading">
    <ClipLoader loading size={100} color="#74B1E5" />
  </div>
);

export default Loading;
