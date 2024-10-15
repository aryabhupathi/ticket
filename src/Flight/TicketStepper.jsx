// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Stepper,
//   Step,
//   StepLabel,
//   Button,
//   Typography,
//   Grid,
//   Checkbox,
//   FormControlLabel,
// } from "@mui/material";

// // Additions for extra services
// const additions = [
//   { name: "Extra Baggage", price: 50 },
//   { name: "Meal", price: 20 },
//   { name: "Priority Boarding", price: 30 },
// ];

// const TicketStepper = ({
//   selectedFlight,
//   onFareUpdate,
//   onSeatSelect,
//   selectedSeats,
// }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [selectedSeatCategory, setSelectedSeatCategory] = useState(null);
//   const [selectedSeat, setSelectedSeat] = useState("");
//   const [selectedAdditions, setSelectedAdditions] = useState([]);
//   const [totalFare, setTotalFare] = useState(0);

//   const steps = ["Select Seat", "Select Additions", "Review Total Fare"];

//   // Effect to calculate total fare whenever seat category or additions change
//   useEffect(() => {
//     if (selectedSeatCategory) {
//       calculateTotalFare();
//     }
//   }, [selectedSeatCategory, selectedAdditions]);

//   const handleNext = () => {
//     if (activeStep === steps.length - 1) {
//       calculateTotalFare();
//     }
//     setActiveStep((prevActiveStep) => prevActiveStep + 1);
//   };

//   const handleBack = () => {
//     setActiveStep((prevActiveStep) => prevActiveStep - 1);
//   };

//   const handleSeatCategorySelect = (category) => {
//     setSelectedSeatCategory(category);
//     setTotalFare(category.fare); // Set the initial fare based on selected category
//     onFareUpdate(category.fare); // Notify parent about fare update
//   };

//   const handleSeatSelect = (seat) => {
//     setSelectedSeat(seat);
//     onSeatSelect(seat); // Notify parent about seat selection
//   };

//   const handleAdditionToggle = (addition) => {
//     const currentIndex = selectedAdditions.indexOf(addition);
//     const newSelected = [...selectedAdditions];

//     if (currentIndex === -1) {
//       newSelected.push(addition);
//     } else {
//       newSelected.splice(currentIndex, 1);
//     }

//     setSelectedAdditions(newSelected);
//   };

//   const calculateTotalFare = () => {
//     const additionsTotal = selectedAdditions.reduce(
//       (acc, item) => acc + item.price,
//       0
//     );
//     const seatFare = selectedSeatCategory?.fare || 0;
//     const total = seatFare + additionsTotal;
//     setTotalFare(total);
//     onFareUpdate(total); // Notify parent about total fare update
//   };

//   return (
//     <Box sx={{ width: "100%" }}>
//       <Stepper activeStep={activeStep} sx={{ marginBottom: 2 }}>
//         {steps.map((label, index) => (
//           <Step key={index}>
//             <StepLabel>{label}</StepLabel>
//           </Step>
//         ))}
//       </Stepper>

//       {/* Seat Category Selection */}
//       {activeStep === 0 && selectedFlight && (
//         <Box>
//           <Typography variant="h6">Select your seat category:</Typography>
//           <Grid container spacing={2} sx={{ marginTop: 2 }}>
//             {selectedFlight.categories.map((category) => (
//               <Grid item xs={12} sm={4} key={category.categoryName}>
//                 <Button
//                   variant={
//                     selectedSeatCategory?.categoryName === category.categoryName
//                       ? "contained"
//                       : "outlined"
//                   }
//                   color={category.color} // Use predefined colors based on category
//                   onClick={() => handleSeatCategorySelect(category)}
//                   fullWidth
//                 >
//                   {category.categoryName} (${category.fare}) -{" "}
//                   {category.noOfSeatsAvailable} seats available
//                 </Button>
//               </Grid>
//             ))}
//           </Grid>

//           {/* Seat Selection */}
//           {selectedSeatCategory && (
//             <Box sx={{ marginTop: 3 }}>
//               <Typography variant="h6">Select a seat:</Typography>
//               <Grid container spacing={1}>
//                 <Box display="flex" flexDirection="column" mt={2}>
//                   {/* {selectedFlight.layout.seatConfiguration.map((row, rowIndex) => (
//                     <Box key={rowIndex} display="flex" flexDirection="row" justifyContent="space-around" mb={1}>
//                       {row.map((seat, seatIndex) => {
//                         const isSelected = selectedSeats[selectedFlight.flightName]?.includes(seat) || false; // Fallback to false
//                         const isDisabled = selectedSeatCategory && !selectedSeatCategory.allowedSeats.includes(seat);

