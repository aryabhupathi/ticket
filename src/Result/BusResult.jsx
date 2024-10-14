import React from "react";
import { useLocation } from "react-router-dom";
import SingleBus from "../Bus/SingleBus";
import RoundBus from "../Bus/Roundbus";
import { Box } from "@mui/material";

const BusResults = () => {
  const location = useLocation();
  const { formData } = location.state;
  return (
    <Box>
      {formData.tripType === "single" && <SingleBus />}
      {formData.tripType === "round" && <RoundBus />}
    </Box>
  );
};

export default BusResults;
