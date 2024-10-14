// src/Layout.js
import React, { useState } from 'react';
import { Box } from '@mui/material';
import Chatbot from './ChatBot/ChatBot';

const Layout = ({ children }) => {
  const [botOpen, setBotOpen] = useState(false);

  const handleBotToggle = () => {
    setBotOpen(!botOpen);
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {children}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          cursor: 'pointer',
          borderRadius: '50%',
          backgroundColor: '#faf4cd',
          boxShadow: 2,
          padding: 1,
        }}
        onClick={handleBotToggle}
      >
        <img 
          src={botOpen ? '../../cancel.png' : '../../robot.png'} 
          alt={botOpen ? "Close" : "Open Chatbot"} 
          height={50} 
          width={50} 
        />
      </Box>
      {botOpen && <Chatbot open={botOpen} onClose={() => setBotOpen(false)} />}
    </Box>
  );
};

export default Layout;
