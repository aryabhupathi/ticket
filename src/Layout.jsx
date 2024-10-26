import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import Chatbot from './ChatBot/ChatBot';
import Login from './Login/Login';

const Layout = ({ children, token }) => {
  const [botOpen, setBotOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleBotToggle = () => {
    setBotOpen(!botOpen);
  };

  const handleLogout = () => {

    localStorage.removeItem('user'); 

  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {}
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6">TripSure</Typography>
          {token ? (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" onClick={() => setModalOpen(true)}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {children}

      {}
      <Login
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccessfulLogin={() => {

          setModalOpen(false);
        }}
      />

      {}
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

      {}
      {botOpen && <Chatbot open={botOpen} onClose={() => setBotOpen(false)} />}
    </Box>
  );
};

export default Layout;