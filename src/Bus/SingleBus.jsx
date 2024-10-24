import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,
  Alert,
  Paper,
  Snackbar,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLocation } from "react-router-dom";
import { bus } from "../data"; 
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaArrowRightLong } from "react-icons/fa6";
import { FaBus } from "react-icons/fa6";
const SingleBus = () => {
  const location = useLocation();
  const { formData } = location.state;
  const [selectedSeats, setSelectedSeats] = useState({});
  const [fare, setFare] = useState(0);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [showMessage, setshowMessage] = useState(false);
  const outboundTrips = bus.filter(
    (item) =>
      item.source === formData.source &&
      item.destination === formData.destination
  );

  const handleSeatClick = (seat) => {
    if (!selectedBus || bookingConfirmed) return;

    setSelectedSeats((prevSelectedSeats) => {
      const currentSelection = prevSelectedSeats[selectedBus.busName] || [];
      const isSelected = currentSelection.includes(seat);
      const updatedSelection = isSelected
        ? currentSelection.filter((s) => s !== seat)
        : [...currentSelection, seat];

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
      setSelectedSeats((prevSelectedSeats) => ({
        ...prevSelectedSeats,
        [selectedBus.busName]: [],
      }));
    }

    setSelectedBus(bus);
    setSelectedSeats({ [bus.busName]: [] });
    setFare(0);
    setShowDownloadButton(false);
    setBookingConfirmed(false);
  };

  const handleBookSeats = () => {
    setOpenConfirmModal(true);
  };

  const confirmBooking = () => {
    setBookingConfirmed(true);
    setOpenConfirmModal(false);
    setTimeout(() => {
      setshowMessage(true);
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
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, margin);
  const headers = ["Bus Name", "Route", "Start Time", "Seats", "Fare"];
  const tableRows = Object.keys(selectedSeats).reduce((rows, busName) => {
    const seats = selectedSeats[busName];
    if (seats.length > 0) {
      const selectedBusDetails = outboundTrips.find(
        (bus) => bus.busName === busName
      );
      if (selectedBusDetails) {
        const fare = selectedBusDetails.fare * seats.length;
        rows.push([
          busName,
          `${selectedBusDetails.source} to ${selectedBusDetails.destination}`,
          selectedBusDetails.startTime,
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
  doc.save("bus-reservation-details.pdf");
};

  const handleChange = (busIndex) => {
    setExpanded(expanded === busIndex ? false : busIndex);
    handleBusSelect(outboundTrips[busIndex]);
  };

  return (
    <Grid
      container
      justifyContent="center"
      sx={{
        minHeight: "100vh",
        backgroundImage: "url(../../bus.webp)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundPosition: 'center'
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
                Available Buses from {formData.source} to {formData.destination}
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
                      <FaBus
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
                        {details.busName}
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
                        Fare per seat: ${details.fare}
                      </Typography>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
                    {}
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

                        <Box
                          display="flex"
                          flexDirection="column"
                          mt={2}
                          sx={{ maxHeight: "300px", overflowY: "auto" }}
                        >
                          {[0, 1, 2, 3].map((seatRow) => (
                            <Box
                              key={seatRow}
                              display="flex"
                              flexDirection="row"
                              justifyContent="space-around"
                              mb={2}
                              mx={1}
                            >
                              {details.layout.seatConfiguration.map(
                                (row, rowIndex) => (
                                  <Box
                                    key={rowIndex}
                                    bgcolor={
                                      selectedSeats[details.busName]?.includes(
                                        row[seatRow]
                                      )
                                        ? "lightgreen"
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
                                      fontSize: { xs: "0.8rem", sm: "1rem" },
                                      transition: "background-color 0.3s",
                                      "&:hover": {
                                        backgroundColor: !bookingConfirmed
                                          ? "lightyellow"
                                          : "inherit",
                                      },
                                      padding: "4px",
                                      margin: "0 2px",
                                    }}
                                    onClick={() =>
                                      handleSeatClick(row[seatRow])
                                    }
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
                    {}
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography variant="h6">
                No buses available for this route.
              </Typography>
            )}
          </Grid>
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
                        border: "1px solid lightgray",
                        borderRadius: "4px",
                        padding: 2,
                        mb: 2,
                        backgroundColor: "#f9f9f9",
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

              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={confirmBooking}
              >
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
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SingleBus;