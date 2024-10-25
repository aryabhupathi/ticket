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
  Paper,
} from "@mui/material";
import "jspdf-autotable"
import Login from "../Login/Login";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLocation } from "react-router-dom";
import { bus } from "../data";
import jsPDF from "jspdf";
import Grid from "@mui/material/Grid2";
import { FaBus } from "react-icons/fa6";
import { FaArrowRightLong } from "react-icons/fa6";

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
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const token = JSON.parse(localStorage.getItem("user"));
  const [currentTripType, setCurrentTripType] = useState("");
  const [showMessage, setshowMessage] = useState(false);
  const [downloads, setDownload] = useState(false);
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
      [tripType]: { [bus.busName]: [] },
    }));

    setFare((prevFare) => ({
      ...prevFare,
      [tripType]: 0,
    }));

    setBookingConfirmed((prev) => ({
      ...prev,
      [tripType]: false,
    }));
  };

  
  const handleBookSeats = (tripType) => {
    if (token) {
      // User is logged in, open the booking confirmation modal
      
    setCurrentTripType(tripType);
    setOpenConfirmModal(true);
      setOpenConfirmModal(true);
    } else {
      // User is not logged in, open the login modal
      setLoginModalOpen(true);
    }
  };

  const confirmBooking = () => {
    setBookingConfirmed((prev) => ({
      ...prev,
      [currentTripType]: true,
    }));
    setOpenConfirmModal(false);
    setTimeout(() => {
      setshowMessage(true);
    }, 2000);
    setDownload(true);
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

  const headers = ["Bus Name", "Route", "Seats", "Fare"];
  let tableRows = [];

  Object.keys(selectedSeats).forEach((tripType) => {
    const selectedSeatsForTrip = selectedSeats[tripType];
    const selectedBusDetails = selectedBus[tripType];

    const seats = selectedSeatsForTrip[selectedBusDetails.busName] || [];
    if (seats.length > 0) {
      const fare = selectedBusDetails.fare * seats.length;

      tableRows.push([
        selectedBusDetails.busName,
        `${selectedBusDetails.source} to ${selectedBusDetails.destination}`,
        seats.join(", "),
        `$${fare}`,
      ]);
    }
  });

  doc.autoTable({
    head: [headers],
    body: tableRows,
    startY: 40, 
    theme: "grid",
    styles: {
      halign: "center", 
    },
    columnStyles: {
      0: { cellWidth: 60 }, 
      1: { cellWidth: 80 }, 
      2: { cellWidth: 50 }, 
      3: { cellWidth: 30 }, 
    },
  });

  doc.setFontSize(10);
  doc.text("Thank you for your reservation!", margin, pageHeight - margin);

  doc.save("reservation-details.pdf");
};

  const handleChange = (busIndex, tripType) => {
    const isCurrentlyExpanded = expandedIndex[tripType] === busIndex;
    setExpandedIndex((prevExpandedIndex) => ({
      ...prevExpandedIndex,
      [tripType]: isCurrentlyExpanded ? false : busIndex,
    }));
    if (!isCurrentlyExpanded) {
      const selectedBusDetails =
        tripType === "outbound"
          ? outboundTrips[busIndex]
          : returnTrips[busIndex];
      handleBusSelect(selectedBusDetails, tripType);
    } else {
      setSelectedBus((prev) => ({
        ...prev,
        [tripType]: null,
      }));
      setSelectedSeats((prevSelectedSeats) => ({
        ...prevSelectedSeats,
        [tripType]: {},
      }));
      setFare((prevFare) => ({
        ...prevFare,
        [tripType]: 0,
      }));
      setBookingConfirmed((prev) => ({
        ...prev,
        [tripType]: false,
      }));
    }
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
          <Grid
            item
            size={{ xs: 12 }}
            sx={{ padding: 2, border: "2px solid black" }}
          >
            {outboundTrips.map((bus, index) => (
              <Accordion
                key={index}
                expanded={expandedIndex.outbound === index}
                onChange={() => handleChange(index, "outbound")}
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
                      {bus.busName}
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
                      Route: {bus.source} to {bus.destination}
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
                      Fare per seat: ${bus.fare}
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
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" sx={{ color: "blue", mr: 1 }}>
                        Start Time: {bus.startTime}
                      </Typography>

                      <Typography variant="body2" sx={{ color: "blue" }}>
                        | End Time: {bus.endTime} {}
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
                          {bus.layout.seatConfiguration.map((row, rowIndex) => (
                            <Box
                              key={rowIndex}
                              bgcolor={
                                selectedSeats.outbound[bus.busName]?.includes(
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
                                handleSeatClick(row[seatRow], "outbound")
                              }
                            >
                              {row[seatRow]}
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>

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
          <Grid
            item
            size={{ xs: 12 }}
            sx={{ padding: 2, border: "2px solid black" }}
          >
            {returnTrips.map((bus, index) => (
              <Accordion
                key={index}
                expanded={expandedIndex.return === index}
                onChange={() => handleChange(index, "return")}
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
                    />
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
                      {bus.busName}
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
                      Route: {bus.source} to {bus.destination}
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
                      Fare per seat: ${bus.fare}
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
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" sx={{ color: "blue", mr: 1 }}>
                        Start Time: {bus.startTime}
                      </Typography>

                      <Typography variant="body2" sx={{ color: "blue" }}>
                        | End Time: {bus.endTime} {}
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
                      {selectedSeats.return[bus.busName]?.join(", ") || "None"}
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
                          {bus.layout.seatConfiguration.map((row, rowIndex) => (
                            <Box
                              key={rowIndex}
                              bgcolor={
                                selectedSeats.return[bus.busName]?.includes(
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
                      !bookingConfirmed.return &&
                      !bookingConfirmed.outbound && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 2,
                          }}
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleBookSeats("return")}
                          >
                            Book Tickets
                          </Button>
                        </Box>
                      )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>

          <Login
            open={loginModalOpen}
            onClose={() => setLoginModalOpen(false)}
          />
          
          {downloads && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => downloadPDF()}
                sx={{ mt: 2 }}
              >
                Download PDF
              </Button>
            </Box>
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
              <Typography variant="h6">Confirm Booking</Typography>

              <Box
                mt={2}
                sx={{
                  border: "1px solid lightgray",
                  borderRadius: "4px",
                  padding: 2,
                  mb: 2,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Typography variant="h6"> OutBound Trip:</Typography>
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
                      {selectedSeats.outbound[
                        selectedBus.outbound?.busName
                      ]?.join(", ") || "None"}
                    </Typography>
                    <Typography variant="body2">
                      Total Fare (Outbound): ${fare.outbound}
                    </Typography>
                  </>
                )}

                <Typography variant="h6"> Return Trip:</Typography>
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
                    <Typography variant="body2">
                      Selected Seats (Return):{" "}
                      {selectedSeats.return[selectedBus.return?.busName]?.join(
                        ", "
                      ) || "None"}
                    </Typography>
                    <Typography variant="body2">
                      Total Fare (Return): ${fare.return}
                    </Typography>
                    <Typography
                      variant="body2"
                      mt={2}
                      sx={{ fontWeight: "bold" }}
                    >
                      Final Fare: ${fare.return + fare.outbound}
                    </Typography>
                  </>
                )}
                <Box mt={2}>
                  <Button variant="contained" onClick={confirmBooking}>
                    Confirm
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{ ml: 2 }}
                    onClick={() => setOpenConfirmModal(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Box>
          </Modal>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default RoundBus;
