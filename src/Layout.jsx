// // src/Layout.js
// import React, { useState } from 'react';
// import { Box } from '@mui/material';
// import Chatbot from './ChatBot/ChatBot';

// const Layout = ({ children }) => {
//   const [botOpen, setBotOpen] = useState(false);

//   const handleBotToggle = () => {
//     setBotOpen(!botOpen);
//   };

//   return (
//     <Box sx={{ position: 'relative', minHeight: '100vh' }}>
//       {children}
//       <Box
//         sx={{
//           position: 'absolute',
//           bottom: 16,
//           right: 16,
//           cursor: 'pointer',
//           borderRadius: '50%',
//           backgroundColor: '#faf4cd',
//           boxShadow: 2,
//           padding: 1,
//         }}
//         onClick={handleBotToggle}
//       >
//         <img 
//           src={botOpen ? '../../cancel.png' : '../../robot.png'} 
//           alt={botOpen ? "Close" : "Open Chatbot"} 
//           height={50} 
//           width={50} 
//         />
//       </Box>
//       {botOpen && <Chatbot open={botOpen} onClose={() => setBotOpen(false)} />}
//     </Box>
//   );
// };

// export default Layout;



// src/Layout.js
// import React, { useState } from 'react';
// import { Box, AppBar, Toolbar, Typography, Button, Menu, MenuItem } from '@mui/material';
// import Chatbot from './ChatBot/ChatBot';
// import Login from './Login/Login';

// const Layout = ({ children, token }) => { // Expect token as a prop
//   const [botOpen, setBotOpen] = useState(false);
//   const [anchorEl, setAnchorEl] = useState(null);
// const [modalOpen ,setModalOpen] = useState(false)
//   const handleBotToggle = () => {
//     setBotOpen(!botOpen);
//   };

//   const handleMenuClick = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//   };

//   const handleLogout = () => {
//     // Implement logout logic here, e.g., clearing token
//     localStorage.removeItem('user'); // Example
//     handleMenuClose(); // Close the menu
//     // Optionally, redirect or show a message
//   };

//   return (
//     <Box sx={{ position: 'relative', minHeight: '100vh' }}>
//       {/* Header */}
//       <AppBar position="static">
//         <Toolbar sx={{ justifyContent: 'space-between' }}>
//           <Typography variant="h6">TripSure</Typography>
//           {token ? (
//             <Button color="inherit" onClick={handleLogout}>
//               LogOut
//             </Button>
//           ) : (
//             <Button color="inherit" onClick={() => setModalOpen(true)}>
//               Login
//             </Button>
//           )}
//         </Toolbar>
//       </AppBar>

//       {children}

//       {/* Chatbot toggle button */}
//       <Login
//             open={modalOpen}
//             onClose={() => setModalOpen(false)}
//           />
//       <Box
//         sx={{
//           position: 'absolute',
//           bottom: 16,
//           right: 16,
//           cursor: 'pointer',
//           borderRadius: '50%',
//           backgroundColor: '#faf4cd',
//           boxShadow: 2,
//           padding: 1,
//         }}
//         onClick={handleBotToggle}
//       >
//         <img 
//           src={botOpen ? '../../cancel.png' : '../../robot.png'} 
//           alt={botOpen ? "Close" : "Open Chatbot"} 
//           height={50} 
//           width={50} 
//         />
//       </Box>

//       {/* Chatbot component */}
//       {botOpen && <Chatbot open={botOpen} onClose={() => setBotOpen(false)} />}
//     </Box>
//   );
// };

// export default Layout;


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
    // Implement logout logic here, e.g., clearing token
    localStorage.removeItem('user'); // Example
    // Optionally, you can add a state update or a notification here
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* Header */}
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

      {/* Login Modal */}
      <Login
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccessfulLogin={() => {
          // You can add any additional logic here if needed after successful login
          setModalOpen(false);
        }}
      />

      {/* Chatbot toggle button */}
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

      {/* Chatbot component */}
      {botOpen && <Chatbot open={botOpen} onClose={() => setBotOpen(false)} />}
    </Box>
  );
};

export default Layout;
