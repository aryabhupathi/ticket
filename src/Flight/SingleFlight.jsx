// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   Typography,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Modal,
//   Grid,
//   Alert,
//   Snackbar,
// } from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import { useLocation } from "react-router-dom";
// import { flight } from "../data"; // Adjust the import as necessary
// import jsPDF from "jspdf";
// import TicketStepper from "./TicketStepper";

// const SingleFlight = () => {
//   const location = useLocation();
//   const { formData } = location.state;
//   const [selectedSeats, setSelectedSeats] = useState({});
//   const [fare, setFare] = useState(0);
//   const [openConfirmModal, setOpenConfirmModal] = useState(false);
//   const [selectedFlight, setSelectedFlight] = useState(null);
//   const [expanded, setExpanded] = useState(false);
//   const [bookingConfirmed, setBookingConfirmed] = useState(false);
//   const [showMessage, setShowMessage] = useState(false);
//   const [startBooking, setStartBooking] = useState(false);

//   const outboundTrips = flight.filter(
//     (item) =>
//       item.source === formData.source &&
//       item.destination === formData.destination
//   );

//   const handleCloseSnackbar = () => setShowMessage(false);

//   const handleFlightSelect = (flight) => {
//     setSelectedFlight(flight);
//     setSelectedSeats({[flight.flightName]: [] });
//     setFare(0);
//     setBookingConfirmed(false);
//     setStartBooking(false);
//   };

//   const handleStartBooking = () => {
//     setStartBooking(true);
//   };

//   const handleBookSeats = () => {
//     setOpenConfirmModal(true);
//   };

//   const handleSeatSelection = (seat) => {
//     setSelectedSeats((prevSeats) => {
//       const currentSeats = prevSeats[selectedFlight.flightName] || [];
//       const isSeatSelected = currentSeats.includes(seat);

//       if (isSeatSelected) {
//         // Remove the seat if it's already selected
//         return {
//           ...prevSeats,
//           [selectedFlight.flightName]: currentSeats.filter((s) => s !== seat),
//         };
//       } else {
//         // Add the seat if it's not selected
//         return {
//           ...prevSeats,
//           [selectedFlight.flightName]: [...currentSeats, seat],
//         };
//       }
//     });
//   };

//   const handleFareUpdate = (updatedFare) => {
//     setFare(updatedFare);
//   };

//   const confirmBooking = () => {
//     setBookingConfirmed(true);
//     setOpenConfirmModal(false);
//     setTimeout(() => {
//       setShowMessage(true);
//     }, 2000);
//   };

//   const downloadPDF = () => {
//     const doc = new jsPDF();
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const margin = 20;

//     doc.setFontSize(22);
//     doc.text("Reservation Details", margin, margin);
//     doc.setFontSize(12);
//     doc.text(
//       `Date: ${new Date().toLocaleDateString()}`,
//       pageWidth - margin - 50,
//       margin
//     );

//     const headerY = 40;
//     doc.setFontSize(12);
//     const headers = ["Flight Name", "Route", "Start Time", "Seats", "Fare"];
//     const columnWidths = [40, 40, 40, 30, 20];

//     headers.forEach((header, index) => {
//       doc.text(
//         header,
//         margin + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
//         headerY
//       );
//     });

//     let y = headerY + 10;
//     Object.keys(selectedSeats).forEach((flightName) => {
//       const seats = selectedSeats[flightName];
//       if (seats.length > 0) {
//         const selectedFlightDetails = outboundTrips.find(
//           (flight) => flight.flightName === flightName
//         );
//         if (selectedFlightDetails) {
//           const fare = selectedFlightDetails.categories[0].fare * seats.length;

//           doc.text(flightName, margin, y);
//           doc.text(
//             `${selectedFlightDetails.source} to ${selectedFlightDetails.destination}`,
//             margin + columnWidths[0],
//             y
//           );
//           doc.text(
//             selectedFlightDetails.startTime,
//             margin + columnWidths[0] + columnWidths[1],
//             y
//           );
//           doc.text(
//             seats.join(", "),
//             margin + columnWidths[0] + columnWidths[1] + columnWidths[2],
//             y
//           );
//           doc.text(
//             `$${fare}`,
//             margin +
//               columnWidths[0] +
//               columnWidths[1] +
//               columnWidths[2] +
//               columnWidths[3],
//             y
//           );

//           y += 10;

//           if (y > pageHeight - margin) {
//             doc.addPage();
//             y = headerY + 10;
//             headers.forEach((header, index) => {
//               doc.text(
//                 header,
//                 margin +
//                   columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
//                 headerY
//               );
//             });
//           }
//         }
//       }
//     });

