/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { jsPDF } from "jspdf";
import { useLocation } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { train } from "../data";
import { FaTrain } from "react-icons/fa6";
import { FaArrowRightLong } from "react-icons/fa6";
import "jspdf-autotable";
import Login from "../Login/Login";
const RoundTrain = () => {
  const location = useLocation();
  const { formData } = location.state;
  const [outboundPassengerCount, setOutboundPassengerCount] = useState({});
  const [outboundTotalFare, setOutboundTotalFare] = useState(0);
  const [returnPassengerCount, setReturnPassengerCount] = useState({});
  const [returnTotalFare, setReturnTotalFare] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [modalReservations, setModalReservations] = useState({
    outboundRes: [],
    returnRes: [],
    totalFare: 0,
  });
  const [isReserved, setIsReserved] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const token = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    const initialOutboundCounts = {};
    const initialReturnCounts = {};
    train.forEach((train) => {
      train.coaches.forEach((coach) => {
        initialOutboundCounts[`${train.trainName}-${coach.coachName}`] = 0;
        initialReturnCounts[`${train.trainName}-${coach.coachName}`] = 0;
      });
    });
    setOutboundPassengerCount(initialOutboundCounts);
    setReturnPassengerCount(initialReturnCounts);
  }, []);

  const trips = {
    outbound: train.filter(
      (item) =>
        item.source === formData.source &&
        item.destination === formData.destination
    ),
    return: train.filter(
      (item) =>
        item.source === formData.destination &&
        item.destination === formData.source
    ),
  };

  const incrementCount = (type, trainName, coachName, fare) => {
    const setPassengerCount =
      type === "outbound" ? setOutboundPassengerCount : setReturnPassengerCount;
    const setTotalFare =
      type === "outbound" ? setOutboundTotalFare : setReturnTotalFare;

    setPassengerCount((prev) => {
      const currentCount = prev[`${trainName}-${coachName}`] || 0;
      const coach = trips[type]
        .find((t) => t.trainName === trainName)
        ?.coaches.find((c) => c.coachName === coachName);

      if (coach && currentCount < coach.noOfSeatsAvailable) {
        const newCount = currentCount + 1;
        setTotalFare((prevTotal) => prevTotal + fare);
        return {
          ...prev,
          [`${trainName}-${coachName}`]: newCount,
        };
      } else {
        alert("No more available seats.");
        return prev;
      }
    });
  };

  const decrementCount = (type, trainName, coachName, fare) => {
    const setPassengerCount =
      type === "outbound" ? setOutboundPassengerCount : setReturnPassengerCount;
    const setTotalFare =
      type === "outbound" ? setOutboundTotalFare : setReturnTotalFare;

    setPassengerCount((prev) => {
      const currentCount = prev[`${trainName}-${coachName}`] || 0;
      const coach = trips[type]
        .find((t) => t.trainName === trainName)
        ?.coaches.find((c) => c.coachName === coachName);

      if (currentCount > 0) {
        const newCount = currentCount - 1;
        setTotalFare((prevTotal) => prevTotal - fare);
        return {
          ...prev,
          [`${trainName}-${coachName}`]: newCount,
        };
      }
      return prev;
    });
  };

  const handleReserve = () => {
    if (token) {
      const outboundRes = [];
      const returnRes = [];
      let totalFare = 0;
      trips.outbound.forEach((train) => {
        train.coaches.forEach((coach) => {
          const count =
            outboundPassengerCount[`${train.trainName}-${coach.coachName}`] ||
            0;
          if (count > 0) {
            const fareForCoach = count * coach.fare;
            outboundRes.push({
              trainName: train.trainName,
              coachName: coach.coachName,
              source: train.source,
              destination: train.destination,
              start: train.startTime,
              end: train.endTime,
              count,
              totalFareForCoach: fareForCoach,
            });
            totalFare += fareForCoach;
          }
        });
      });
      trips.return.forEach((train) => {
        train.coaches.forEach((coach) => {
          const count =
            returnPassengerCount[`${train.trainName}-${coach.coachName}`] || 0;
          if (count > 0) {
            const fareForCoach = count * coach.fare;
            returnRes.push({
              totalFareForCoach: fareForCoach,
              trainName: train.trainName,
              coachName: coach.coachName,
              source: train.source,
              destination: train.destination,
              start: train.startTime,
              end: train.endTime,
              count,
            });
            totalFare += fareForCoach;
          }
        });
      });

      if (outboundRes.length === 0 && returnRes.length === 0) {
        alert("Please select at least 1 passenger for either trip.");
        return;
      }

      setModalReservations({ outboundRes, returnRes, totalFare });
      setIsModalOpen(true);
    } else {
      setLoginModalOpen(true);
    }
  };
  const handleConfirmBooking = () => {
    setIsModalOpen(false);
    setShowDownloadButton(true);
    setIsReserved(true);
    setSuccessSnackbarOpen(true);
    setTimeout(() => {
      setSuccessSnackbarOpen(false);
    }, 2000);
  };

  const downloadPDF = () => {
    const { outboundRes, returnRes } = modalReservations;
    const reservationsToDownload = [...outboundRes, ...returnRes];
    if (reservationsToDownload.length === 0) return;

    const doc = new jsPDF();
    const margin = 20;

    doc.setFontSize(16);
    doc.text("Reservation Details", margin, margin);

    const headers = [
      "Reservation No.",
      "Train Name",
      "Coach Name",
      "Passengers",
      "Total Fare",
    ];
    const tableRows = reservationsToDownload.map((reservation, index) => [
      index + 1,
      reservation.trainName,
      reservation.coachName,
      reservation.count,
      `$${reservation.totalFareForCoach}`,
    ]);

    doc.autoTable({
      head: [headers],
      body: tableRows,
      startY: margin + 20,
      theme: "grid",
      styles: {
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
      },
      didDrawPage: (data) => {
        let pageCount = doc.internal.getNumberOfPages();
        let str = `Page ${pageCount}`;
        doc.setFontSize(10);
        doc.text(
          str,
          data.settings.margin.left,
          doc.internal.pageSize.getHeight() - 10
        );
      },
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.text("Thank you for your reservation!", margin, pageHeight - 10);

    doc.save("reservation-details.pdf");
  };
  const renderTrip = (tripType) => {
    const availableTrips = trips[tripType];

    if (availableTrips.length === 0) {
      return (
        <Box
          sx={{
            border: "2px solid black",
            backgroundColor: "#f5849b",
            display: "flex",
            justifyContent: "center",
            padding: 2,
            borderRadius: "8px",
          }}
        >
          <Typography variant="body1">
            No trains are available for this trip.
          </Typography>
        </Box>
      );
    }
    return availableTrips.map((train, index) => (
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
            <FaTrain sx={{ ml: 2, fontSize: { xs: "24px", sm: "28px" } }} />{" "}
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
            <Grid
              container
              spacing={3}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              {train.coaches.map((coach, coachIndex) => (
                <Grid item xs={12} key={coachIndex}>
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
                            tripType,
                            train.trainName,
                            coach.coachName,
                            coach.fare
                          )
                        }
                        sx={{
                          minWidth: "26px",
                          height: "20px",
                          padding: "0",
                        }}
                        size="small"
                      >
                        <AddIcon fontSize="small" />
                      </Button>
                      <Typography variant="body2" sx={{ mx: 1 }}>
                        {tripType === "outbound"
                          ? outboundPassengerCount[
                              `${train.trainName}-${coach.coachName}`
                            ] || 0
                          : returnPassengerCount[
                              `${train.trainName}-${coach.coachName}`
                            ] || 0}{" "}
                      </Typography>
                      <Button
                        onClick={() =>
                          decrementCount(
                            tripType,
                            train.trainName,
                            coach.coachName,
                            coach.fare
                          )
                        }
                        sx={{
                          minWidth: "26px",
                          height: "20px",
                          padding: "0",
                        }}
                        size="small"
                      >
                        <RemoveIcon fontSize="small" />
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
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
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
      <Grid item size={{ xs: 12, sm: 10 }} mt={3}>
        <Grid item size={{ xs: 12 }}></Grid>
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
              Available trains from {formData.source} to {formData.destination}
            </Typography>
          </Paper>
        </Box>

        <Typography
          variant="h5"
          sx={{
            background: "linear-gradient(to right, yellow, red)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 1,
          }}
        >
          Outbound Trip
        </Typography>
        <Grid sx={{ padding: 2, border: "2px solid black" }}>
          {renderTrip("outbound")}
        </Grid>
        <Typography
          variant="h5"
          sx={{
            background: "linear-gradient(to right, yellow, red)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 1,
          }}
        >
          Return Trip
        </Typography>
        <Grid sx={{ padding: 2, border: "2px solid black" }}>
          {renderTrip("return")}
        </Grid>
        {isReserved ? (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button variant="contained" onClick={downloadPDF} sx={{ mt: 4 }}>
              Download PDF
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              onClick={handleReserve}
              sx={{ mt: 4, mr: 2 }}
            >
              Reserve
            </Button>
          </Box>
        )}

        <Login open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <DialogTitle>
            <Typography variant="h6" gutterBottom>
              Confirm Your Booking
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                border: "1px solid lightgray",
                borderRadius: "4px",
                padding: 2,
                mb: 2,
                backgroundColor: "#f9f9f9",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Outbound Trip
              </Typography>
              {modalReservations.outboundRes?.map((res, index) => (
                <>
                  {" "}
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Route: {res.source} to {res.destination}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Time: {res.start} -- {res.end}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Coach: {res.coachName}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Passengers: {res.count}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Total Fare: ${res.totalFareForCoach}
                  </Typography>
                </>
              ))}
              <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
                Return Trip
              </Typography>
              {modalReservations.returnRes?.map((res, index) => (
                <Typography key={index}>
                  {res.count} x {res.trainName} - {res.coachName} = $
                  {res.totalFareForCoach}
                </Typography>
              ))}
              <Typography variant="h5" sx={{ mt: 2, fontWeight: "bold" }}>
                Total Fare: ${modalReservations.totalFare}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmBooking}>Confirm</Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={successSnackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSuccessSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSuccessSnackbarOpen(false)}
            severity="success"
          >
            Booking confirmed successfully!
          </Alert>
        </Snackbar>
      </Grid>
    </Grid>
  );
};

export default RoundTrain;
