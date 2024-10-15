import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Snackbar,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import jsPDF from "jspdf";
import { useLocation } from "react-router-dom";
import { train } from "../data";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

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
    doc.text("Reservation Details", 20, 20);

    reservationsToDownload.forEach((reservation, index) => {
      doc.text(`Reservation ${index + 1}`, 20, 30 + index * 20);
      doc.text(`Train: ${reservation.trainName}`, 20, 40 + index * 20);
      doc.text(`Coach: ${reservation.coachName}`, 20, 50 + index * 20);
      doc.text(`Passengers: ${reservation.count}`, 20, 60 + index * 20);
      doc.text(
        `Total Fare: $${reservation.totalFareForCoach}`,
        20,
        70 + index * 20
      );
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
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ color: "blue", fontWeight: "bold" }}>
            {train.trainName}
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
                <Grid item xs={12} sm={6} md={2} key={coachIndex}>
                  <Box
                    sx={{
                      backgroundColor: "#f0f4ff", // Light blue background for the box
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "150px", // Set a fixed height to ensure responsiveness
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Slight box shadow for better elevation
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
                        alignItems: "center", // Aligns items in a straight line vertically
                        mt: 2,
                        border: "1px solid #ddd",
                        padding: "4px",
                        borderRadius: "8px",
                        backgroundColor: "#fff", // Light background for the buttons area
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
                          minWidth: "36px",
                          height: "30px", // Reduced height for the button
                          padding: "0", // Remove padding for a more compact button
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
                          width: "40px",
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
                          minWidth: "36px",
                          height: "30px", // Reduced height for the button
                          padding: "0", // Remove padding for a more compact button
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
              <Box sx={{display:'flex', justifyContent:'center'}}>
              <Button
                variant="contained"
                color="primary"
                onClick={downloadPDF}
                sx={{ mt: 2 }}
              >
                Download
              </Button></Box>
            ) : (<Box sx={{display:'flex', justifyContent:'center'}}>
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
    <Box
      sx={{
        backgroundImage:"url(../../train.jpg)", /* Replace with your image path */
  backgroundSize: 'cover', /* Ensure the image covers the entire area */
  backgroundRepeat: 'no-repeat', /* Prevent repeating the image */
  backgroundPosition: 'center', /* Center the image */
  backgroundAttachment: 'fixed', /* Make the background fixed */
  minHeight: '100vh' /* Ensure the container is at least the height of the viewport */
      }}
    >
      {" "}
      <Typography
        variant="h5"
        sx={{
          background:
            "linear-gradient(to right, violet, indigo, blue, green, yellow, orange, red)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: "center",
          margin: 0,
        paddingTop:2
        }}
      >
        Available Trains from {formData.source} to {formData.destination}
      </Typography>
      <Box>
        {renderTrip("outbound")}

        <Snackbar
          open={outboundSnackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          message="Tickets reserved successfully!"
        />
        <Snackbar
          open={successSnackbarOpen}
          message="Booking confirmed successfully!"
          autoHideDuration={2000}
        />
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <DialogTitle>Confirm Outbound Booking</DialogTitle>
          <DialogContent>
            {outboundReservations.length > 0 ? (
              outboundReservations.map((reservation, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="h6">{reservation.trainName}</Typography>
                  <Typography>Coach: {reservation.coachName}</Typography>
                  <Typography>Passengers: {reservation.count}</Typography>
                  <Typography>
                    Total Fare: ${reservation.totalFareForCoach}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography>No reservations found.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmBooking}>Confirm</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default SingleTrain;
