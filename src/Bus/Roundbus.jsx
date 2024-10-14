import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,
  Snackbar,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLocation } from "react-router-dom";
import { bus } from "../data"; // Adjust the import as necessary
import jsPDF from "jspdf";

const RoundBus = () => {
  const location = useLocation();
  const { formData } = location.state;
  const [selectedSeats, setSelectedSeats] = useState({
    outbound: {},
    return: {},
  });
  const [fare, setFare] = useState({ outbound: 0, return: 0 });
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState({
    outbound: null,
    return: null,
  });
  const [expandedIndex, setExpandedIndex] = useState({
    outbound: false,
    return: false,
  });
  const [bookingConfirmed, setBookingConfirmed] = useState({
    outbound: false,
    return: false,
  });
  const [currentTripType, setCurrentTripType] = useState("");
  const [showMessage, setshowMessage] = useState(false);
  // Filter bus details based on source and destination for outbound and return trips
  const outboundTrips = bus.filter(
    (item) =>
      item.source === formData.source &&
      item.destination === formData.destination
  );

  const returnTrips = bus.filter(
    (item) =>
      item.source === formData.destination &&
      item.destination === formData.source
  );

  const handleClose = () => setshowMessage(false);
  const handleSeatClick = (seat, tripType) => {
    if (!selectedBus[tripType] || bookingConfirmed[tripType]) return;

    setSelectedSeats((prevSelectedSeats) => {
      const currentSelection =
        prevSelectedSeats[tripType][selectedBus[tripType].busName] || [];
      const isSelected = currentSelection.includes(seat);
      const updatedSelection = isSelected
        ? currentSelection.filter((s) => s !== seat)
        : [...currentSelection, seat];

      // Update the fare based on the selected seats
      setFare((prevFare) => ({
        ...prevFare,
        [tripType]: updatedSelection.length * selectedBus[tripType].fare,
      }));

      return {
        ...prevSelectedSeats,
        [tripType]: {
          ...prevSelectedSeats[tripType],
          [selectedBus[tripType].busName]: updatedSelection,
        },
      };
    });
  };

  const handleBusSelect = (bus, tripType) => {
    setSelectedBus((prev) => ({
      ...prev,
      [tripType]: bus,
    }));

    setSelectedSeats((prevSelectedSeats) => ({
      ...prevSelectedSeats,
      [tripType]: { [bus.busName]: [] }, // Reset selected seats for the new bus
    }));

    setFare((prevFare) => ({
      ...prevFare,
      [tripType]: 0, // Reset fare when changing bus
    }));

    setBookingConfirmed((prev) => ({
      ...prev,
      [tripType]: false, // Reset booking confirmation state
    }));
  };

  const handleBookSeats = (tripType) => {
    setCurrentTripType(tripType); // Set the current trip type for confirmation
    setOpenConfirmModal(true); // Open the confirmation modal
  };

  const confirmBooking = () => {
    setBookingConfirmed((prev) => ({
      ...prev,
      [currentTripType]: true, // Set the current trip type booking as confirmed
    }));
    setOpenConfirmModal(false); // Close confirmation modal
    setTimeout(() => {
      setshowMessage(true);
    }, 2000);
  };

  const downloadPDF = (tripType) => {
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
    const headers = ["Bus Name", "Route", "Seats", "Fare"];
    const columnWidths = [60, 80, 50, 30];

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

    const selectedSeatsForTrip = selectedSeats[tripType];
    const selectedBusDetails = selectedBus[tripType];

    if (selectedSeatsForTrip[selectedBusDetails.busName]?.length > 0) {
      const seats = selectedSeatsForTrip[selectedBusDetails.busName];
      const fare = selectedBusDetails.fare * seats.length;

      // Aligning data in rows
      doc.text(selectedBusDetails.busName, margin, y);
      doc.text(
        `${selectedBusDetails.source} to ${selectedBusDetails.destination}`,
        margin + columnWidths[0],
        y
      );
      doc.text(seats.join(", "), margin + columnWidths[0] + columnWidths[1], y);
      doc.text(
        `$${fare}`,
        margin + columnWidths[0] + columnWidths[1] + columnWidths[2],
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
            margin + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
            headerY
          );
        });
      }
    }

    // Footer
    doc.setFontSize(10);
    doc.text("Thank you for your reservation!", margin, pageHeight - margin);

    // Save the PDF
    doc.save("reservation-details.pdf");
  };

  const handleChange = (busIndex, tripType) => {
    // Check if the clicked bus is already expanded
    const isCurrentlyExpanded = expandedIndex[tripType] === busIndex;

    // Collapse if already expanded
    setExpandedIndex((prevExpandedIndex) => ({
      ...prevExpandedIndex,
      [tripType]: isCurrentlyExpanded ? false : busIndex, // Set to false to collapse
    }));

    // If not currently expanded, select the bus
    if (!isCurrentlyExpanded) {
      const selectedBusDetails =
        tripType === "outbound"
          ? outboundTrips[busIndex]
          : returnTrips[busIndex];
      handleBusSelect(selectedBusDetails, tripType);
    } else {
      // If it is currently expanded, clear the selection
      setSelectedBus((prev) => ({
        ...prev,
        [tripType]: null, // Clear selected bus
      }));
      setSelectedSeats((prevSelectedSeats) => ({
        ...prevSelectedSeats,
        [tripType]: {}, // Reset selected seats
      }));
      setFare((prevFare) => ({
        ...prevFare,
        [tripType]: 0, // Reset fare when collapsing
      }));
      setBookingConfirmed((prev) => ({
        ...prev,
        [tripType]: false, // Reset booking confirmation state
      }));
    }
  };

  return (
    <Box
      sx={{
        padding: 2,
        // position: "relative", // Position relative to ensure child elements align properly
        height: "100vh", // Full height of the viewport
        backgroundImage: "url(../../bus.webp)", // Reference to your image in the public folder
        backgroundSize: "cover", // Cover the entire area
        backgroundRepeat: "no-repeat", // No repeat
        backgroundPosition: "center", // Center the image
      }}
    >
      <Typography
        variant="h5"
        sx={{
          background:"linear-gradient(to right,red, green, blue)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: "center",
          margin: 0,
        }}
      >
        Available Buses from {formData.source} to {formData.destination}
      </Typography>

      {/* Outbound Trip Logic */}
      {formData.tripType === "round" && (
        <>
          <Typography variant="h5" gutterBottom>
            Outbound Trip
          </Typography>
          <Box>
            {outboundTrips.map((bus, index) => (
              <Accordion
                key={index}
                expanded={expandedIndex.outbound === index}
                onChange={() => handleChange(index, "outbound")}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography
                    variant="h6"
                    sx={{ color: "blue", fontWeight: "bold" }}
                  >
                    {bus.busName}
                    <span style={{ color: "gray" }}> &#x2794; </span>{" "}
                    {/* Arrow icon */}
                  </Typography>

                  <Typography variant="body1" sx={{ color: "green", ml: 2 }}>
                    Route: {bus.source} to {bus.destination}
                    <span style={{ color: "gray" }}> &#x2794; </span>{" "}
                    {/* Arrow icon */}
                  </Typography>

                  <Typography variant="body1" sx={{ color: "orange", ml: 2 }}>
                    Fare per seat: ${bus.fare}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    sx={{
                      border: "1px solid lightgray", // Set border color
                      borderRadius: "4px", // Rounded corners
                      padding: 2, // Padding inside the box
                      mb: 2, // Margin bottom for spacing
                      backgroundColor: "#f9f9f9", // Light background color
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" sx={{ color: "blue", mr: 1 }}>
                        Start Time: {bus.startTime}
                      </Typography>

                      <Typography variant="body2" sx={{ color: "blue" }}>
                        | End Time: {bus.endTime} {/* Pipe to separate times */}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "green", mt: 1 }}>
                      {" "}
                      Stops: {bus.stops.join(", ")}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "orange", mt: 1 }}>
                      {" "}
                      Seats Available: {bus.noOfSeatsAvailable}
                    </Typography>
                    <Typography variant="body1" mt={2}>
                      Selected Seats:{" "}
                      {selectedSeats.outbound[bus.busName]?.join(", ") ||
                        "None"}
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
                          {bus.layout.seatConfiguration.map((row, rowIndex) => (
                            <Box
                              key={rowIndex}
                              bgcolor={
                                selectedSeats.outbound[bus.busName]?.includes(
                                  row[seatRow]
                                )
                                  ? "lightgreen"
                                  : "lightgray"
                              }
                              textAlign="center"
                              width="50px"
                              border="1px solid black"
                              sx={{
                                cursor: "pointer",
                                fontSize: { xs: "0.8rem", sm: "1rem" }, // Font size adjustment
                                transition: "background-color 0.3s", // Smooth background transition
                                "&:hover": {
                                  backgroundColor: !bookingConfirmed
                                    ? "lightyellow"
                                    : "inherit", // Hover effect
                                },
                              }}
                              onClick={() =>
                                handleSeatClick(row[seatRow], "outbound")
                              }
                            >
                              {row[seatRow]}
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </Box>
                    <Typography variant="h6" color="primary" mt={2}>
                      Total Fare: ${fare.outbound}
                    </Typography>
                    {selectedSeats.outbound[bus.busName]?.length > 0 &&
                      !bookingConfirmed.outbound && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleBookSeats("outbound")}
                          sx={{ mt: 2 }}
                        >
                          Book Outbound
                        </Button>
                      )}
                    {bookingConfirmed.outbound && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => downloadPDF("outbound")}
                        sx={{ mt: 2 }}
                      >
                        Download Outbound PDF
                      </Button>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          {/* Return Trip Logic */}
          <Typography variant="h5" gutterBottom>
            Return Trip
          </Typography>
          <Box>
            {returnTrips.map((bus, index) => (
              <Accordion
                key={index}
                expanded={expandedIndex.return === index}
                onChange={() => handleChange(index, "return")}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography
                    variant="h6"
                    sx={{ color: "blue", fontWeight: "bold" }}
                  >
                    {bus.busName}
                    <span style={{ color: "gray" }}> &#x2794; </span>{" "}
                    {/* Arrow icon */}
                  </Typography>

                  <Typography variant="body1" sx={{ color: "green", ml: 2 }}>
                    Route: {bus.source} to {bus.destination}
                    <span style={{ color: "gray" }}> &#x2794; </span>{" "}
                    {/* Arrow icon */}
                  </Typography>

                  <Typography variant="body1" sx={{ color: "orange", ml: 2 }}>
                    Fare per seat: ${bus.fare}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    sx={{
                      border: "1px solid lightgray", // Set border color
                      borderRadius: "4px", // Rounded corners
                      padding: 2, // Padding inside the box
                      mb: 2, // Margin bottom for spacing
                      backgroundColor: "#f9f9f9", // Light background color
                    }}
                  >
                    <Typography variant="body2">
                      Start Time: {bus.startTime}
                    </Typography>
                    <Typography variant="body2">
                      End Time: {bus.endTime}
                    </Typography>
                    <Typography variant="body2">
                      Stops: {bus.stops.join(", ")}
                    </Typography>
                    <Typography variant="body2">
                      Seats Available: {bus.noOfSeatsAvailable}
                    </Typography>
                    <Typography variant="body1" mt={2}>
                      Selected Seats:{" "}
                      {selectedSeats.return[bus.busName]?.join(", ") || "None"}
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
                          {bus.layout.seatConfiguration.map((row, rowIndex) => (
                            <Box
                              key={rowIndex}
                              bgcolor={
                                selectedSeats.return[bus.busName]?.includes(
                                  row[seatRow]
                                )
                                  ? "lightgreen"
                                  : "lightgray"
                              }
                              textAlign="center"
                              width="50px"
                              border="1px solid black"
                              sx={{
                                cursor: "pointer",
                                fontSize: { xs: "0.8rem", sm: "1rem" }, // Font size adjustment
                                transition: "background-color 0.3s", // Smooth background transition
                                "&:hover": {
                                  backgroundColor: !bookingConfirmed
                                    ? "lightyellow"
                                    : "inherit", // Hover effect
                                },
                              }}
                              onClick={() =>
                                handleSeatClick(row[seatRow], "return")
                              }
                            >
                              {row[seatRow]}
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </Box>
                    <Typography variant="h6" color="primary" mt={2}>
                      Total Fare: ${fare.return}
                    </Typography>
                    {selectedSeats.return[bus.busName]?.length > 0 &&
                      !bookingConfirmed.return && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleBookSeats("return")}
                          sx={{ mt: 2 }}
                        >
                          Book Return
                        </Button>
                      )}
                    {bookingConfirmed.return && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => downloadPDF("return")}
                        sx={{ mt: 2 }}
                      >
                        Download Return PDF
                      </Button>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </>
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
          <Typography variant="h6">Confirm Booking</Typography>

          <Box mt={2}>
            <Typography variant="h6"> Trip Details:</Typography>
            {selectedBus.outbound && (
              <>
                <Typography variant="body2">
                  Bus: {selectedBus.outbound.busName}
                </Typography>
                <Typography variant="body2">
                  Route: {selectedBus.outbound.source} to{" "}
                  {selectedBus.outbound.destination}
                </Typography>
                <Typography variant="body2">
                  Start Time: {selectedBus.outbound.startTime}
                </Typography>
                <Typography variant="body2">
                  End Time: {selectedBus.outbound.endTime}
                </Typography>
                <Typography variant="body2">
                  Selected Seats (Outbound):{" "}
                  {selectedSeats.outbound[selectedBus.outbound?.busName]?.join(
                    ", "
                  ) || "None"}
                </Typography>
                <Typography variant="body2">
                  Total Fare (Outbound): ${fare.outbound}
                </Typography>
              </>
            )}

            {selectedBus.return && (
              <>
                <Typography variant="body2">
                  Bus: {selectedBus.return.busName}
                </Typography>
                <Typography variant="body2">
                  Route: {selectedBus.return.source} to{" "}
                  {selectedBus.return.destination}
                </Typography>
                <Typography variant="body2">
                  Start Time: {selectedBus.return.startTime}
                </Typography>
                <Typography variant="body2">
                  End Time: {selectedBus.return.endTime}
                </Typography>
                <Typography variant="body2" mt={2}>
                  Selected Seats (Return):{" "}
                  {selectedSeats.return[selectedBus.return?.busName]?.join(
                    ", "
                  ) || "None"}
                </Typography>
                <Typography variant="body2" mt={2}>
                  Total Fare (Return): ${fare.return}
                </Typography>
              </>
            )}

            <Button variant="contained" onClick={confirmBooking}>
              Confirm
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default RoundBus;
