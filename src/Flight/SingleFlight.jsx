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
import Grid from "@mui/material/Grid2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TicketStepper from "./TicketStepper";
import { useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import { flight } from "../data";
import { FaArrowRightLong } from "react-icons/fa6";
import { MdFlight } from "react-icons/md";
import "jspdf-autotable";
import Login from "../Login/Login";

const SingleFlight = () => {
  const location = useLocation();
  const { formData } = location.state;
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [startBooking, setStartBooking] = useState(false);
  const [totalFare, setTotalFare] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const token = JSON.parse(localStorage.getItem("user"));
  const outboundTrips = flight.filter(
    (item) =>
      item.source === formData.source &&
      item.destination === formData.destination
  );

  const handleCloseSnackbar = () => setShowMessage(false);

  const handleFlightSelect = (flight) => {
    setSelectedFlight(flight);
    setSelectedSeats({ [flight.flightName]: [] });
    setBookingConfirmed(false);
    setStartBooking(false);
  };

  const handleStartBooking = () => {
    if (token) {
      setStartBooking(true);
    } else {
      setLoginModalOpen(true);
    }
  };
  const handleTotalFareUpdate = (fare) => {
    setTotalFare(fare);
  };

  const confirmBooking = () => {
    setBookingConfirmed(true);
    setOpenConfirmModal(false);
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

    const tableRows = Object.keys(selectedSeats).reduce((rows, flightName) => {
      const seats = selectedSeats[flightName];
      if (seats.length > 0) {
        const selectedFlightDetails = outboundTrips.find(
          (flight) => flight.flightName === flightName
        );
        if (selectedFlightDetails) {
          const fare = selectedFlightDetails.categories[0].fare * seats.length;
          rows.push([
            flightName,
            `${selectedFlightDetails.source} to ${selectedFlightDetails.destination}`,
            selectedFlightDetails.startTime,
            seats.join(", "),
            `$${fare}`,
          ]);
        }
      }
      return rows;
    }, []);

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

  const handleChange = (flightIndex) => {
    setExpanded(expanded === flightIndex ? false : flightIndex);
    handleFlightSelect(outboundTrips[flightIndex]);
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
          <Grid
            item
            size={{ xs: 12 }}
            sx={{ padding: 2, border: "2px solid black" }}
          >
            {outboundTrips.length > 0 ? (
              outboundTrips.map((details, index) => (
                <Accordion
                  key={index}
                  expanded={expanded === index}
                  onChange={() => handleChange(index)}
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
                      sx={{ alignContent: "center", justifyContent: "center" }}
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
                      sx={{ alignContent: "center", justifyContent: "center" }}
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
                      sx={{ alignContent: "center", justifyContent: "center" }}
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
                        sx={{ color: "orange", mt: 1 }}
                      >
                        Seats Available: {details.noOfSeatsAvailable}
                      </Typography>

                      <Button onClick={handleStartBooking}>Proceed</Button>
                      {startBooking && !bookingConfirmed && (
                        <TicketStepper
                          selectedFlight={selectedFlight}
                          seatLayout={selectedFlight?.layout}
                          seatCategories={selectedFlight?.seatCategories}
                          onTotalFare={handleTotalFareUpdate}
                          setSelectedSeats={setSelectedSeats}
                        />
                      )}
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "center" }}>
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
              <Alert severity="error">No flights found!</Alert>
            )}
          </Grid>
          <Login
            open={loginModalOpen}
            onClose={() => setLoginModalOpen(false)}
          />
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

export default SingleFlight;
