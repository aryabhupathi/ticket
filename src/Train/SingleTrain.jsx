import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Snackbar,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Accordion,
  AccordionSummary,
  Paper,
  AccordionDetails,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import jsPDF from "jspdf";
import { useLocation } from "react-router-dom";
import { train } from "../data";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { FaTrain } from "react-icons/fa6";
import { FaArrowRightLong } from "react-icons/fa6";
import "jspdf-autotable";

const SingleTrain = () => {
  const location = useLocation();
  const { formData } = location.state;
  const [outboundPassengerCount, setOutboundPassengerCount] = useState({});
  const [outboundReservations, setOutboundReservations] = useState([]);
  const [outboundTotalFare, setOutboundTotalFare] = useState(0);
  const [outboundSnackbarOpen, setOutboundSnackbarOpen] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [reservedCoaches, setReservedCoaches] = useState({});

  useEffect(() => {
    const initialOutboundCounts = {};
    train.forEach((train) => {
      train.coaches.forEach((coach) => {
        initialOutboundCounts[`${train.trainName}-${coach.coachName}`] = 0;
      });
    });
    setOutboundPassengerCount(initialOutboundCounts);
  }, []);

  const trips = {
    outbound: train.filter(
      (item) =>
        item.source === formData.source &&
        item.destination === formData.destination
    ),
  };

  const incrementCount = (trainName, coachName, fare, noOfSeatsAvailable) => {
    setOutboundPassengerCount((prev) => {
      const currentCount = prev[`${trainName}-${coachName}`] || 0;
      if (currentCount < noOfSeatsAvailable) {
        const newCount = currentCount + 1;
        setOutboundTotalFare((prevTotal) => prevTotal + fare);
        return {
          ...prev,
          [`${trainName}-${coachName}`]: newCount,
        };
      }
      return prev;
    });
  };

  const decrementCount = (trainName, coachName, fare) => {
    setOutboundPassengerCount((prev) => {
      const currentCount = prev[`${trainName}-${coachName}`] || 0;
      const newCount = Math.max(currentCount - 1, 0);
      setOutboundTotalFare((prevTotal) =>
        currentCount > 0 ? prevTotal - fare : prevTotal
      );
      return {
        ...prev,
        [`${trainName}-${coachName}`]: newCount,
      };
    });
  };

  const handleReserve = (train) => {
    const passengerCount = outboundPassengerCount;
    const newReservations = {};
    const newReservedCoaches = { ...reservedCoaches };

    train.coaches.forEach((coach) => {
      const count =
        passengerCount[`${train.trainName}-${coach.coachName}`] || 0;
      if (count > 0) {
        const totalFareForCoach = count * coach.fare;
        newReservations[`${train.trainName}-${coach.coachName}`] = {
          trainName: train.trainName,
          coachName: coach.coachName,
          source: train.source,
          destination: train.destination,
          start: train.startTime,
          end: train.endTime,
          count,
          totalFareForCoach,
        };

        newReservedCoaches[`${train.trainName}-${coach.coachName}`] = true;
      }
    });

    if (Object.keys(newReservations).length > 0) {
      setOutboundReservations((prevReservations) => [
        ...prevReservations,
        ...Object.values(newReservations),
      ]);
      setReservedCoaches(newReservedCoaches);
      setOutboundSnackbarOpen(true);
      setIsModalOpen(true);
    } else {
      alert("Please select at least 1 passenger.");
    }
  };
  console.log(outboundReservations, "ooooooooooooooooooo");
  const handleCloseSnackbar = () => {
    setOutboundSnackbarOpen(false);
  };

  const handleConfirmBooking = () => {
    setIsModalOpen(false);
    setShowDownloadButton(true);
    setSuccessSnackbarOpen(true);
    setTimeout(() => {
      setSuccessSnackbarOpen(false);
    }, 2000);
  };

  const downloadPDF = () => {
    const reservationsToDownload = [...outboundReservations];
    if (reservationsToDownload.length === 0) return;

    const doc = new jsPDF();
    doc.text("Reservation Details", 14, 10);
    const tableHeaders = [
      "Train",
      "Boarding Time",
      "Coach",
      "Passengers",
      "Total Fare",
    ];
    const tableRows = reservationsToDownload.map((reservation) => [
      reservation.trainName,
      reservation.start,
      reservation.coachName,
      reservation.count,
      `$${reservation.totalFareForCoach}`,
    ]);

    doc.autoTable({
      head: [tableHeaders],
      body: tableRows,
      startY: 20,
      theme: "grid",
    });

    doc.save("reservation-details.pdf");
    resetState();
  };

  const resetState = () => {
    setOutboundPassengerCount({});
    setOutboundReservations([]);
    setOutboundTotalFare(0);
    setReservedCoaches({});
  };

  const renderTrip = (tripType) => {
    return trips[tripType].map((train, index) => (
      <Accordion key={index}>
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
            <FaTrain sx={{ ml: 2, fontSize: { xs: "24px", sm: "28px" } }} /> {}
          </Box>

          <Box sx={{ alignContent: "center", justifyContent: "center" }}>
            <Typography
              variant="h6"
              sx={{
                color: "blue",
                fontWeight: "bold",
                ml: 2,
                mb: { xs: 1, sm: 0 },
              }}
            >
              {train.trainName}
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

          <Box sx={{ alignContent: "center", justifyContent: "center" }}>
            <Typography
              variant="body1"
              sx={{
                color: "green",
                ml: 2,
                mb: { xs: 1, sm: 0 },
              }}
            >
              Route: {train.source} to {train.destination}
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
          <Box sx={{ alignContent: "center", justifyContent: "center" }}>
            <Typography
              variant="body1"
              sx={{
                color: "orange",
                ml: 2,
              }}
            >
              Time: {train.startTime}
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
            <Box sx={{ width: "100%", mb: 2 }}>
              <Typography variant="body1" sx={{ color: "red", ml: 2 }}>
                Route: {train.source} to {train.destination}
              </Typography>
              <Typography variant="body1" sx={{ color: "green", ml: 2 }}>
                Timings: {train.startTime} -- {train.endTime}
              </Typography>
              <Typography variant="body1" sx={{ color: "orange", ml: 2 }}>
                Stops: {train.stops.join(", ")}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {train.coaches.map((coach, coachIndex) => (
                <Grid item xs={12} key={coachIndex} sx={{display:'flex', justifyContent:'center'}}>
                  <Box
                    sx={{
                      backgroundColor: "#f0f4ff",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100px",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: "#333", fontWeight: "bold" }}
                    >
                      {coach.coachName}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#555" }}>
                      Available Seats: {coach.noOfSeatsAvailable}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#555" }}>
                      Fare: ${coach.fare}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 2,
                        border: "1px solid #ddd",
                        padding: "4px",
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                      }}
                    >
                      <Button
                        onClick={() =>
                          incrementCount(
                            train.trainName,
                            coach.coachName,
                            coach.fare,
                            coach.noOfSeatsAvailable
                          )
                        }
                        disabled={
                          reservedCoaches[
                            `${train.trainName}-${coach.coachName}`
                          ]
                        }
                        sx={{
                          minWidth: "26px",
                          height: "20px",
                          padding: "0",
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </Button>

                      <Typography
                        variant="body1"
                        sx={{
                          mx: 2,
                          color: "#333",
                          textAlign: "center",
                          width: "30px",
                        }}
                      >
                        {
                          outboundPassengerCount[
                            `${train.trainName}-${coach.coachName}`
                          ]
                        }
                      </Typography>

                      <Button
                        onClick={() =>
                          decrementCount(
                            train.trainName,
                            coach.coachName,
                            coach.fare
                          )
                        }
                        disabled={
                          reservedCoaches[
                            `${train.trainName}-${coach.coachName}`
                          ]
                        }
                        sx={{
                          minWidth: "26px",
                          height: "20px",
                          padding: "0",
                        }}
                      >
                        <RemoveIcon fontSize="small" />
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" align="center">
                Total Fare: ${outboundTotalFare}
              </Typography>
            </Box>
            {showDownloadButton ? (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={downloadPDF}
                  sx={{ mt: 2 }}
                >
                  Download
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleReserve(train)}
                  sx={{ mt: 2 }}
                >
                  Reserve
                </Button>
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    ));
  };

  return (
    <Grid
      container
      justifyContent="center"
      sx={{
        minHeight: "100vh",
        backgroundImage: "url(../../train1.webp)",
        backgroundSize: "contain",
        backgroundRepeat: "repeat",
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
                Available trains from {formData.source} to{" "}
                {formData.destination}
              </Typography>
            </Paper>
          </Box>
          <Grid sx={{ padding: 2, border: "2px solid black" }}>
            {renderTrip("outbound")}

            <Snackbar
              open={successSnackbarOpen}
              message="Booking confirmed successfully!"
              autoHideDuration={2000}
            />
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <DialogTitle>
                <Typography variant="h6" gutterBottom>
                  Confirm Booking
                </Typography>
              </DialogTitle>
              <DialogContent>
                {outboundReservations.length > 0 ? (
                  outboundReservations.map((reservation, index) => (
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
                        Train {reservation.trainName}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Route: {reservation.source} to {reservation.destination}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Time: {reservation.start} -- {reservation.end}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Coach: {reservation.coachName}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Passengers: {reservation.count}
                      </Typography>

                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        Total Fare: ${reservation.totalFareForCoach}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography>No reservations found.</Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  sx={{ mt: 2, ml: 2 }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={handleConfirmBooking}
                >
                  Confirm
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SingleTrain;