//     doc.setFontSize(10);
//     doc.text("Thank you for your reservation!", margin, pageHeight - margin);

//     doc.save("reservation-details.pdf");
//   };

//   const handleChange = (flightIndex) => {
//     setExpanded(expanded === flightIndex ? false : flightIndex);
//     handleFlightSelect(outboundTrips[flightIndex]);
//   };

//   return (
//     <Box
//       sx={{
//         padding: 2,
//         height: "100vh",
//         backgroundImage: "url(../../Flight.webp)",
//         backgroundSize: "cover",
//         backgroundRepeat: "no-repeat",
//         backgroundPosition: "center",
//       }}
//     >
//       <Typography
//         variant="h5"
//         sx={{
//           background: "linear-gradient(to right, red, green, blue)",
//           WebkitBackgroundClip: "text",
//           WebkitTextFillColor: "transparent",
//           textAlign: "center",
//           margin: 0,
//         }}
//       >
//         Available Flights from {formData.source} to {formData.destination}
//       </Typography>

//       {formData.tripType === "single" && (
//         <Grid xs={12} sm={9} sx={{ padding: 2 }}>
//           {outboundTrips.length > 0 ? (
//             outboundTrips.map((details, index) => (
//               <Accordion
//                 key={index}
//                 expanded={expanded === index}
//                 onChange={() => handleChange(index)}
//                 sx={{ mb: 2 }}
//               >
//                 <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                   <Typography
//                     variant="h6"
//                     sx={{ color: "blue", fontWeight: "bold" }}
//                   >
//                     {details.flightName}
//                     <span style={{ color: "gray" }}> &#x2794; </span>{" "}
//                   </Typography>

//                   <Typography variant="body1" sx={{ color: "green", ml: 2 }}>
//                     Route: {details.source} to {details.destination}
//                     <span style={{ color: "gray" }}> &#x2794; </span>{" "}
//                   </Typography>

//                   <Typography variant="body1" sx={{ color: "orange", ml: 2 }}>
//                     Fare per seat: ${details.categories[0].fare}
//                   </Typography>
//                 </AccordionSummary>

//                 <AccordionDetails>
//                   <Box>
//                     <Box
//                       sx={{
//                         border: "1px solid lightgray",
//                         borderRadius: "4px",
//                         padding: 2,
//                         mb: 2,
//                         backgroundColor: "#f9f9f9",
//                       }}
//                     >
//                       <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
//                         <Typography
//                           variant="body2"
//                           sx={{ color: "blue", mr: 1 }}
//                         >
//                           Start Time: {details.startTime}
//                         </Typography>

//                         <Typography variant="body2" sx={{ color: "blue" }}>
//                           | End Time: {details.endTime}
//                         </Typography>
//                       </Box>

//                       <Typography
//                         variant="body2"
//                         sx={{ color: "green", mt: 1 }}
//                       >
//                         Stops: {details.stops.join(", ")}
//                       </Typography>

//                       <Typography
//                         variant="body2"
//                         sx={{ color: "green", mt: 1 }}
//                       >
//                         Base Price: ${details.baseFare}
//                       </Typography>

//                       <Button onClick={handleStartBooking}>Proceed</Button>
//                       {startBooking && (
//                         <TicketStepper
//                           selectedFlight={selectedFlight}
//                           onFareUpdate={handleFareUpdate}
//                           onSeatSelect={handleSeatSelection}
//                           selectedSeats={selectedSeats[selectedFlight?.flightName] || []} // Pass selected seats for the current flight
//                         />
//                       )}
//                     </Box>

//                     <Box sx={{ display: "flex", justifyContent: "center" }}>
//                       {selectedSeats[details.flightName]?.length > 0 &&
//                         !bookingConfirmed && (
//                           <Button
//                             variant="contained"
//                             color="primary"
//                             onClick={handleBookSeats}
//                             sx={{ mt: 2 }}
//                           >
//                             Book
//                           </Button>
//                         )}

//                       {bookingConfirmed && (
//                         <Button
//                           variant="contained"
//                           color="success"
//                           onClick={downloadPDF}
//                           sx={{ mt: 2 }}
//                         >
//                           Download Ticket
//                         </Button>
//                       )}
//                     </Box>
//                   </Box>
//                 </AccordionDetails>
//               </Accordion>
//             ))
//           ) : (
//             <Alert severity="error">No flights found!</Alert>
//           )}
//         </Grid>
//       )}

