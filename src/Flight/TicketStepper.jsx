// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   Stepper,
//   Step,
//   StepLabel,
//   Typography,
//   Grid,
//   Checkbox,
//   FormControlLabel,
//   Snackbar,
//   Alert,
// } from "@mui/material";
// import jsPDF from "jspdf";

// const additionalProducts = [
//   { name: "Extra Baggage", price: 50 },
//   { name: "Meal Plan", price: 30 },
//   { name: "Priority Boarding", price: 20 },
// ];

// const TicketStepper = ({
//   selectedFlight,
//   seatLayout,
//   seatCategories,
//   selectedSeats,
//   onTotalFare,
//   setSelectedSeats,
// }) => {
//   const steps = ["Select Seat", "Select Additionals", "Review"];
//   const [activeStep, setActiveStep] = useState(0);
//   const [selectedSeatSelections, setSelectedSeatSelections] = useState({});
//   const [additionalSelections, setAdditionalSelections] = useState({});
//   const [totalFare, setTotalFare] = useState(0);
//   const [bookingConfirmed, setBookingConfirmed] = useState(false);
//   const [bookingDetails, setBookingDetails] = useState(null);
//   const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar state

//   // Function to handle seat selection
//   const handleSeatSelect = (seat) => {
//     const isSelected = Object.values(selectedSeatSelections)
//       .flat()
//       .includes(seat);
//     const rowIndex = parseInt(seat[0]) - 1; // Extract row number from seat label
//     const farePerSeat = seatCategories.find((category) =>
//       category.rows.includes(rowIndex)
//     ).price;

//     const newTotalFare = isSelected
//       ? totalFare - farePerSeat
//       : totalFare + farePerSeat;

//     setSelectedSeatSelections((prev) => {
//       const updatedSeats = isSelected
//         ? Object.entries(prev).reduce((acc, [key, seats]) => {
//             const filteredSeats = seats.filter((s) => s !== seat);
//             acc[key] = filteredSeats;
//             return acc;
//           }, {})
//         : {
//             ...prev,
//             [farePerSeat]: [...(prev[farePerSeat] || []), seat],
//           };
//       return updatedSeats;
//     });

//     setTotalFare(newTotalFare);
//     onTotalFare(newTotalFare);
//     setSelectedSeats((prev) => ({
//       ...prev,
//       [selectedFlight.flightName]: Object.values(selectedSeatSelections).flat(),
//     }));
//   };

//   const getSeatBorderColor = (seat) => {
//     const seatLabel = typeof seat === "string" ? seat : seat.label; // Ensure seatLabel is a string
//     const rowIndex = parseInt(seatLabel.match(/\d+/)[0]) - 1; // Extract the full row number

//     const category = seatCategories.find((cat) => cat.rows.includes(rowIndex));

//     // Use a different color for each category
//     switch (category?.name) {
//       case "Business":
//         return "red";
//       case "First Class":
//         return "yellow";
//       case "Economy":
//         return "blue";
//       default:
//         return "gray"; // Default color for any unknown category
//     }
//   };

//   const handleAdditionalSelect = (product, price) => {
//     setAdditionalSelections((prev) => {
//       const isSelected = prev[product] !== undefined;
//       const newSelections = isSelected
//         ? { ...prev }
//         : { ...prev, [product]: price };
//       const newTotalFare = totalFare + (isSelected ? -price : price);
//       setTotalFare(newTotalFare);
//       onTotalFare(newTotalFare);

//       if (isSelected) {
//         delete newSelections[product];
//       }
//       return newSelections;
//     });
//   };

