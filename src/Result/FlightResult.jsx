import React from "react";
import { useLocation } from "react-router-dom";
import Layout from "../Layout"
import SingleFlight from "../Flight/SingleFlight";
import RoundFlight from "../Flight/RoundFlight";
import { useState } from "react";
const FlightResults = () => {
  const location = useLocation();
  const { formData } = location.state;
  const [token, setToken] = useState(localStorage.getItem('user'));
  return (
    <Layout token={token}>
      {formData.tripType === "single" && <SingleFlight />}
      {formData.tripType === "round" && <RoundFlight />}
    </Layout>
  );
};

export default FlightResults;
