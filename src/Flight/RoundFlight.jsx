/* eslint-disable no-unused-vars */
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
  Paper,
} from "@mui/material";
import Login from "../Login/Login";
import "jspdf-autotable";

import Grid from "@mui/material/Grid2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TicketStepper from "./TicketStepper";
import { useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import { flight } from "../data";
import { FaArrowRightLong } from "react-icons/fa6";
import { MdFlight } from "react-icons/md";

const RoundFlight = () => {
  const location = useLocation();
  const { formData } = location.state;
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const token = JSON.parse(localStorage.getItem("user"));
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
    setDisableStepperOutbound(false);
  };

  const handleReturnFlightSelect = (flight) => {
    setSelectedReturnFlight(flight);
    setSelectedReturnSeats({ [flight.flightName]: [] });
    setBookingConfirmed(false);
    setStartBookingReturn(false);
    setDisableStepperReturn(false);
  };

  const handleStartOutboundBooking = () => {
    if (token) {
      setStartBookingOutbound(true);
      setOpenConfirmModal(true);
    } else {
      setLoginModalOpen(true);
    }
  };
  const handleStartReturnBooking = () => {
    if (token) {
      setStartBookingReturn(true);
      setOpenConfirmModal(true);
    } else {
      setLoginModalOpen(true);
    }
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
    setDisableStepperOutbound(true);
    setDisableStepperReturn(true);
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

    const headers = ["Flight Name", "Route", "Start Time", "Seats", "Fare"];

    let tableRows = [];

    if (selectedOutboundFlight) {
      const outboundSeats =
        selectedOutboundSeats[selectedOutboundFlight.flightName] || [];
      if (outboundSeats.length > 0) {
        const outboundFare =
          selectedOutboundFlight.categories[0].fare * outboundSeats.length;
        tableRows.push([
          selectedOutboundFlight.flightName,
          `${selectedOutboundFlight.source} to ${selectedOutboundFlight.destination}`,
          selectedOutboundFlight.startTime,
          outboundSeats.join(", "),
          `$${outboundFare}`,
        ]);
      }
    }

    if (selectedReturnFlight) {
      const returnSeats =
        selectedReturnSeats[selectedReturnFlight.flightName] || [];
      if (returnSeats.length > 0) {
        const returnFare =
          selectedReturnFlight.categories[0].fare * returnSeats.length;
        tableRows.push([
          selectedReturnFlight.flightName,
          `${selectedReturnFlight.source} to ${selectedReturnFlight.destination}`,
          selectedReturnFlight.startTime,
          returnSeats.join(", "),
          `$${returnFare}`,
        ]);
      }
    }

    doc.autoTable({
      head: [headers],
      body: tableRows,
      startY: 40,
      theme: "grid",
      styles: {
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20 },
      },
    });

    doc.setFontSize(10);
    doc.text("Thank you for your reservation!", margin, pageHeight - margin);

    doc.save("flight-reservation-details.pdf");
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
    <Grid
      container
      justifyContent="center"
      sx={{
        minHeight: "100vh",
        backgroundImage: "url(../../flight.webp)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
      <Grid item size={{ xs: 12, sm: 10 }} mt={3}>
        <Grid item size={{ xs: 12 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Paper
              elevation={4}
              sx={{
                backgroundColor: "rgba(245, 244, 181, 0.5)",
                padding: "8px 16px",
                borderRadius: 2,
                border: "2px solid orange",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                display: "inline-block",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.3)",
                },
              }}
              mb={2}
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
                Available Flights from {formData.source} to{" "}
                {formData.destination}
              </Typography>
            </Paper>
          </Box>

          <Grid xs={12} sm={9} sx={{ padding: 2 }}>
            <Typography
              variant="h5"
              sx={{
                background: "linear-gradient(to right, green, red, blue)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 1,
              }}
            >
              Outbound Trip
            </Typography>
            {outboundTrips.length > 0 ? (
              outboundTrips.map((details, index) => (
                <Accordion
                  key={index}
                  expanded={expandedOutbound === index}
                  onChange={() => handleOutboundChange(index)}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: "center",
                      padding: "8px 16px",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: { xs: 1, sm: 0 },
                      }}
                    >
                      <MdFlight
                        sx={{ ml: 2, fontSize: { xs: "24px", sm: "28px" } }}
                      />{" "}
                      {}
                    </Box>

                    <Box
                      sx={{
                        alignContent: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: "blue",
                          fontWeight: "bold",
                          ml: 2,
                          mb: { xs: 1, sm: 0 },
                        }}
                      >
                        {details.flightName}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: { xs: "none", sm: "flex" },
                        alignItems: "center",
                        justifyContent: "center",
                        ml: 1,
                      }}
                    >
                      <FaArrowRightLong />
                    </Box>

                    <Box
                      sx={{
                        alignContent: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: "green",
                          ml: 2,
                          mb: { xs: 1, sm: 0 },
                        }}
                      >
                        Route: {details.source} to {details.destination}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: { xs: "none", sm: "flex" },
                        alignItems: "center",
                        justifyContent: "center",
                        ml: 1,
                      }}
                    >
                      <FaArrowRightLong />
                    </Box>
                    <Box
                      sx={{
                        alignContent: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: "orange",
                          ml: 2,
                        }}
                      >
                        Fare per seat: ${details.baseFare}
                      </Typography>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
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
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                        }}
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
                        sx={{ color: "orange", mt: 1 }}
                      >
                        Seats Available: {details.noOfSeatsAvailable}
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
                          disabled={disableStepperOutbound}
                        />
                      )}
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      {selectedOutboundSeats[details.flightName]?.length > 0 &&
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
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Alert severity="error">No outbound flights found!</Alert>
            )}
          </Grid>

          <Grid xs={12} sm={9} sx={{ padding: 2 }}>
            <Typography
              variant="h5"
              sx={{
                background: "linear-gradient(to right, green, red, blue)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 1,
              }}
            >
              Return Trip
            </Typography>
            {returnTrips.length > 0 ? (
              returnTrips.map((details, index) => (
                <Accordion
                  key={index}
                  expanded={expandedReturn === index}
                  onChange={() => handleReturnChange(index)}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: "center",
                      padding: "8px 16px",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: { xs: 1, sm: 0 },
                      }}
                    >
                      <MdFlight
                        sx={{ ml: 2, fontSize: { xs: "24px", sm: "28px" } }}
                      />{" "}
                      {}
                    </Box>

                    <Box
                      sx={{
                        alignContent: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: "blue",
                          fontWeight: "bold",
                          ml: 2,
                          mb: { xs: 1, sm: 0 },
                        }}
                      >
                        {details.flightName}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: { xs: "none", sm: "flex" },
                        alignItems: "center",
                        justifyContent: "center",
                        ml: 1,
                      }}
                    >
                      <FaArrowRightLong />
                    </Box>

                    <Box
                      sx={{
                        alignContent: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: "green",
                          ml: 2,
                          mb: { xs: 1, sm: 0 },
                        }}
                      >
                        Route: {details.source} to {details.destination}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: { xs: "none", sm: "flex" },
                        alignItems: "center",
                        justifyContent: "center",
                        ml: 1,
                      }}
                    >
                      <FaArrowRightLong />
                    </Box>
                    <Box
                      sx={{
                        alignContent: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: "orange",
                          ml: 2,
                        }}
                      >
                        Fare per seat: ${details.baseFare}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
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
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                        }}
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
                        sx={{ color: "orange", mt: 1 }}
                      >
                        Seats Available: {details.noOfSeatsAvailable}
                      </Typography>

                      <Button onClick={handleStartReturnBooking}>
                        Proceed
                      </Button>
                      {startBookingReturn && !bookingConfirmed && (
                        <TicketStepper
                          selectedFlight={selectedReturnFlight}
                          seatLayout={selectedReturnFlight?.layout}
                          seatCategories={selectedReturnFlight?.seatCategories}
                          selectedSeats={selectedReturnSeats}
                          onTotalFare={(fare) =>
                            handleTotalFareUpdate(fare, true)
                          }
                          setSelectedSeats={setSelectedReturnSeats}
                          disabled={disableStepperReturn}
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
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Alert severity="error">No return flights found!</Alert>
            )}
          </Grid>

          <Modal
            open={openConfirmModal}
            onClose={() => setOpenConfirmModal(false)}
          >
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

          {}

          <Login
            open={loginModalOpen}
            onClose={() => setLoginModalOpen(false)}
          />
          <Snackbar
            open={showMessage}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
          >
            <Alert onClose={handleCloseSnackbar} severity="success">
              Booking Confirmed!
            </Alert>
          </Snackbar>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default RoundFlight;