//   const handleNext = () => {
//     if (
//       activeStep === 0 &&
//       Object.values(selectedSeatSelections).flat().length === 0
//     ) {
//       alert("Please select at least one seat.");
//       return;
//     }
//     if (activeStep === 2) {
//       // Save the booking details on the last step
//       const selectedSeats = Object.entries(selectedSeatSelections).flatMap(
//         ([category, seats]) => seats.map((seat) => `${seat} (${category})`)
//       );
//       const booking = {
//         flight: selectedFlight.flightName,
//         seats: selectedSeats,
//         additionals: additionalSelections,
//         totalFare,
//       };
//       setBookingDetails(booking); // Save the booking details
//       setBookingConfirmed(true); // Mark the booking as confirmed
//       setOpenSnackbar(true); // Show success snackbar
//     } else {
//       setActiveStep((prev) => prev + 1);
//     }
//   };

//   const handleBack = () => {
//     setActiveStep((prev) => prev - 1);
//   };

//   const handleDownloadPDF = () => {
//     if (!bookingDetails) return;

//     const doc = new jsPDF();
//     doc.setFontSize(16);
//     doc.text("Booking Details", 10, 10);
//     doc.setFontSize(12);
//     doc.text(`Flight: ${bookingDetails.flight}`, 10, 30);
//     doc.text(`Seats: ${bookingDetails.seats.join(", ")}`, 10, 40);
//     doc.text("Additional Products:", 10, 50);
//     Object.entries(bookingDetails.additionals).forEach(
//       ([key, price], index) => {
//         doc.text(`${key}: $${price}`, 10, 60 + index * 10);
//       }
//     );
//     doc.text(`Total Fare: $${bookingDetails.totalFare}`, 10, 80);
//     doc.save("booking-details.pdf"); // Save as PDF
//   };

//   const handleSnackbarClose = () => {
//     setOpenSnackbar(false); // Close snackbar
//   };

//   const renderSeats = () => {
//     const columnCount = seatLayout.seatConfiguration[0].length; // Get the number of seats in a row

//     // Transpose the seat layout to group by columns
//     const transposedLayout = Array(columnCount)
//       .fill()
//       .map((_, colIndex) =>
//         seatLayout.seatConfiguration.map((row) => row[colIndex])
//       );

//     return (
//       <Grid container spacing={2}>
//         <Box
//           display="flex"
//           flexDirection="column"
//           mt={2}
//           sx={{ overflow: "scroll" }}
//         >
//           {transposedLayout.map((seatColumn, columnIndex) => (
//             <Box
//               key={columnIndex}
//               display="flex"
//               flexDirection="row"
//               justifyContent="space-between" // Adjusted to space-between for more room
//               mb={2} // Increased bottom margin for more spacing between rows
//               flexGrow={1} // Allow columns to grow and fill available space
//             >
//               {seatColumn.map((seat, rowIndex) => {
//                 const isSelected = Object.values(selectedSeatSelections)
//                   .flat()
//                   .includes(seat);

//                 return (
//                   <Box
//                     key={rowIndex}
//                     textAlign="center"
//                     width="60px" // Increased width for better visibility
//                     height="40px" // Set a fixed height for uniformity
//                     border={`1px solid ${getSeatBorderColor(seat)}`} // Use the seat border color
//                     bgcolor={isSelected ? "lightgreen" : "white"} // Change color if selected
//                     onClick={() => handleSeatSelect(seat)}
//                     display="flex"
//                     alignItems="center" // Center the seat number vertically
//                     justifyContent="center" // Center the seat number horizontally
//                     mx={1} // Horizontal margin for spacing between seats
//                     borderRadius={1} // Optional: Add some rounding to the corners
//                   >
//                     {seat} {/* Seat number */}
//                   </Box>
//                 );
//               })}
//             </Box>
//           ))}
//           <Box
//             sx={{
//               display: "flex",
//               flexDirection: "row",
//               justifyContent: "center",
//               alignItems: "center",
//               gap: 2,
//             }}
//           >
//             <Box
//               sx={{
//                 height: "10px",
//                 width: "10px",
//                 borderRadius: "50%",
//                 border: "2px solid red",
//                 backgroundColor: "red",
//                 mr: 1,
//               }}
//             />
//             <Typography variant="body1">Business Class</Typography>

