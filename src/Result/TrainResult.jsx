import React from "react";
import { useLocation } from "react-router-dom";
import SingleTrain from "../Train/SingleTrain";
import RoundTrain from "../Train/RoundTrain";
const TrainsResults = () => {
  const location = useLocation();
  const { formData } = location.state;
  return (
    <div>
      {formData.tripType === "single" && <SingleTrain />}
      {formData.tripType === "round" && <RoundTrain />}
    </div>
  );
};

export default TrainsResults;
