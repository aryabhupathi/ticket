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
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { jsPDF } from "jspdf"; // Ensure to install this package
import { useLocation } from "react-router-dom";

import { train } from "../data";
const RoundTrain = () => {
  const location = useLocation();
  const { formData } = location.state;

  // States for outbound trip
  const [outboundPassengerCount, setOutboundPassengerCount] = useState({});
  const [outboundTotalFare, setOutboundTotalFare] = useState(0);

  // States for return trip
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
  const [isReserved, setIsReserved] = useState(false); // New state for reservation confirmation

  useEffect(() => {
    const initialOutboundCounts = {};
    const initialReturnCounts = {};

    train.forEach((train) => {
      train.coaches.forEach((coach) => {
        initialOutboundCounts[`${train.trainName}-${coach.coachName}`] = 0;
        initialReturnCounts[`${train.trainName}-${coach.coachName}`] = 0; // For return trip
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
        return prev; // Return previous state if no seats are available
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
      return prev; // Return previous state if count is already 0
    });
  };

  const handleReserve = () => {
    const outboundRes = [];
    const returnRes = [];
    let totalFare = 0;

    // Collect outbound reservations
    trips.outbound.forEach((train) => {
      train.coaches.forEach((coach) => {
        const count =
          outboundPassengerCount[`${train.trainName}-${coach.coachName}`] || 0;
        if (count > 0) {
          const fareForCoach = count * coach.fare;
          outboundRes.push({
            trainName: train.trainName,
            coachName: coach.coachName,
            count,
            totalFareForCoach: fareForCoach,
          });
          totalFare += fareForCoach;
        }
      });
    });

    // Collect return reservations
    trips.return.forEach((train) => {
      train.coaches.forEach((coach) => {
        const count =
          returnPassengerCount[`${train.trainName}-${coach.coachName}`] || 0;
        if (count > 0) {
          const fareForCoach = count * coach.fare;
          returnRes.push({
            trainName: train.trainName,
            coachName: coach.coachName,
            count,
            totalFareForCoach: fareForCoach,
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
  };

  const handleConfirmBooking = () => {
    setIsModalOpen(false);
    setShowDownloadButton(true);
    setIsReserved(true); // Update reservation state
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
  };

  const renderTrip = (tripType) => {
    return trips[tripType].map((train, index) => (
      <Accordion key={index}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            {train.trainName} ({train.source} to {train.destination})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ width: "100%", mb: 2 }}>
            <Typography variant="body1">
              Start Time: {train.startTime}
            </Typography>
            <Typography variant="body1">End Time: {train.endTime}</Typography>
            <Typography variant="body1">
              Stops: {train.stops.join(", ")}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {train.coaches.map((coach, coachIndex) => (
              <Grid item xs={12} sm={6} md={2} key={coachIndex}>
                <Box
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                  }}
                >
                  <Typography variant="h6">{coach.coachName}</Typography>
                  <Typography variant="body2">Fare: ${coach.fare}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Button
                      onClick={() =>
                        incrementCount(
                          tripType,
                          train.trainName,
                          coach.coachName,
                          coach.fare
                        )
                      }
                      variant="contained"
                      size="small"
                    >
                      +
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
                      variant="contained"
                      size="small"
                    >
                      -
                    </Button>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    ));
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4">Round Trip Train Reservations</Typography>

      <Typography variant="h5" sx={{ mt: 4 }}>
        Outbound Trip
      </Typography>
      {renderTrip("outbound")}

      <Typography variant="h5" sx={{ mt: 4 }}>
        Return Trip
      </Typography>
      {renderTrip("return")}

      {isReserved ? ( // Conditional rendering based on reservation confirmation
        <Button variant="contained" onClick={downloadPDF} sx={{ mt: 4 }}>
          Download PDF
        </Button>
      ) : (
        <Button
          variant="contained"
          onClick={handleReserve}
          sx={{ mt: 4, mr: 2 }}
        >
          Reserve
        </Button>
      )}

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle>Confirm Your Reservations</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Outbound Trip</Typography>
          {modalReservations.outboundRes?.map((res, index) => (
            <Typography key={index}>
              {res.count} x {res.trainName} - {res.coachName} = $
              {res.totalFareForCoach}
            </Typography>
          ))}
          <Typography variant="h6" sx={{ mt: 2 }}>
            Return Trip
          </Typography>
          {modalReservations.returnRes?.map((res, index) => (
            <Typography key={index}>
              {res.count} x {res.trainName} - {res.coachName} = $
              {res.totalFareForCoach}
            </Typography>
          ))}
          <Typography variant="h5" sx={{ mt: 2 }}>
            Total Fare: ${modalReservations.totalFare}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmBooking}>Confirm</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSuccessSnackbarOpen(false)}
        message="Reservations Confirmed!"
      />
    </Box>
  );
};

export default RoundTrain;