//             <Box
//               sx={{
//                 height: "10px",
//                 width: "10px",
//                 borderRadius: "50%",
//                 border: "2px solid yellow",
//                 backgroundColor: "yellow",
//                 mr: 1,
//               }}
//             />
//             <Typography variant="body1">First Class</Typography>

//             <Box
//               sx={{
//                 height: "10px",
//                 width: "10px",
//                 borderRadius: "50%",
//                 border: "2px solid blue",
//                 backgroundColor: "blue",
//                 mr: 1,
//               }}
//             />
//             <Typography variant="body1">Economy</Typography>
//           </Box>
//         </Box>
//       </Grid>
//     );
//   };
//   const renderAdditionals = () => {
//     return (
//       <Box>
//         {additionalProducts.map((product) => (
//           <Box>
//             <FormControlLabel
//               key={product.name}
//               control={
//                 <Checkbox
//                   checked={additionalSelections[product.name] !== undefined}
//                   onChange={() =>
//                     handleAdditionalSelect(product.name, product.price)
//                   }
//                 />
//               }
//               label={`${product.name} - $${product.price}`}
//             />
//           </Box>
//         ))}
//       </Box>
//     );
//   };

//   const renderReview = () => {
//     const selectedSeats = Object.entries(selectedSeatSelections).flatMap(
//       ([category, seats]) => seats.map((seat) => `${seat} (${category})`)
//     );

//     return (
//       <Box>
//         <Typography variant="h6">
//           Selected Flight: {selectedFlight.flightName}
//         </Typography>
//         <Typography variant="h6">
//           Selected Seats: {selectedSeats.join(", ")}
//         </Typography>
//         <Typography variant="h6">Additional Products:</Typography>
//         <ul>
//           {Object.keys(additionalSelections).map((key) => (
//             <li key={key}>
//               {key} - ${additionalSelections[key]}
//             </li>
//           ))}
//         </ul>
//         <Typography variant="h5">Total Fare: ${totalFare}</Typography>
//       </Box>
//     );
//   };

//   return (
//     <Box>
//       <Stepper activeStep={activeStep}>
//         {steps.map((label) => (
//           <Step key={label}>
//             <StepLabel>{label}</StepLabel>
//           </Step>
//         ))}
//       </Stepper>

//       <Box mt={2}>
//         {activeStep === 0 && renderSeats()}

//         {activeStep === 1 && (
//           <Box>
//             <Typography variant="h6">Select Additional Products:</Typography>
//             {renderAdditionals()}
//           </Box>
//         )}

//         {activeStep === 2 && renderReview()}

//         <Box mt={2}>
//           <Button
//             disabled={activeStep === 0}
//             onClick={handleBack}
//             sx={{ mr: 1 }}
//           >
//             Back
//           </Button>
//           {bookingConfirmed ? (
//             <Button variant="contained" onClick={handleDownloadPDF}>
//               Download PDF
//             </Button>
//           ) : (
//             <Button variant="contained" onClick={handleNext}>
//               {activeStep === steps.length - 1 ? "Confirm Booking" : "Next"}
//             </Button>
//           )}
//         </Box>
//       </Box>

//       {/* Snackbar for success message */}
//       <Snackbar
//         open={openSnackbar}
//         autoHideDuration={3000}
//         onClose={handleSnackbarClose}
//       >
//         <Alert onClose={handleSnackbarClose} severity="success">
//           Booking Confirmed!
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default TicketStepper;


import React, { useState } from "react";
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Grid,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import jsPDF from "jspdf";

const additionalProducts = [
  { name: "Extra Baggage", price: 50 },
  { name: "Meal Plan", price: 30 },
  { name: "Priority Boarding", price: 20 },
];

