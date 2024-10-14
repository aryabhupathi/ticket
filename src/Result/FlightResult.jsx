import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; // Import ExpandMoreIcon
import { flight } from "../data"; // Import your flight data
import SeatLayout from "./FlightLayout"; // Import the SeatLayout component

const FlightResults = () => {
  const location = useLocation();
  const { formData } = location.state; // Retrieve form data from location state
  const { source, destination, date, tripType } = formData; // Destructure formData

  // State to manage the seat layout dialog
  const [isSeatLayoutOpen, setSeatLayoutOpen] = useState(false);

  // Function to find matching flight details
  const singleDetails = flight.filter(
    (item) => item.source === source && item.destination === destination
  );
  const returnDetails = flight.filter(
    (item) => item.source === destination && item.destination === source
  );

  const handleLayout = () => {
    setSeatLayoutOpen(true);
  };

  return (
    <Box sx={{ padding: 3 }}>
      {tripType === "single" && singleDetails.length > 0 ? (
        singleDetails.map((flightData, index) => (
          <Accordion key={index}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {flightData.flightName} ({flightData.source} to{" "}
                {flightData.destination})
              </Typography>
              <Typography variant="body2" sx={{ marginLeft: 2 }}>
                Stops: {flightData.stops.join(", ")}
              </Typography>
              <Typography variant="body2" sx={{ marginLeft: 2 }}>
                Date: {date}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ width: "100%" }}>
                <Typography variant="h6">Categories:</Typography>
                <Grid container spacing={2}>
                  {flightData.categories.map((category, catIndex) => (
                    <Grid item xs={12} sm={6} md={4} key={catIndex}>
                      <Box
                        sx={{
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="h6">
                          {category.categoryName}
                        </Typography>
                        <Typography variant="body1">
                          Available Seats: {category.noOfSeatsAvailable}
                        </Typography>
                        <Typography variant="body1">
                          Fare: ${category.fare}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              <Button onClick={handleLayout}>Book</Button>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography variant="h6" align="center" sx={{ mt: 3 }}>
          No flights found for {source} to {destination} on {date}.
        </Typography>
      )}

      {/* Seat Layout Modal */}
      {isSeatLayoutOpen && (
        <SeatLayout flightData={flight} onClose={() => setSeatLayoutOpen(false)} />)}

      {/* Handle return trip details */}
      {tripType === "return" && returnDetails.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5">Return Flights:</Typography>
          {returnDetails.map((flightData, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  {flightData.flightName} ({flightData.source} to{" "}
                  {flightData.destination})
                </Typography>
                <Typography variant="body2" sx={{ marginLeft: 2 }}>
                  Stops: {flightData.stops.join(", ")}
                </Typography>
                <Typography variant="body2" sx={{ marginLeft: 2 }}>
                  Date: {date}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ width: "100%" }}>
                  <Typography variant="h6">Categories:</Typography>
                  <Grid container spacing={2}>
                    {flightData.categories.map((category, catIndex) => (
                      <Grid item xs={12} sm={6} md={4} key={catIndex}>
                        <Box
                          sx={{
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            padding: "16px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="h6">
                            {category.categoryName}
                          </Typography>
                          <Typography variant="body1">
                            Available Seats: {category.noOfSeatsAvailable}
                          </Typography>
                          <Typography variant="body1">
                            Fare: ${category.fare}
                          </Typography>
                          <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            disabled={category.noOfSeatsAvailable === 0}
                            onClick={() => {
                              // Open the seat layout modal
                              setSeatLayoutOpen(true);
                            }}
                          >
                            {category.noOfSeatsAvailable > 0
                              ? "Book Now"
                              : "Sold Out"}
                          </Button>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Message for return trip if no flights found */}
      {tripType === "return" && returnDetails.length === 0 && (
        <Typography variant="h6" align="center" sx={{ mt: 3 }}>
          No return flights found for {destination} to {source} on {date}.
        </Typography>
      )}
    </Box>
  );
};

export default FlightResults;
