import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,
  Grid,
  Alert,
  Snackbar,
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
  // eslint-disable-next-line
  const [showDownloadButton, setShowDownloadButton] = useState(false); // State to manage download button visibility
  const [bookingConfirmed, setBookingConfirmed] = useState(false); // State to manage booking confirmation
  const [showMessage, setshowMessage] = useState(false);
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
  const handleClose = () => setshowMessage(false);
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
    setTimeout(() => {
      setshowMessage(true);
    }, 2000);
  };
  // Handle accordion expansion

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Header
    doc.setFontSize(22);
    doc.text("Reservation Details", margin, margin);
    doc.setFontSize(12);
    doc.text(
      `Date: ${new Date().toLocaleDateString()}`,
      pageWidth - margin - 50,
      margin
    );

    // Table header
    const headerY = 40;
    doc.setFontSize(12);
    const headers = ["Bus Name", "Route", "Start Time", "Seats", "Fare"];
    const columnWidths = [40, 40, 40, 30, 20];

    // Draw header row
    headers.forEach((header, index) => {
      doc.text(
        header,
        margin + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
        headerY
      );
    });

    // Data rows
    let y = headerY + 10;
    Object.keys(selectedSeats).forEach((busName) => {
      const seats = selectedSeats[busName];
      if (seats.length > 0) {
        const selectedBusDetails = outboundTrips.find(
          (bus) => bus.busName === busName
        );
        if (selectedBusDetails) {
          const fare = selectedBusDetails.fare * seats.length;

          // Aligning data in rows
          doc.text(busName, margin, y);
          doc.text(
            `${selectedBusDetails.source} to ${selectedBusDetails.destination}`,
            margin + columnWidths[0],
            y
          );
          doc.text(
            selectedBusDetails.startTime,
            margin + columnWidths[0] + columnWidths[1],
            y
          );
          doc.text(
            seats.join(", "),
            margin + columnWidths[0] + columnWidths[1] + columnWidths[2],
            y
          );
          doc.text(
            `$${fare}`,
            margin +
              columnWidths[0] +
              columnWidths[1] +
              columnWidths[2] +
              columnWidths[3],
            y
          );

          y += 10;

          // Add page break if necessary
          if (y > pageHeight - margin) {
            doc.addPage();
            y = headerY + 10; // Reset y for new page
            // Reprint the header on the new page
            headers.forEach((header, index) => {
              doc.text(
                header,
                margin +
                  columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
                headerY
              );
            });
          }
        }
      }
    });

    // Footer
    doc.setFontSize(10);
    doc.text("Thank you for your reservation!", margin, pageHeight - margin);

    // Save the PDF
    doc.save("reservation-details.pdf");
  };

  const handleChange = (busIndex) => {
    setExpanded(expanded === busIndex ? false : busIndex);
    handleBusSelect(outboundTrips[busIndex]);
  };

  return (
    <Box
      sx={{
        padding: 2,
        // position: "relative", // Position relative to ensure child elements align properly

        backgroundImage:
          "url(../../bus.webp)" /* Replace with your image path */,
        backgroundSize: "cover" /* Ensure the image covers the entire area */,
        backgroundRepeat: "no-repeat" /* Prevent repeating the image */,
        backgroundPosition: "center" /* Center the image */,
        backgroundAttachment: "fixed" /* Make the background fixed */,
        minHeight:
          "100vh" /* Ensure the container is at least the height of the viewport */,
      }}
    >
      <Typography
        variant="h5"
        sx={{
          background: "linear-gradient(to right,red, green, blue)",
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
        <Grid
          xs={12}
          sm={9}
          sx={{ padding: 2 }} // Added padding for better spacing
        >
          {outboundTrips.length > 0 ? (
            outboundTrips.map((details, index) => (
              <Accordion
                key={index}
                expanded={expanded === index} // Control expansion state
                onChange={() => handleChange(index)}
                sx={{ mb: 2 }} // Added margin bottom for spacing between accordions
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography
                    variant="h6"
                    sx={{ color: "blue", fontWeight: "bold" }}
                  >
                    {details.busName}
                    <span style={{ color: "gray" }}> &#x2794; </span>{" "}
                    {/* Arrow icon */}
                  </Typography>

                  <Typography variant="body1" sx={{ color: "green", ml: 2 }}>
                    Route: {details.source} to {details.destination}
                    <span style={{ color: "gray" }}> &#x2794; </span>{" "}
                    {/* Arrow icon */}
                  </Typography>

                  <Typography variant="body1" sx={{ color: "orange", ml: 2 }}>
                    Fare per seat: ${details.fare}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Box>
                    <Box
                      sx={{
                        border: "1px solid lightgray", // Set border color
                        borderRadius: "4px", // Rounded corners
                        padding: 2, // Padding inside the box
                        mb: 2, // Margin bottom for spacing
                        backgroundColor: "#f9f9f9", // Light background color
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "blue", mr: 1 }}
                        >
                          Start Time: {details.startTime}
                        </Typography>

                        <Typography variant="body2" sx={{ color: "blue" }}>
                          | End Time: {details.endTime}{" "}
                          {/* Pipe to separate times */}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{ color: "green", mt: 1 }}
                      >
                        Stops: {details.stops.join(", ")}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ color: "orange", mt: 1 }}
                      >
                        Seats Available: {details.noOfSeatsAvailable}
                      </Typography>

                      <Box display="flex" flexDirection="column" mt={2}>
                        {[0, 1, 2, 3].map((seatRow) => (
                          <Box
                            key={seatRow}
                            display="flex"
                            flexDirection="row"
                            justifyContent="space-around"
                            mb={1}
                            mx={1}
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
                                      : bookingConfirmed
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
                                    fontSize: { xs: "0.8rem", sm: "1rem" }, // Font size adjustment
                                    transition: "background-color 0.3s", // Smooth background transition
                                    "&:hover": {
                                      backgroundColor: !bookingConfirmed
                                        ? "lightyellow"
                                        : "inherit", // Hover effect
                                    },
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

                      <Typography variant="h6" color="primary" mt={2}>
                        Total Fare: ${fare}
                      </Typography>
                    </Box>

                    {/* Show Book button when seats are selected and not confirmed */}
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
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
      <Snackbar
        open={showMessage}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity="success">
          Booking confirmed successfully!
        </Alert>
      </Snackbar>
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

          {Object.keys(selectedSeats).map((busName, index) => {
            const busDetails = outboundTrips.find(
              (bus) => bus.busName === busName
            );
            return (
              selectedSeats[busName].length > 0 && (
                <Box
                  key={index}
                  sx={{
                    border: "1px solid lightgray", // Border around each bus detail box
                    borderRadius: "4px", // Rounded corners
                    padding: 2, // Padding inside the box
                    mb: 2, // Margin bottom for spacing
                    backgroundColor: "#f9f9f9", // Light background color
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    Bus: {busDetails.busName}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Route: {busDetails.source} to {busDetails.destination}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Time: {busDetails.startTime} -- {busDetails.endTime}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Seats: {selectedSeats[busName].join(", ")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
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
