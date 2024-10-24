import React, { useState } from "react";
import {
  Box,
  Typography,
  Checkbox,
  Button,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import { useLocation } from "react-router-dom";
// Sample Bus Data
import { bus } from "../data"; // Assuming the bus data is exported from a file named busData.js

const FilterBus = ({ onFilter }) => {
  // State for filters
  const location = useLocation();
  const { formData } = location.state;
  const [selectedFares, setSelectedFares] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);

  // Get outbound trips based on source and destination
  const outboundTrips = bus.filter(
    (item) =>
      item.source === formData.source &&
      item.destination === formData.destination
  );

  // Extract unique stops from outboundTrips
  const uniqueStops = Array.from(new Set(outboundTrips.flatMap(bus => bus.stops)));

  // Time slots for filtering
  const timeSlots = [
    { label: "Morning (6 AM - 12 PM)", value: "morning" },
    { label: "Afternoon (12 PM - 6 PM)", value: "afternoon" },
    { label: "Evening (6 PM - 9 PM)", value: "evening" },
    { label: "Night (9 PM - 6 AM)", value: "night" },
  ];

  // Fare ranges
  const fareRanges = [
    { label: "$0 - $25", value: "0-25", min: 0, max: 25 },
    { label: "$26 - $50", value: "26-50", min: 26, max: 50 },
    { label: "$51 - $75", value: "51-75", min: 51, max: 75 },
    { label: "$76 - $100", value: "76-100", min: 76, max: 100 },
    { label: "$101+", value: "101+", min: 101, max: Infinity },
  ];

  // Handle filter changes
  const handleFareChange = (event) => {
    const selectedRange = event.target.value;
    setSelectedFares((prev) =>
      prev.includes(selectedRange)
        ? prev.filter((fare) => fare !== selectedRange)
        : [...prev, selectedRange]
    );
  };

  const handleTimeSlotsChange = (event) => {
    const selectedSlot = event.target.value;
    setSelectedTimeSlots((prev) =>
      prev.includes(selectedSlot)
        ? prev.filter((slot) => slot !== selectedSlot)
        : [...prev, selectedSlot]
    );
  };

  const handleStopSelection = (event) => {
    const { value } = event.target;
    setSelectedStops((prevSelectedStops) =>
      prevSelectedStops.includes(value)
        ? prevSelectedStops.filter((stop) => stop !== value)
        : [...prevSelectedStops, value]
    );
  };

  // Function to get selected fare ranges
  const getFareRangeValues = (selectedFares) => {
    return fareRanges.filter((range) => selectedFares.includes(range.value));
  };

  const applyFilter = () => {
    const filterData = {
      fareRange: selectedFares,
      uniqueStops: selectedStops,
      timeSlots: selectedTimeSlots,
    };
    onFilter(filterData);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6">Filter Buses</Typography>

      {/* Fare Filter (Checkboxes) */}
      <Box sx={{ my: 2 }}>
        <Typography gutterBottom>Fare Range</Typography>
        <FormGroup>
          {fareRanges.map((range, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  value={range.value}
                  checked={selectedFares.includes(range.value)}
                  onChange={handleFareChange}
                />
              }
              label={range.label}
            />
          ))}
        </FormGroup>
      </Box>

      {/* Stops Filter */}
      <Box>
        <Typography variant="h6">Select Stops</Typography>
        {uniqueStops.map((stop) => (
          <FormControlLabel
            key={stop}
            control={
              <Checkbox
                checked={selectedStops.includes(stop)}
                onChange={handleStopSelection}
                value={stop}
              />
            }
            label={stop}
          />
        ))}
      </Box>

      {/* Time Slots Filter (Checkboxes) */}
      <Box sx={{ my: 2 }}>
        <Typography gutterBottom>Time Range</Typography>
        <FormGroup>
          {timeSlots.map((slot, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  value={slot.value}
                  checked={selectedTimeSlots.includes(slot.value)}
                  onChange={handleTimeSlotsChange}
                />
              }
              label={slot.label}
            />
          ))}
        </FormGroup>
      </Box>

      {/* Apply Filter Button */}
      <Button variant="contained" color="primary" onClick={applyFilter}>
        Apply Filter
      </Button>
    </Box>
  );
};

export default FilterBus;