const TicketStepper = ({
  selectedFlight,
  seatLayout,
  seatCategories,
  selectedSeats,
  onTotalFare,
  setSelectedSeats,
}) => {
  const steps = ["Select Seat", "Select Additionals", "Review"];
  const [activeStep, setActiveStep] = useState(0);
  const [selectedSeatSelections, setSelectedSeatSelections] = useState({});
  const [additionalSelections, setAdditionalSelections] = useState({});
  const [totalFare, setTotalFare] = useState(0);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false); 

  const handleSeatSelect = (seat) => {
    const isSelected = Object.values(selectedSeatSelections)
      .flat()
      .includes(seat);
    const rowIndex = parseInt(seat[0]) - 1; 
    const farePerSeat = seatCategories.find((category) =>
      category.rows.includes(rowIndex)
    ).price;

    const newTotalFare = isSelected
      ? totalFare - farePerSeat
      : totalFare + farePerSeat;

    setSelectedSeatSelections((prev) => {
      const updatedSeats = isSelected
        ? Object.entries(prev).reduce((acc, [key, seats]) => {
            const filteredSeats = seats.filter((s) => s !== seat);
            acc[key] = filteredSeats;
            return acc;
          }, {})
        : {
            ...prev,
            [farePerSeat]: [...(prev[farePerSeat] || []), seat],
          };
      return updatedSeats;
    });

    setTotalFare(newTotalFare);
    onTotalFare(newTotalFare);
    setSelectedSeats((prev) => ({
      ...prev,
      [selectedFlight.flightName]: Object.values(selectedSeatSelections).flat(),
    }));
  };

  const getSeatBorderColor = (seat) => {
    const seatLabel = typeof seat === "string" ? seat : seat.label; 
    const rowIndex = parseInt(seatLabel.match(/\d+/)[0]) - 1; 

    const category = seatCategories.find((cat) => cat.rows.includes(rowIndex));

    switch (category?.name) {
      case "Business":
        return "red";
      case "First Class":
        return "yellow";
      case "Economy":
        return "blue";
      default:
        return "gray"; 
    }
  };

  const handleAdditionalSelect = (product, price) => {
    setAdditionalSelections((prev) => {
      const isSelected = prev[product] !== undefined;
      const newSelections = isSelected
        ? { ...prev }
        : { ...prev, [product]: price };
      const newTotalFare = totalFare + (isSelected ? -price : price);
      setTotalFare(newTotalFare);
      onTotalFare(newTotalFare);

      if (isSelected) {
        delete newSelections[product];
      }
      return newSelections;
    });
  };

  const handleNext = () => {
    if (
      activeStep === 0 &&
      Object.values(selectedSeatSelections).flat().length === 0
    ) {
      alert("Please select at least one seat.");
      return;
    }
    if (activeStep === 2) {

      const selectedSeats = Object.entries(selectedSeatSelections).flatMap(
        ([category, seats]) => seats.map((seat) => `${seat} (${category})`)
      );
      const booking = {
        flight: selectedFlight.flightName,
        seats: selectedSeats,
        additionals: additionalSelections,
        totalFare,
      };
      setBookingDetails(booking); 
      setBookingConfirmed(true); 
      setOpenSnackbar(true); 
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleDownloadPDF = () => {
    if (!bookingDetails) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Booking Details", 10, 10);
    doc.setFontSize(12);
    doc.text(`Flight: ${bookingDetails.flight}`, 10, 30);
    doc.text(`Seats: ${bookingDetails.seats.join(", ")}`, 10, 40);
    doc.text("Additional Products:", 10, 50);
    Object.entries(bookingDetails.additionals).forEach(
      ([key, price], index) => {
        doc.text(`${key}: $${price}`, 10, 60 + index * 10);
      }
    );
    doc.text(`Total Fare: $${bookingDetails.totalFare}`, 10, 80);
    doc.save("booking-details.pdf"); 
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false); 
  };

  const renderSeats = () => {
    const columnCount = seatLayout.seatConfiguration[0].length; 

    const transposedLayout = Array(columnCount)
      .fill()
      .map((_, colIndex) =>
        seatLayout.seatConfiguration.map((row) => row[colIndex])
      );

    return (
      <Grid container spacing={2}>
        <Box
          display="flex"
          flexDirection="column"
          mt={2}
          sx={{ overflow: "scroll" }}
        >
          {transposedLayout.map((seatColumn, columnIndex) => (
            <Box
              key={columnIndex}
              display="flex"
              flexDirection="row"
              justifyContent="space-between" 
              mb={2} 
              flexGrow={1} 
            >
              {seatColumn.map((seat, rowIndex) => {
                const isSelected = Object.values(selectedSeatSelections)
                  .flat()
                  .includes(seat);

                return (
                  <Box
                    key={rowIndex}
                    textAlign="center"
                    width="60px" 
                    height="40px" 
                    border={`1px solid ${getSeatBorderColor(seat)}`} 
                    bgcolor={isSelected ? "lightgreen" : "white"} 
                    onClick={() => handleSeatSelect(seat)}
                    display="flex"
                    alignItems="center" 
                    justifyContent="center" 
                    mx={1} 
                    borderRadius={1} 
                  >
                    {seat} {}
                  </Box>
                );
              })}
            </Box>
          ))}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                height: "10px",
                width: "10px",
                borderRadius: "50%",
                border: "2px solid red",
                backgroundColor: "red",
                mr: 1,
              }}
            />
            <Typography variant="body1">Business Class</Typography>

            <Box
              sx={{
                height: "10px",
                width: "10px",
                borderRadius: "50%",
                border: "2px solid yellow",
                backgroundColor: "yellow",
                mr: 1,
              }}
            />
            <Typography variant="body1">First Class</Typography>

            <Box
              sx={{
                height: "10px",
                width: "10px",
                borderRadius: "50%",
                border: "2px solid blue",
                backgroundColor: "blue",
                mr: 1,
              }}
            />
            <Typography variant="body1">Economy</Typography>
          </Box>
        </Box>
      </Grid>
    );
  };
  const renderAdditionals = () => {
    return (
      <Box>
        {additionalProducts.map((product) => (
          <Box>
            <FormControlLabel
              key={product.name}
              control={
                <Checkbox
                  checked={additionalSelections[product.name] !== undefined}
                  onChange={() =>
                    handleAdditionalSelect(product.name, product.price)
                  }
                />
              }
              label={`${product.name} - $${product.price}`}
            />
          </Box>
        ))}
      </Box>
    );
  };

  const renderReview = () => {
    const selectedSeats = Object.entries(selectedSeatSelections).flatMap(
      ([category, seats]) => seats.map((seat) => `${seat} (${category})`)
    );

    return (
      <Box>
        <Typography variant="h6">
          Selected Flight: {selectedFlight.flightName}
        </Typography>
        <Typography variant="h6">
          Selected Seats: {selectedSeats.join(", ")}
        </Typography>
        <Typography variant="h6">Additional Products:</Typography>
        <ul>
          {Object.keys(additionalSelections).map((key) => (
            <li key={key}>
              {key} - ${additionalSelections[key]}
            </li>
          ))}
        </ul>
        <Typography variant="h5">Total Fare: ${totalFare}</Typography>
      </Box>
    );
  };

  return (
    <Box>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box mt={2}>
        {activeStep === 0 && renderSeats()}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6">Select Additional Products:</Typography>
            {renderAdditionals()}
          </Box>
        )}

        {activeStep === 2 && renderReview()}

        <Box mt={2}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          {bookingConfirmed ? (
            <Button variant="contained" onClick={handleDownloadPDF}>
              Download PDF
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Confirm Booking" : "Next"}
            </Button>
          )}
        </Box>
      </Box>

      {}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          Booking Confirmed!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TicketStepper;