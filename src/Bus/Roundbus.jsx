import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLocation } from "react-router-dom";
import { bus } from "../data"; // Adjust the import as necessary
import jsPDF from "jspdf";

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
    outbound: -1,
    return: -1,
  });
  const [bookingConfirmed, setBookingConfirmed] = useState({
    outbound: false,
    return: false,
  });
  const [currentTripType, setCurrentTripType] = useState("");

  // Filter bus details based on source and destination for outbound and return trips
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

  const handleSeatClick = (seat, tripType) => {
    if (!selectedBus[tripType] || bookingConfirmed[tripType]) return;

    setSelectedSeats((prevSelectedSeats) => {
      const currentSelection =
        prevSelectedSeats[tripType][selectedBus[tripType].busName] || [];
      const isSelected = currentSelection.includes(seat);
      const updatedSelection = isSelected
        ? currentSelection.filter((s) => s !== seat)
        : [...currentSelection, seat];

      // Update the fare based on the selected seats
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
      [tripType]: { [bus.busName]: [] }, // Reset selected seats for the new bus
    }));

    setFare((prevFare) => ({
      ...prevFare,
      [tripType]: 0, // Reset fare when changing bus
    }));

    setBookingConfirmed((prev) => ({
      ...prev,
      [tripType]: false, // Reset booking confirmation state
    }));
  };

  const handleBookSeats = (tripType) => {
    setCurrentTripType(tripType); // Set the current trip type for confirmation
    setOpenConfirmModal(true); // Open the confirmation modal
  };

  const confirmBooking = () => {
    setBookingConfirmed((prev) => ({
      ...prev,
      [currentTripType]: true, // Set the current trip type booking as confirmed
    }));
    setOpenConfirmModal(false); // Close confirmation modal
  };

  const downloadPDF = (tripType) => {
    const doc = new jsPDF();
    doc.text("Reservation Details", 20, 20);

    const selectedSeatsForTrip = selectedSeats[tripType];
    const selectedBusDetails = selectedBus[tripType];

    if (selectedSeatsForTrip[selectedBusDetails.busName]?.length > 0) {
      doc.text(`Bus: ${selectedBusDetails.busName}`, 20, 30);
      doc.text(
        `Route: ${selectedBusDetails.source} to ${selectedBusDetails.destination}`,
        20,
        40
      );
      doc.text(
        `Seats: ${selectedSeatsForTrip[selectedBusDetails.busName].join(", ")}`,
        20,
        50
      );
      doc.text(
        `Fare: $${
          selectedBusDetails.fare *
          selectedSeatsForTrip[selectedBusDetails.busName].length
        }`,
        20,
        60
      );
    }

    doc.save("reservation-details.pdf");
  };

  const handleChange = (busIndex, tripType) => {setSelectedBus({
    outbound: null,
    return: null,
  });
  setSelectedSeats({
    outbound: {},
    return: {},
  });
  setFare({
    outbound: 0,
    return: 0,
  });
  setBookingConfirmed({
    outbound: false,
    return: false,
  });
  setExpandedIndex({
    outbound: -1,
    return: -1,
  });
    setExpandedIndex((prevExpandedIndex) => ({
      ...prevExpandedIndex,
      [tripType]: prevExpandedIndex[tripType] === busIndex ? -1 : busIndex, // Collapse if already expanded
    }));

    // Select the bus when expanding the accordion
    if (expandedIndex[tripType] !== busIndex) {
      const selectedBusDetails =
        tripType === "outbound"
          ? outboundTrips[busIndex]
          : returnTrips[busIndex];
      handleBusSelect(selectedBusDetails, tripType);
    }
  };

  console.log(selectedSeats, "sssssssssssssssssss");
  console.log(selectedBus, "sssssssssssssssssss");
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Available Buses from {formData.source} to {formData.destination}
      </Typography>

      {/* Outbound Trip Logic */}
      {formData.tripType === "round" && (
        <>
          <Typography variant="h5" gutterBottom>
            Outbound Trip
          </Typography>
          <Box>
            {outboundTrips.map((bus, index) => (
              <Accordion
                key={index}
                expanded={expandedIndex.outbound === index}
                onChange={() => handleChange(index, "outbound")}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{bus.busName}</Typography>
                  <Box display="flex" flexDirection="column" ml={2}>
                    <Typography variant="body1">
                      Route: {bus.source} to {bus.destination}
                    </Typography>
                    <Typography variant="body1">
                      Fare per seat: ${bus.fare}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body2">
                      Start Time: {bus.startTime}
                    </Typography>
                    <Typography variant="body2">
                      End Time: {bus.endTime}
                    </Typography>
                    <Typography variant="body2">
                      Stops: {bus.stops.join(", ")}
                    </Typography>
                    <Typography variant="body2">
                      Seats Available: {bus.noOfSeatsAvailable}
                    </Typography>
                    <Typography variant="body1" mt={2}>
                      Selected Seats:{" "}
                      {selectedSeats.outbound[bus.busName]?.join(", ") ||
                        "None"}
                    </Typography>
                    <Typography variant="h6" color="primary" mt={2}>
                      Total Fare: ${fare.outbound}
                    </Typography>
                    <Box display="flex" flexDirection="column" mt={2}>
                      {[0, 1, 2, 3].map((seatRow) => (
                        <Box
                          key={seatRow}
                          display="flex"
                          flexDirection="row"
                          justifyContent="space-around"
                          mb={1}
                        >
                          {bus.layout.seatConfiguration.map((row, rowIndex) => (
                            <Box
                              key={rowIndex}
                              bgcolor={
                                selectedSeats.outbound[bus.busName]?.includes(
                                  row[seatRow]
                                )
                                  ? "lightgreen"
                                  : "lightgray"
                              }
                              textAlign="center"
                              width="50px"
                              border="1px solid black"
                              sx={{ cursor: "pointer" }}
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
                    {selectedSeats.outbound[bus.busName]?.length > 0 &&
                      !bookingConfirmed.outbound && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleBookSeats("outbound")}
                          sx={{ mt: 2 }}
                        >
                          Book Outbound
                        </Button>
                      )}
                    {bookingConfirmed.outbound && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => downloadPDF("outbound")}
                        sx={{ mt: 2 }}
                      >
                        Download Outbound PDF
                      </Button>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          {/* Return Trip Logic */}
          <Typography variant="h5" gutterBottom>
            Return Trip
          </Typography>
          <Box>
            {returnTrips.map((bus, index) => (
              <Accordion
                key={index}
                expanded={expandedIndex.return === index}
                onChange={() => handleChange(index, "return")}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{bus.busName}</Typography>
                  <Box display="flex" flexDirection="column" ml={2}>
                    <Typography variant="body1">
                      Route: {bus.source} to {bus.destination}
                    </Typography>
                    <Typography variant="body1">
                      Fare per seat: ${bus.fare}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body2">
                      Start Time: {bus.startTime}
                    </Typography>
                    <Typography variant="body2">
                      End Time: {bus.endTime}
                    </Typography>
                    <Typography variant="body2">
                      Stops: {bus.stops.join(", ")}
                    </Typography>
                    <Typography variant="body2">
                      Seats Available: {bus.noOfSeatsAvailable}
                    </Typography>
                    <Typography variant="body1" mt={2}>
                      Selected Seats:{" "}
                      {selectedSeats.return[bus.busName]?.join(", ") || "None"}
                    </Typography>
                    <Typography variant="h6" color="primary" mt={2}>
                      Total Fare: ${fare.return}
                    </Typography>
                    <Box display="flex" flexDirection="column" mt={2}>
                      {[0, 1, 2, 3].map((seatRow) => (
                        <Box
                          key={seatRow}
                          display="flex"
                          flexDirection="row"
                          justifyContent="space-around"
                          mb={1}
                        >
                          {bus.layout.seatConfiguration.map((row, rowIndex) => (
                            <Box
                              key={rowIndex}
                              bgcolor={
                                selectedSeats.return[bus.busName]?.includes(
                                  row[seatRow]
                                )
                                  ? "lightgreen"
                                  : "lightgray"
                              }
                              textAlign="center"
                              width="50px"
                              border="1px solid black"
                              sx={{ cursor: "pointer" }}
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
                    {selectedSeats.return[bus.busName]?.length > 0 &&
                      !bookingConfirmed.return && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleBookSeats("return")}
                          sx={{ mt: 2 }}
                        >
                          Book Return
                        </Button>
                      )}
                    {bookingConfirmed.return && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => downloadPDF("return")}
                        sx={{ mt: 2 }}
                      >
                        Download Return PDF
                      </Button>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </>
      )}
      <Modal open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
        <Box sx={{ padding: 2, backgroundColor: "white", borderRadius: 2 }}>
          <Typography variant="h6">Confirm Booking</Typography>

          <Box mt={2}>
            <Typography variant="h6"> Trip Details:</Typography>
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
                <Typography variant="body2" mt={2}>
                  Selected Seats (Outbound):{" "}
                  {selectedSeats.outbound[selectedBus.outbound?.busName]?.join(
                    ", "
                  ) || "None"}
                </Typography>
                <Typography variant="body2" mt={2}>
                  Total Fare (Outbound): ${fare.outbound}
                </Typography>
              </>
            )}

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
                <Typography variant="body2" mt={2}>
                  Selected Seats (Return):{" "}
                  {selectedSeats.return[selectedBus.return?.busName]?.join(
                    ", "
                  ) || "None"}
                </Typography>
                <Typography variant="body2" mt={2}>
                  Total Fare (Return): ${fare.return}
                </Typography>
              </>
            )}

            <Button variant="contained" onClick={confirmBooking}>
              Confirm
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default RoundBus;


// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   Typography,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Modal,
// } from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import { useLocation } from "react-router-dom";
// import { bus } from "../data"; // Adjust the import as necessary
// import jsPDF from "jspdf";

// const RoundBus = () => {
//   const location = useLocation();
//   const { formData } = location.state;
//   const [selectedSeats, setSelectedSeats] = useState({
//     outbound: {},
//     return: {},
//   });
//   const [fare, setFare] = useState({ outbound: 0, return: 0 });
//   const [openConfirmModal, setOpenConfirmModal] = useState(false);
//   const [selectedBus, setSelectedBus] = useState({
//     outbound: null,
//     return: null,
//   });
//   const [expandedIndex, setExpandedIndex] = useState({
//     outbound: -1,
//     return: -1,
//   });
//   const [bookingConfirmed, setBookingConfirmed] = useState({
//     outbound: false,
//     return: false,
//   });
//   const [currentTripType, setCurrentTripType] = useState("");

//   // Filter bus details based on source and destination for outbound and return trips
//   const outboundTrips = bus.filter(
//     (item) =>
//       item.source === formData.source &&
//       item.destination === formData.destination
//   );

//   const returnTrips = bus.filter(
//     (item) =>
//       item.source === formData.destination &&
//       item.destination === formData.source
//   );

//   const handleSeatClick = (seat, tripType) => {
//     if (!selectedBus[tripType] || bookingConfirmed[tripType]) return;

//     setSelectedSeats((prevSelectedSeats) => {
//       const currentSelection =
//         prevSelectedSeats[tripType][selectedBus[tripType].busName] || [];
//       const isSelected = currentSelection.includes(seat);
//       const updatedSelection = isSelected
//         ? currentSelection.filter((s) => s !== seat)
//         : [...currentSelection, seat];

//       // Update the fare based on the selected seats
//       setFare((prevFare) => ({
//         ...prevFare,
//         [tripType]: updatedSelection.length * selectedBus[tripType].fare,
//       }));

//       return {
//         ...prevSelectedSeats,
//         [tripType]: {
//           ...prevSelectedSeats[tripType],
//           [selectedBus[tripType].busName]: updatedSelection,
//         },
//       };
//     });
//   };

//   const handleBusSelect = (bus, tripType) => {
//     setSelectedBus((prev) => ({
//       ...prev,
//       [tripType]: bus,
//     }));

//     setSelectedSeats((prevSelectedSeats) => ({
//       ...prevSelectedSeats,
//       [tripType]: { [bus.busName]: [] }, // Reset selected seats for the new bus
//     }));

//     setFare((prevFare) => ({
//       ...prevFare,
//       [tripType]: 0, // Reset fare when changing bus
//     }));

//     setBookingConfirmed((prev) => ({
//       ...prev,
//       [tripType]: false, // Reset booking confirmation state
//     }));
//   };

//   const handleBookSeats = (tripType) => {
//     setCurrentTripType(tripType); // Set the current trip type for confirmation
//     setOpenConfirmModal(true); // Open the confirmation modal
//   };

//   const confirmBooking = () => {
//     setBookingConfirmed((prev) => ({
//       ...prev,
//       [currentTripType]: true, // Set the current trip type booking as confirmed
//     }));
//     setOpenConfirmModal(false); // Close confirmation modal
//   };

//   const downloadPDF = (tripType) => {
//     const doc = new jsPDF();
//     doc.text("Reservation Details", 20, 20);

//     const selectedSeatsForTrip = selectedSeats[tripType];
//     const selectedBusDetails = selectedBus[tripType];

//     if (selectedSeatsForTrip[selectedBusDetails.busName]?.length > 0) {
//       doc.text(`Bus: ${selectedBusDetails.busName}`, 20, 30);
//       doc.text(
//         `Route: ${selectedBusDetails.source} to ${selectedBusDetails.destination}`,
//         20,
//         40
//       );
//       doc.text(
//         `Seats: ${selectedSeatsForTrip[selectedBusDetails.busName].join(", ")}`,
//         20,
//         50
//       );
//       doc.text(
//         `Fare: $${
//           selectedBusDetails.fare *
//           selectedSeatsForTrip[selectedBusDetails.busName].length
//         }`,
//         20,
//         60
//       );
//     }

//     doc.save("reservation-details.pdf");
//   };

//   const handleChange = (busIndex, tripType) => {
//     // Reset data for both trip types when any accordion is opened
//     setSelectedBus({
//       outbound: null,
//       return: null,
//     });
//     setSelectedSeats({
//       outbound: {},
//       return: {},
//     });
//     setFare({
//       outbound: 0,
//       return: 0,
//     });
//     setBookingConfirmed({
//       outbound: false,
//       return: false,
//     });

//     setExpandedIndex({
//       outbound: -1,
//       return: -1,
//     });

//     // Open the clicked accordion
//     setExpandedIndex((prevExpandedIndex) => ({
//       ...prevExpandedIndex,
//       [tripType]: prevExpandedIndex[tripType] === busIndex ? -1 : busIndex, // Collapse if already expanded
//     }));

//     // Select the bus when expanding the accordion
//     if (expandedIndex[tripType] !== busIndex) {
//       const selectedBusDetails =
//         tripType === "outbound"
//           ? outboundTrips[busIndex]
//           : returnTrips[busIndex];
//       handleBusSelect(selectedBusDetails, tripType);
//     }
//   };

//   return (
//     <Box sx={{ padding: 2 }}>
//       <Typography variant="h4" gutterBottom>
//         Available Buses from {formData.source} to {formData.destination}
//       </Typography>

//       {/* Outbound Trip Logic */}
//       {formData.tripType === "round" && (
//         <>
//           <Typography variant="h5" gutterBottom>
//             Outbound Trip
//           </Typography>
//           <Box>
//             {outboundTrips.map((bus, index) => (
//               <Accordion
//                 key={index}
//                 expanded={expandedIndex.outbound === index}
//                 onChange={() => handleChange(index, "outbound")}
//               >
//                 <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                   <Typography variant="h6">{bus.busName}</Typography>
//                   <Box display="flex" flexDirection="column" ml={2}>
//                     <Typography variant="body1">
//                       Route: {bus.source} to {bus.destination}
//                     </Typography>
//                     <Typography variant="body1">
//                       Fare per seat: ${bus.fare}
//                     </Typography>
//                   </Box>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   <Box>
//                     {/* Example seat selection UI for outbound */}
//                     {bus.seats.map((seat) => (
//                       <Button
//                         key={seat}
//                         variant={
//                           selectedSeats.outbound[bus.busName]?.includes(seat)
//                             ? "contained"
//                             : "outlined"
//                         }
//                         onClick={() => handleSeatClick(seat, "outbound")}
//                         sx={{ margin: 1 }}
//                       >
//                         {seat}
//                       </Button>
//                     ))}
//                   </Box>
//                   <Button
//                     variant="contained"
//                     onClick={() => handleBookSeats("outbound")}
//                     disabled={
//                       !selectedSeats.outbound[bus.busName]?.length ||
//                       bookingConfirmed.outbound
//                     }
//                   >
//                     {bookingConfirmed.outbound ? "Booked" : "Book Seats"}
//                   </Button>
//                 </AccordionDetails>
//               </Accordion>
//             ))}
//           </Box>

//           {/* Return Trip Logic */}
//           <Typography variant="h5" gutterBottom>
//             Return Trip
//           </Typography>
//           <Box>
//             {returnTrips.map((bus, index) => (
//               <Accordion
//                 key={index}
//                 expanded={expandedIndex.return === index}
//                 onChange={() => handleChange(index, "return")}
//               >
//                 <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                   <Typography variant="h6">{bus.busName}</Typography>
//                   <Box display="flex" flexDirection="column" ml={2}>
//                     <Typography variant="body1">
//                       Route: {bus.source} to {bus.destination}
//                     </Typography>
//                     <Typography variant="body1">
//                       Fare per seat: ${bus.fare}
//                     </Typography>
//                   </Box>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   <Box>
//                     {/* Example seat selection UI for return */}
//                     {bus.seats.map((seat) => (
//                       <Button
//                         key={seat}
//                         variant={
//                           selectedSeats.return[bus.busName]?.includes(seat)
//                             ? "contained"
//                             : "outlined"
//                         }
//                         onClick={() => handleSeatClick(seat, "return")}
//                         sx={{ margin: 1 }}
//                       >
//                         {seat}
//                       </Button>
//                     ))}
//                   </Box>
//                   <Button
//                     variant="contained"
//                     onClick={() => handleBookSeats("return")}
//                     disabled={
//                       !selectedSeats.return[bus.busName]?.length ||
//                       bookingConfirmed.return
//                     }
//                   >
//                     {bookingConfirmed.return ? "Booked" : "Book Seats"}
//                   </Button>
//                 </AccordionDetails>
//               </Accordion>
//             ))}
//           </Box>
//         </>
//       )}

//       {/* Confirmation Modal */}
//       <Modal
//         open={openConfirmModal}
//         onClose={() => setOpenConfirmModal(false)}
//       >
//         <Box
//           sx={{
//             width: 400,
//             bgcolor: "background.paper",
//             p: 4,
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             boxShadow: 24,
//           }}
//         >
//           <Typography variant="h6" gutterBottom>
//             Confirm Booking
//           </Typography>
//           <Box>
//             {selectedBus.outbound && expandedIndex.outbound !== -1 && (
//               <>
//                 <Typography variant="body2">
//                   Bus: {selectedBus.outbound.busName}
//                 </Typography>
//                 <Typography variant="body2">
//                   Route: {selectedBus.outbound.source} to{" "}
//                   {selectedBus.outbound.destination}
//                 </Typography>
//                 <Typography variant="body2">
//                   Start Time: {selectedBus.outbound.startTime}
//                 </Typography>
//                 <Typography variant="body2">
//                   End Time: {selectedBus.outbound.endTime}
//                 </Typography>
//                 <Typography variant="body2" mt={2}>
//                   Selected Seats:{" "}
//                   {selectedSeats.outbound[selectedBus.outbound.busName]?.join(
//                     ", "
//                   ) || "None"}
//                 </Typography>
//                 <Typography variant="body2">
//                   Total Fare: ${fare.outbound}
//                 </Typography>
//               </>
//             )}
//             {selectedBus.return && expandedIndex.return !== -1 && (
//               <>
//                 <Typography variant="body2">
//                   Bus: {selectedBus.return.busName}
//                 </Typography>
//                 <Typography variant="body2">
//                   Route: {selectedBus.return.source} to{" "}
//                   {selectedBus.return.destination}
//                 </Typography>
//                 <Typography variant="body2">
//                   Start Time: {selectedBus.return.startTime}
//                 </Typography>
//                 <Typography variant="body2">
//                   End Time: {selectedBus.return.endTime}
//                 </Typography>
//                 <Typography variant="body2" mt={2}>
//                   Selected Seats:{" "}
//                   {selectedSeats.return[selectedBus.return.busName]?.join(
//                     ", "
//                   ) || "None"}
//                 </Typography>
//                 <Typography variant="body2">
//                   Total Fare: ${fare.return}
//                 </Typography>
//               </>
//             )}
//           </Box>
//           <Box mt={2}>
//             <Button
//               variant="contained"
//               onClick={() => {
//                 confirmBooking();
//                 downloadPDF(currentTripType); // Download PDF for the current trip type
//               }}
//             >
//               Confirm Booking
//             </Button>
//           </Box>
//         </Box>
//       </Modal>
//     </Box>
//   );
// };

// export default RoundBus;
