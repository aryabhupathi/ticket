  // const renderSeats = () => {
  //   const columnCount = layout.seatConfiguration[0].length; // 4 seats per row

  //   // Transpose the seat layout to group by columns
  //   const transposedLayout = Array(columnCount).fill().map((_, colIndex) => 
  //     layout.seatConfiguration.map((row) => row[colIndex])
  //   );

  //   return (
  //     <Grid container spacing={2}>
  //       <Box display="flex" flexDirection="column" mt={2}>
  //         {/* Iterate through each column */}
  //         {transposedLayout.map((seatColumn, columnIndex) => (
  //           <Box key={columnIndex} display="flex" flexDirection="row" justifyContent="space-around" mb={1}>
  //             {/* Display each seat in the column */}
  //             {seatColumn.map((seat, rowIndex) => {
  //               const isSelected = Object.values(selectedSeatSelections).flat().includes(seat);
  //               return (
  //                 <Box
  //                   key={rowIndex}
  //                   textAlign="center"
  //                   width="50px"
  //                   border="1px solid black"
  //                   bgcolor={isSelected ? "lightgreen" : "white"} // Change color if selected
  //                   onClick={() => handleSeatSelect(seat, rowIndex)}
  //                 >
  //                   {seat}
  //                 </Box>
  //               );
  //             })}
  //           </Box>
  //         ))}
  //       </Box>
  //     </Grid>
  //   );
  // };
