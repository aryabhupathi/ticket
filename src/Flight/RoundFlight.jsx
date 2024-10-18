
import React, { useState } from "react";
import {
  Box,
  Button,
  Snackbar,
  Typography,
  Alert,
  Modal,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TicketStepper from "./TicketStepper"; // Import the TicketStepper
import { useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import { flight } from "../data"; // Adjust the import based on your data structure

const RoundFliight = () => {
  const location = useLocation();
  const { formData } = location.state;

  // State to manage both outbound and return flights
  const [selectedOutboundSeats, setSelectedOutboundSeats] = useState([]);
  const [selectedReturnSeats, setSelectedReturnSeats] = useState([]);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState(null);
  const [expandedOutbound, setExpandedOutbound] = useState(false);
  const [expandedReturn, setExpandedReturn] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [startBookingOutbound, setStartBookingOutbound] = useState(false);
  const [startBookingReturn, setStartBookingReturn] = useState(false);
  const [totalFare, setTotalFare] = useState(0);
  const [disableStepperOutbound, setDisableStepperOutbound] = useState(false);
  const [disableStepperReturn, setDisableStepperReturn] = useState(false);

  // Filter outbound and return trips based on formData
  const outboundTrips = flight.filter(
    (item) =>
      item.source === formData.source &&
      item.destination === formData.destination
  );

  const returnTrips = flight.filter(
    (item) =>
      item.source === formData.destination &&
      item.destination === formData.source
  );

  const handleCloseSnackbar = () => setShowMessage(false);

  const handleOutboundFlightSelect = (flight) => {
    setSelectedOutboundFlight(flight);
    setSelectedOutboundSeats({ [flight.flightName]: [] });
    setBookingConfirmed(false);
    setStartBookingOutbound(false);
    setDisableStepperOutbound(false); // Reset stepper state
  };

  const handleReturnFlightSelect = (flight) => {
    setSelectedReturnFlight(flight);
    setSelectedReturnSeats({ [flight.flightName]: [] });
    setBookingConfirmed(false);
    setStartBookingReturn(false);
    setDisableStepperReturn(false); // Reset stepper state
  };

  const handleStartOutboundBooking = () => {
    setStartBookingOutbound(true);
  };

  const handleStartReturnBooking = () => {
    setStartBookingReturn(true);
  };

  const handleBookSeats = () => {
    setOpenConfirmModal(true);
  };

  const handleTotalFareUpdate = (fare, isReturn = false) => {
    if (isReturn) {
      setTotalFare((prev) => prev + fare);
    } else {
      setTotalFare(fare);
    }
  };

  const confirmBooking = () => {
    setBookingConfirmed(true);
    setOpenConfirmModal(false);
    setStartBookingOutbound(false);
    setStartBookingReturn(false);
    setDisableStepperOutbound(true); // Disable stepper after booking
    setDisableStepperReturn(true); // Disable stepper after booking
    setTimeout(() => {
      setShowMessage(true);
    }, 2000);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    doc.setFontSize(22);
    doc.text("Reservation Details", margin, margin);
    doc.setFontSize(12);
    doc.text(
      `Date: ${new Date().toLocaleDateString()}`,
      pageWidth - margin - 50,
      margin
    );

    const headerY = 40;
    doc.setFontSize(12);
    const headers = ["Flight Name", "Route", "Start Time", "Seats", "Fare"];
    const columnWidths = [40, 40, 40, 30, 20];

    headers.forEach((header, index) => {
      doc.text(
        header,
        margin + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
        headerY
      );
    });

    let y = headerY + 10;

    // Outbound Flight Details
    if (selectedOutboundFlight) {
      const seats =
        selectedOutboundSeats[selectedOutboundFlight.flightName] || [];
      if (seats.length > 0) {
        const fare = selectedOutboundFlight.categories[0].fare * seats.length;
        doc.text(selectedOutboundFlight.flightName, margin, y);
        doc.text(
          `${selectedOutboundFlight.source} to ${selectedOutboundFlight.destination}`,
          margin + columnWidths[0],
          y
        );
        doc.text(
          selectedOutboundFlight.startTime,
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
      }
    }

    // Return Flight Details
    if (selectedReturnFlight) {
      const seats = selectedReturnSeats[selectedReturnFlight.flightName] || [];
      if (seats.length > 0) {
        const fare = selectedReturnFlight.categories[0].fare * seats.length;
        doc.text(selectedReturnFlight.flightName, margin, y);
        doc.text(
          `${selectedReturnFlight.source} to ${selectedReturnFlight.destination}`,
          margin + columnWidths[0],
          y
        );
        doc.text(
          selectedReturnFlight.startTime,
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
      }
    }

    doc.setFontSize(10);
    doc.text("Thank you for your reservation!", margin, pageHeight - margin);
    doc.save("reservation-details.pdf");
  };

  const handleOutboundChange = (flightIndex) => {
    setExpandedOutbound(expandedOutbound === flightIndex ? false : flightIndex);
    handleOutboundFlightSelect(outboundTrips[flightIndex]);
  };

  const handleReturnChange = (flightIndex) => {
    setExpandedReturn(expandedReturn === flightIndex ? false : flightIndex);
    handleReturnFlightSelect(returnTrips[flightIndex]);
  };

  return (
    <Box
      sx={{
        padding: 2,
        backgroundImage:
          "url(../../flight.webp)" /* Replace with your image path */,
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
          background: "linear-gradient(to right, red, green, blue)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: "center",
          margin: 0,
        }}
      >
        Available Flights from {formData.source} to {formData.destination}
      </Typography>

      {formData.tripType === "round" && (
        <>
          <Grid xs={12} sm={9} sx={{ padding: 2 }}>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              Outbound Flights
            </Typography>
            {outboundTrips.length > 0 ? (
              outboundTrips.map((details, index) => (
                <Accordion
                  key={index}
                  expanded={expandedOutbound === index}
                  onChange={() => handleOutboundChange(index)}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography
                      variant="h6"
                      sx={{ color: "blue", fontWeight: "bold" }}
                    >
                      {details.flightName}
                      <span style={{ color: "gray" }}> &#x2794; </span>{" "}
                    </Typography>

                    <Typography variant="body1" sx={{ color: "green", ml: 2 }}>
                      Route: {details.source} to {details.destination}
                      <span style={{ color: "gray" }}> &#x2794; </span>{" "}
                    </Typography>

                    <Typography variant="body1" sx={{ color: "orange", ml: 2 }}>
                      Fare per seat: ${details.baseFare}
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Box>
                      <Box
                        sx={{
                          border: "1px solid lightgray",
                          borderRadius: "4px",
                          padding: 2,
                          mb: 2,
                          backgroundColor: "#f9f9f9",
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
                            | End Time: {details.endTime}
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
                          sx={{ color: "green", mt: 1 }}
                        >
                          Base Price: ${details.baseFare}
                        </Typography>

                        <Button onClick={handleStartOutboundBooking}>
                          Proceed
                        </Button>
                        {startBookingOutbound && !bookingConfirmed && (
                          <TicketStepper
                            selectedFlight={selectedOutboundFlight}
                            seatLayout={selectedOutboundFlight?.layout}
                            seatCategories={
                              selectedOutboundFlight?.seatCategories
                            }
                            selectedSeats={selectedOutboundSeats}
                            onTotalFare={(fare) =>
                              handleTotalFareUpdate(fare, false)
                            }
                            setSelectedSeats={setSelectedOutboundSeats}
                            disabled={disableStepperOutbound} // Disable stepper if booked
                          />
                        )}
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        {selectedOutboundSeats[details.flightName]?.length >
                          0 &&
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

                        {bookingConfirmed && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={downloadPDF}
                            sx={{ mt: 2 }}
                          >
                            Download Ticket
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Alert severity="error">No outbound flights found!</Alert>
            )}
          </Grid>

          <Grid xs={12} sm={9} sx={{ padding: 2 }}>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              Return Flights
            </Typography>
            {returnTrips.length > 0 ? (
              returnTrips.map((details, index) => (
                <Accordion
                  key={index}
                  expanded={expandedReturn === index}
                  onChange={() => handleReturnChange(index)}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography
                      variant="h6"
                      sx={{ color: "blue", fontWeight: "bold" }}
                    >
                      {details.flightName}
                      <span style={{ color: "gray" }}> &#x2794; </span>{" "}
                    </Typography>

                    <Typography variant="body1" sx={{ color: "green", ml: 2 }}>
                      Route: {details.source} to {details.destination}
                      <span style={{ color: "gray" }}> &#x2794; </span>{" "}
                    </Typography>

                    <Typography variant="body1" sx={{ color: "orange", ml: 2 }}>
                      Fare per seat: ${details.baseFare}
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Box>
                      <Box
                        sx={{
                          border: "1px solid lightgray",
                          borderRadius: "4px",
                          padding: 2,
                          mb: 2,
                          backgroundColor: "#f9f9f9",
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
                            | End Time: {details.endTime}
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
                          sx={{ color: "green", mt: 1 }}
                        >
                          Base Price: ${details.baseFare}
                        </Typography>

                        <Button onClick={handleStartReturnBooking}>
                          Proceed
                        </Button>
                        {startBookingReturn && !bookingConfirmed && (
                          <TicketStepper
                            selectedFlight={selectedReturnFlight}
                            seatLayout={selectedReturnFlight?.layout}
                            seatCategories={
                              selectedReturnFlight?.seatCategories
                            }
                            selectedSeats={selectedReturnSeats}
                            onTotalFare={(fare) =>
                              handleTotalFareUpdate(fare, true)
                            }
                            setSelectedSeats={setSelectedReturnSeats}
                            disabled={disableStepperReturn} // Disable stepper if booked
                          />
                        )}
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        {selectedReturnSeats[details.flightName]?.length > 0 &&
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

                        {bookingConfirmed && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={downloadPDF}
                            sx={{ mt: 2 }}
                          >
                            Download Ticket
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Alert severity="error">No return flights found!</Alert>
            )}
          </Grid>
        </>
      )}

      {/* Confirmation Modal */}
      <Modal open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h6">Confirm Booking?</Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={confirmBooking}
          >
            Confirm
          </Button>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={showMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Booking Confirmed!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RoundFliight;
