import React from "react";
import { useLocation } from "react-router-dom";
import SingleTrain from "../Train/SingleTrain";
import RoundTrain from "../Train/RoundTrain";
import Layout from "../Layout";
import { useState } from "react";
const TrainsResults = () => {
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem('user'));
  const { formData } = location.state;
  return (
    <Layout token={token}>
      {formData.tripType === "single" && <SingleTrain />}
      {formData.tripType === "round" && <RoundTrain />}
    </Layout>
  );
};

export default TrainsResults;
