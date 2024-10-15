import React from "react";
import { useLocation } from "react-router-dom";
import Layout from "../Layout"
import Progress from "../Progress/Progress";

const FlightResults = () => {
  const location = useLocation();
  const { formData } = location.state;
  return (
    <Layout>
      {formData.tripType === "single" && <Progress />}
      {formData.tripType === "round" && <Progress />}
    </Layout>
  );
};

export default FlightResults;
