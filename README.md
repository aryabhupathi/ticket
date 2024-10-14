import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,Grid
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLocation } from "react-router-dom";
import { bus } from "../data"; // Adjust the import as necessary
import jsPDF from "jspdf";

const SingleBus = () => {
  const location = useLocation();
  const { formData } = location.state;
  const [selectedSeats, setSelectedSeats] = useState({});
  const [fare, setFare] = useState(0);
  const [openConfirmModal, setOpenConfirmModal] = useState(false); // State for confirmation modal
  const [selectedBus, setSelectedBus] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false); // State to manage download button visibility
  const [bookingConfirmed, setBookingConfirmed] = useState(false); // State to manage booking confirmation

  // Filter bus details based on source and destination for outbound trips
  const outboundTrips = bus.filter(
    (item) =>
      item.source === formData.source &&
      item.destination === formData.destination
  );

  const handleSeatClick = (seat) => {
    if (!selectedBus || bookingConfirmed) return; // Prevent selection if booking is confirmed

    setSelectedSeats((prevSelectedSeats) => {
      const currentSelection = prevSelectedSeats[selectedBus.busName] || [];
      const isSelected = currentSelection.includes(seat);
      const updatedSelection = isSelected
        ? currentSelection.filter((s) => s !== seat)
        : [...currentSelection, seat];

      // Update the fare based on the selected seats
      setFare(updatedSelection.length * selectedBus.fare);
      return {
        ...prevSelectedSeats,
        [selectedBus.busName]: updatedSelection,
      };
    });
  };

  const handleBusSelect = (bus) => {
    if (selectedBus) {
      // Clear selected seats for the previous bus
      setSelectedSeats((prevSelectedSeats) => ({
        ...prevSelectedSeats,
        [selectedBus.busName]: [], // Resetting previous bus's seats
      }));
    }

    setSelectedBus(bus);
    setSelectedSeats({ [bus.busName]: [] }); // Reset selected seats for the new bus
    setFare(0); // Reset fare when changing bus
    setShowDownloadButton(false); // Reset download button visibility when bus changes
    setBookingConfirmed(false); // Reset booking confirmation state
  };

  const handleBookSeats = () => {
    setOpenConfirmModal(true); // Open the confirmation modal
  };

  const confirmBooking = () => {
    setBookingConfirmed(true); // Set booking as confirmed
    setOpenConfirmModal(false); // Close confirmation modal
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Reservation Details", 20, 20);

    let y = 30;
    Object.keys(selectedSeats).forEach((busName) => {
      const seats = selectedSeats[busName];
      if (seats.length > 0) {
        const selectedBusDetails = outboundTrips.find(
          (bus) => bus.busName === busName
        );
        if (selectedBusDetails) {
          doc.text(`Bus: ${busName}`, 20, y);
          doc.text(
            `Route: ${selectedBusDetails.source} to ${selectedBusDetails.destination}`,
            20,
            y + 10
          );
          doc.text(`Seats: ${seats.join(", ")}`, 20, y + 20);
          doc.text(
            `Fare: $${selectedBusDetails.fare * seats.length}`,
            20,
            y + 30
          );
          y += 40;
        }
      }
    });

    doc.save("reservation-details.pdf");
  };

  // Handle accordion expansion
  const handleChange = (busIndex) => {
    setExpanded(expanded === busIndex ? false : busIndex);
    handleBusSelect(outboundTrips[busIndex]);
  };

  return (
    <Box
      sx={{
        padding: 2,
        height: "100vh", // Full height of viewport
        backgroundImage: "url(../../bus.webp)", // Reference to your image in the public folder
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          background:
            "linear-gradient(to right, violet, indigo, blue, green, yellow, orange, red)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: "center",
          margin: 0,
        }}
      >
        Available Buses from {formData.source} to {formData.destination}
      </Typography>

      {/* Single Trip Logic */}
      {formData.tripType === "single" && (
        <Grid xs={12} sm={9} sx = {{border:'2px solid red'}}>
          {outboundTrips.length > 0 ? (
            outboundTrips.map((details, index) => (
              <Accordion
                key={index}
                expanded={expanded === index} // Control expansion state
                onChange={() => handleChange(index)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{details.busName}</Typography>
                  <Box display="flex" flexDirection="column" ml={2}>
                    <Typography variant="body1">
                      Route: {details.source} to {details.destination}
                    </Typography>
                    <Typography variant="body1">
                      Fare per seat: ${details.fare}
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  <Box>
                    <Typography variant="body2">
                      Start Time: {details.startTime}
                    </Typography>
                    <Typography variant="body2">
                      End Time: {details.endTime}
                    </Typography>
                    <Typography variant="body2">
                      Stops: {details.stops.join(", ")}
                    </Typography>
                    <Typography variant="body2">
                      Seats Available: {details.noOfSeatsAvailable}
                    </Typography>

                    <Typography variant="h6" color="primary" mt={2}>
                      Total Fare: ${fare}
                    </Typography>
                    <Box display="flex" flexDirection="column" mt={2}>
                      {[0, 1, 2, 3].map((seatRow) => (
                        <Box
                          key={seatRow}
                          display="flex"
                          flexDirection="row"
                          justifyContent="space-around"
                          mb={1}
                        >
                          {/* Display the seats as 1A 2A 3A per row */}
                          {details.layout.seatConfiguration.map(
                            (row, rowIndex) => (
                              <Box
                                key={rowIndex}
                                bgcolor={
                                  selectedSeats[details.busName]?.includes(
                                    row[seatRow]
                                  )
                                    ? "lightgreen" // Change to light green for selected seats
                                    : bookingConfirmed // Disable selection if booking is confirmed
                                    ? "lightgray"
                                    : "lightgray"
                                }
                                textAlign="center"
                                width="50px"
                                border="1px solid black"
                                sx={{
                                  cursor: bookingConfirmed
                                    ? "not-allowed"
                                    : "pointer",
                                }}
                                onClick={() => handleSeatClick(row[seatRow])}
                              >
                                {row[seatRow]}
                              </Box>
                            )
                          )}
                        </Box>
                      ))}
                    </Box>

                    {/* Show Book button when seats are selected and not confirmed */}
                    {selectedSeats[details.busName]?.length > 0 &&
                      !bookingConfirmed && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleBookSeats}
                          sx={{ mt: 2 }}
                        >
                          Book
                        </Button>
                      )}

                    {/* Show Download button after booking is confirmed */}
                    {bookingConfirmed && (
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={downloadPDF}
                      >
                        Download
                      </Button>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Typography variant="h6">
              No buses available for this route.
            </Typography>
          )}
        </Grid>
      )}

      {/* Confirmation Modal */}
      <Modal open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Confirm Booking
          </Typography>

          <Typography variant="body1">Selected Bus Details:</Typography>

          {Object.keys(selectedSeats).map((busName, index) => {
            const busDetails = outboundTrips.find(
              (bus) => bus.busName === busName
            );
            return (
              selectedSeats[busName].length > 0 && (
                <Box key={index}>
                  <Typography variant="body1">
                    Bus: {busDetails.busName}
                  </Typography>
                  <Typography variant="body2">
                    Route: {busDetails.source} to {busDetails.destination}
                  </Typography>
                  <Typography variant="body2">
                    Seats: {selectedSeats[busName].join(", ")}
                  </Typography>
                  <Typography variant="body2">
                    Fare: ${busDetails.fare * selectedSeats[busName].length}
                  </Typography>
                </Box>
              )
            );
          })}

          <Button variant="contained" sx={{ mt: 2 }} onClick={confirmBooking}>
            Confirm
          </Button>
          <Button
            variant="outlined"
            sx={{ mt: 2, ml: 2 }}
            onClick={() => setOpenConfirmModal(false)}
          >
            Cancel
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default SingleBus;