//                         return (
//                           <Box
//                             key={seatIndex}
//                             textAlign="center"
//                             width="50px"
//                             height="50px"
//                             border="1px solid black"
//                             sx={{
//                               backgroundColor: isSelected ? "green" : isDisabled ? "lightgray" : selectedSeatCategory.color,
//                               color: isSelected ? "white" : "black",
//                               cursor: isDisabled ? "not-allowed" : "pointer",
//                               display: "flex",
//                               alignItems: "center",
//                               justifyContent: "center",
//                               borderRadius: "4px",
//                               transition: "background-color 0.3s",
//                               "&:hover": {
//                                 backgroundColor: isDisabled ? "lightgray" : isSelected ? "darkgreen" : "gray",
//                               },
//                             }}
//                             onClick={() => !isDisabled && handleSeatSelect(seat)}
//                           >
//                             {seat}
//                           </Box>
//                         );
//                       })}
//                     </Box>
//                   ))} */}

//                   {selectedFlight.layout.seatConfiguration.map(
//                     (row, rowIndex) => (
//                       <Box
//                         key={rowIndex}
//                         display="flex"
//                         flexDirection="row"
//                         justifyContent="space-around"
//                         mb={1}
//                       >
//                         {row.map((seat, seatIndex) => {
//                           const isSelected = (
//                             selectedSeats[selectedFlight.flightName] || []
//                           ).includes(seat); // Provide a fallback to an empty array
//                           const isDisabled =
//                             selectedSeatCategory &&
//                             !selectedSeatCategory.allowedSeats.includes(seat);

//                           return (
//                             <Box
//                               key={seatIndex}
//                               textAlign="center"
//                               width="50px"
//                               height="50px"
//                               border="1px solid black"
//                               sx={{
//                                 backgroundColor: isSelected
//                                   ? "green"
//                                   : isDisabled
//                                   ? "lightgray"
//                                   : selectedSeatCategory.color,
//                                 color: isSelected ? "white" : "black",
//                                 cursor: isDisabled ? "not-allowed" : "pointer",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 borderRadius: "4px",
//                                 transition: "background-color 0.3s",
//                                 "&:hover": {
//                                   backgroundColor: isDisabled
//                                     ? "lightgray"
//                                     : isSelected
//                                     ? "darkgreen"
//                                     : "gray",
//                                 },
//                               }}
//                               onClick={() =>
//                                 !isDisabled && handleSeatSelect(seat)
//                               }
//                             >
//                               {seat}
//                             </Box>
//                           );
//                         })}
//                       </Box>
//                     )
//                   )}
//                 </Box>
//               </Grid>
//             </Box>
//           )}
//         </Box>
//       )}

//       {/* Additional Services Selection */}
//       {activeStep === 1 && (
//         <Box>
//           <Typography variant="h6">Select any additional services:</Typography>
//           {additions.map((addition, index) => (
//             <FormControlLabel
//               key={index}
//               control={
//                 <Checkbox
//                   checked={selectedAdditions.includes(addition)}
//                   onChange={() => handleAdditionToggle(addition)}
//                 />
//               }
//               label={`${addition.name} ($${addition.price})`}
//             />
//           ))}
//         </Box>
//       )}

//       {/* Review Total Fare */}
//       {activeStep === 2 && (
//         <Box>
//           <Typography variant="h6">Review your total fare:</Typography>
//           <Typography>
//             Selected Flight: <strong>{selectedFlight.flightName}</strong>
//           </Typography>
//           <Typography>
//             Selected Seat Category:{" "}
//             <strong>{selectedSeatCategory?.categoryName}</strong>
//           </Typography>
//           <Typography>
//             Selected Seat: <strong>{selectedSeat}</strong>
//           </Typography>
//           <Typography>Base Fare: ${selectedSeatCategory?.fare || 0}</Typography>
//           <Typography>
//             Additions: $
//             {selectedAdditions.reduce((acc, item) => acc + item.price, 0)}
//           </Typography>
//           <Typography variant="h5" sx={{ marginTop: 2 }}>
//             Total Fare: ${totalFare}
//           </Typography>
//         </Box>
//       )}

//       {/* Navigation Buttons */}
//       <Box
//         sx={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}
//       >
//         <Button disabled={activeStep === 0} onClick={handleBack}>
//           Back
//         </Button>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={handleNext}
//           disabled={activeStep === 0 && !selectedSeatCategory}
//         >
//           {activeStep === steps.length - 1 ? "Finish" : "Next"}
//         </Button>
//       </Box>
//     </Box>
//   );
// };

// export default TicketStepper;


import React, { useState, useEffect } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Grid,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

// Additions for extra services
const additions = [
  { name: "Extra Baggage", price: 50 },
  { name: "Meal", price: 20 },
  { name: "Priority Boarding", price: 30 },
];

