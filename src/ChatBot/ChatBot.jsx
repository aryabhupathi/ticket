// src/Chatbot.js

import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Modal,
  Button,
} from "@mui/material";

const Chatbot = ({ open, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");
      // Simulate a response from the chatbot
      setTimeout(() => {
        const response = getResponse(input);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: response, sender: "bot" },
        ]);
      }, 1000);
    }
  };

  const getResponse = (userInput) => {
    // Define your bot's responses
    const responses = {
      hello: "Hello! How can I assist you with your ticket reservation?",
      "how to book a ticket":
        "You can book a ticket by selecting the event and choosing the number of tickets.",
      "what is the refund policy":
        "Tickets are refundable up to 24 hours before the event.",
      "thank you":
        "You're welcome! Let me know if you have any other questions.",
    };

    // Normalize user input for matching
    const normalizedInput = userInput.toLowerCase();
    return (
      responses[normalizedInput] || "I'm sorry, I didn't understand that."
    );
  };

  return (
    <Box
      sx={{
        position: "fixed", // Changed to fixed to stay in the viewport
        bottom: 80, // Adjust to position above the bottom
        right: 20, // Adjust to position from the right
        width: 300,
        bgcolor: "background.paper",
        boxShadow: 3, // Use a smaller shadow for a cleaner look
        borderRadius: "8px",
        overflow: "hidden",
      }}
      open={open}
      onClose={onClose}
    >
      <Paper elevation={3}>
        <Box sx={{ padding: 2, maxHeight: 400, overflowY: "auto" }}>
          <Typography variant="h6">Chatbot</Typography>
          <List>
            {messages.map((msg, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={msg.text}
                  secondary={msg.sender === "user" ? "You" : "Bot"}
                  sx={{ textAlign: msg.sender === "user" ? "right" : "left" }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box sx={{ display: "flex", padding: 1 }}>
          <TextField
            variant="outlined"
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <Button onClick={handleSend} variant="contained" sx={{ ml: 1 }}>
            Send
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Chatbot;