//       {/* Confirmation Modal */}
//       <Modal open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
//         <Box
//           sx={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             width: 400,
//             bgcolor: "background.paper",
//             boxShadow: 24,
//             p: 4,
//             textAlign: "center",
//           }}
//         >
//           <Typography variant="h6">Confirm Booking?</Typography>
//           <Button
//             variant="contained"
//             color="primary"
//             sx={{ mt: 2 }}
//             onClick={confirmBooking}
//           >
//             Confirm
//           </Button>
//         </Box>
//       </Modal>

//       {/* Snackbar */}
//       <Snackbar
//         open={showMessage}
//         autoHideDuration={6000}
//         onClose={handleCloseSnackbar}
//       >
//         <Alert onClose={handleCloseSnackbar} severity="success">
//           Booking Confirmed!
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default SingleFlight;



import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Modal,
  Snackbar,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TicketStepper from "./TicketStepper"; // Adjust path as necessary
import { jsPDF } from "jspdf";
import { useLocation } from "react-router-dom";
import {flight} from '../data'
const SingleFlight = () => {
  const location = useLocation();
  const { formData } = location.state;
  const [selectedSeats, setSelectedSeats] = useState({}); // Holds selected seats per flight
  const [fare, setFare] = useState(0);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [startBooking, setStartBooking] = useState(false);

  const outboundTrips = flight.filter(
    (item) =>
      item.source === formData.source &&
      item.destination === formData.destination
  );

  const handleCloseSnackbar = () => setShowMessage(false);

  const handleFlightSelect = (flight) => {
    setSelectedFlight(flight);
    setSelectedSeats({ [flight.flightName]: [] });
    setFare(0);
    setBookingConfirmed(false);
    setStartBooking(false);
  };

  const handleStartBooking = () => {
    setStartBooking(true);
  };

  const handleBookSeats = () => {
    setOpenConfirmModal(true);
  };

  const handleSeatSelection = (seat) => {
    setSelectedSeats((prevSeats) => {
      const currentSeats = prevSeats[selectedFlight.flightName] || [];
      const isSeatSelected = currentSeats.includes(seat);

      if (isSeatSelected) {
        // Remove the seat if it's already selected
        return {
          ...prevSeats,
          [selectedFlight.flightName]: currentSeats.filter((s) => s !== seat),
        };
      } else {
        // Add the seat if it's not selected
        return {
          ...prevSeats,
          [selectedFlight.flightName]: [...currentSeats, seat],
        };
      }
    });
  };

  const handleFareUpdate = (updatedFare) => {
    setFare(updatedFare);
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
    Object.keys(selectedSeats).forEach((flightName) => {
      const seats = selectedSeats[flightName];
      if (seats.length > 0) {
        const selectedFlightDetails = outboundTrips.find(
          (flight) => flight.flightName === flightName
        );
        if (selectedFlightDetails) {
          const fare = selectedFlightDetails.categories[0].fare * seats.length;

          doc.text(flightName, margin, y);
          doc.text(
            `${selectedFlightDetails.source} to ${selectedFlightDetails.destination}`,
            margin + columnWidths[0],
            y
          );
          doc.text(
            selectedFlightDetails.startTime,
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

          if (y > pageHeight - margin) {
            doc.addPage();
            y = headerY + 10;
            headers.forEach((header, index) => {
              doc.text(
                header,
                margin +
                  columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
                headerY
              );
            });
          }
        }
      }
    });

    doc.setFontSize(10);
    doc.text("Thank you for your reservation!", margin, pageHeight - margin);

    doc.save("reservation-details.pdf");
  };

  const handleChange = (flightIndex) => {
    setExpanded(expanded === flightIndex ? false : flightIndex);
    handleFlightSelect(outboundTrips[flightIndex]);
  };

  return (
    <Box
      sx={{
        padding: 2,
        height: "100vh",
        backgroundImage: "url(../../Flight.webp)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
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

      {formData.tripType === "single" && (
        <Grid xs={12} sm={9} sx={{ padding: 2 }}>
          {outboundTrips.length > 0 ? (
            outboundTrips.map((details, index) => (
              <Accordion
                key={index}
                expanded={expanded === index}
                onChange={() => handleChange(index)}
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
                    Fare per seat: ${details.categories[0].fare}
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
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
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

                      <Button onClick={handleStartBooking}>Proceed</Button>
                      {startBooking && (
                        <TicketStepper
                          selectedFlight={selectedFlight}
                          onFareUpdate={handleFareUpdate}
                          onSeatSelect={handleSeatSelection}
                          selectedSeats={selectedSeats[selectedFlight?.flightName] || []} // Pass selected seats for the current flight
                        />
                      )}
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      {selectedSeats[details.flightName]?.length > 0 &&
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
            <Alert severity="error">No flights found!</Alert>
          )}
        </Grid>
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

export default SingleFlight;