const TicketStepper = ({ selectedFlight, onFareUpdate, onSeatSelect, selectedSeats }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedSeatCategory, setSelectedSeatCategory] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState("");
  const [selectedAdditions, setSelectedAdditions] = useState([]);
  const [totalFare, setTotalFare] = useState(0);

  const steps = ["Select Seat", "Select Additions", "Review Total Fare"];

  // Effect to calculate total fare whenever seat category or additions change
  useEffect(() => {
    calculateTotalFare();
  }, [selectedSeatCategory, selectedAdditions]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSeatCategorySelect = (category) => {
    setSelectedSeatCategory(category);
    setTotalFare(category.fare);
    onFareUpdate(category.fare);
  };

  const handleSeatSelect = (seat) => {
    setSelectedSeat(seat);
    onSeatSelect(seat);
  };

  const handleAdditionToggle = (addition) => {
    const currentIndex = selectedAdditions.indexOf(addition);
    const newSelected = [...selectedAdditions];

    if (currentIndex === -1) {
      newSelected.push(addition);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedAdditions(newSelected);
  };

  const calculateTotalFare = () => {
    const additionsTotal = selectedAdditions.reduce((acc, item) => acc + item.price, 0);
    const seatFare = selectedSeatCategory?.fare || 0;
    const total = seatFare + additionsTotal;
    setTotalFare(total);
    onFareUpdate(total);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={activeStep} sx={{ marginBottom: 2 }}>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Seat Category Selection */}
      {activeStep === 0 && selectedFlight && (
        <Box>
          <Typography variant="h6">Select your seat category:</Typography>
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            {selectedFlight.categories.map((category) => (
              <Grid item xs={12} sm={4} key={category.categoryName}>
                <Button
                  variant={selectedSeatCategory?.categoryName === category.categoryName ? "contained" : "outlined"}
                  color={category.color}
                  onClick={() => handleSeatCategorySelect(category)}
                  fullWidth
                >
                  {category.categoryName} (${category.fare}) - {category.noOfSeatsAvailable} seats available
                </Button>
              </Grid>
            ))}
          </Grid>

          {/* Seat Selection */}
          {selectedSeatCategory && (
            <Box sx={{ marginTop: 3 }}>
              <Typography variant="h6">Select a seat:</Typography>
              <Grid container spacing={1}>
                <Box display="flex" flexDirection="column" mt={2}>
                  {selectedFlight.layout.seatConfiguration.map((row, rowIndex) => (
                    <Box key={rowIndex} display="flex" flexDirection="row" justifyContent="space-around" mb={1}>
                      {row.map((seat, seatIndex) => {
                        {/* const isSelected = (selectedSeats[selectedFlight.flightName] || []).includes(seat);
                        const isDisabled = selectedSeatCategory && !selectedSeatCategory.allowedSeats.includes(seat); */}

                        return (
                          <Box
                            key={seatIndex}
                            textAlign="center"
                            width="50px"
                            height="50px"
                            border="1px solid black"
                            // sx={{
                            //   backgroundColor: isSelected ? "green" : isDisabled ? "lightgray" : selectedSeatCategory.color,
                            //   color: isSelected ? "white" : "black",
                            //   cursor: isDisabled ? "not-allowed" : "pointer",
                            //   display: "flex",
                            //   alignItems: "center",
                            //   justifyContent: "center",
                            //   borderRadius: "4px",
                            //   transition: "background-color 0.3s",
                            //   "&:hover": {
                            //     backgroundColor: isDisabled ? "lightgray" : isSelected ? "darkgreen" : "gray",
                            //   },
                            // }}
                            onClick={() =>handleSeatSelect(seat)}
                          >
                            {seat}
                          </Box>
                        );
                      })}
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Box>
          )}
        </Box>
      )}

      {/* Additional Services Selection */}
      {activeStep === 1 && (
        <Box>
          <Typography variant="h6">Select any additional services:</Typography>
          {additions.map((addition, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={selectedAdditions.includes(addition)}
                  onChange={() => handleAdditionToggle(addition)}
                />
              }
              label={`${addition.name} ($${addition.price})`}
            />
          ))}
        </Box>
      )}

      {/* Review Total Fare */}
      {activeStep === 2 && (
        <Box>
          <Typography variant="h6">Review your total fare:</Typography>
          <Typography>
            Selected Flight: <strong>{selectedFlight.flightName}</strong>
          </Typography>
          <Typography>
            Selected Seat Category: <strong>{selectedSeatCategory?.categoryName}</strong>
          </Typography>
          <Typography>
            Selected Seat: <strong>{selectedSeat}</strong>
          </Typography>
          <Typography>Base Fare: ${selectedSeatCategory?.fare || 0}</Typography>
          <Typography>
            Additions: ${selectedAdditions.reduce((acc, item) => acc + item.price, 0)}
          </Typography>
          <Typography variant="h5" sx={{ marginTop: 2 }}>
            Total Fare: ${totalFare}
          </Typography>
        </Box>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          disabled={activeStep === 0 && !selectedSeatCategory}
        >
          {activeStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </Box>
    </Box>
  );
};

export default TicketStepper;
