// import React, { useState, useEffect } from "react";
// import { useAuth } from "./AuthContext";
// import { useNavigate } from "react-router-dom";
// import {
//   Container,
//   Typography,
//   TextField,
//   Button,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   CircularProgress,
//   Box,
// } from "@mui/material";

// const generateCaptcha = () => {
//   const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
//   let result = "";
//   for (let i = 0; i < 5; i++) {
//     result += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   return result;
// };

// const Login = () => {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [loginMethod, setLoginMethod] = useState("mobile");
//   const [mobile, setMobile] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [otp, setOtp] = useState("");
//   const [captcha, setCaptcha] = useState("");
//   const [userInputCaptcha, setUserInputCaptcha] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     setCaptcha(generateCaptcha());
//   }, []);

//   const handleLogin = async () => {
//     setLoading(true);
//     setError("");
//     let userDetails = {};

//     if (loginMethod === "mobile") {
//       userDetails = { mobile, otp };
//     } else {
//       userDetails = { email, password };
//     }

//     // Simulate a login request
//     try {
//       if (userInputCaptcha !== captcha) {
//         throw new Error("Incorrect CAPTCHA. Please try again!");
//       }

//       await login(userDetails); // Assume login returns a promise
//       alert("Logged in successfully!");
//       navigate("/"); // Navigate to the home page
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };


//   console.log(captcha, userInputCaptcha, "ucucucuccu");
//   return (
//     <Container maxWidth="sm">
//       <Typography variant="h4" component="h1" gutterBottom>
//         Login
//       </Typography>
//       <FormControl fullWidth margin="normal">
//         <InputLabel>Login Method</InputLabel>
//         <Select
//           value={loginMethod}
//           onChange={(e) => setLoginMethod(e.target.value)}
//         >
//           <MenuItem value="mobile">Mobile Number (OTP)</MenuItem>
//           <MenuItem value="email">Email & Password</MenuItem>
//         </Select>
//       </FormControl>

//       {loginMethod === "mobile" ? (
//         <>
//           <TextField
//             fullWidth
//             margin="normal"
//             value={mobile}
//             onChange={(e) => setMobile(e.target.value)}
//             label="Mobile Number"
//             variant="outlined"
//           />
//           <TextField
//             fullWidth
//             margin="normal"
//             value={otp}
//             onChange={(e) => setOtp(e.target.value)}
//             label="OTP"
//             variant="outlined"
//           />
//         </>
//       ) : (
//         <>
//           <TextField
//             fullWidth
//             margin="normal"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             label="Email"
//             variant="outlined"
//           />
//           <TextField
//             fullWidth
//             margin="normal"
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             label="Password"
//             variant="outlined"
//           />
//         </>
//       )}

//       <Box marginY={2}>
//         <Typography variant="body1">CAPTCHA: {captcha}</Typography>
//         <TextField
//           fullWidth
//           margin="normal"
//           value={userInputCaptcha}
//           onChange={(e) => setUserInputCaptcha(e.target.value)}
//           label="Enter CAPTCHA"
//           variant="outlined"
//         />
//         {error && <Typography color="error">{error}</Typography>}
//       </Box>

//       <Button
//         variant="contained"
//         color="primary"
//         onClick={handleLogin}
//         disabled={loading}
//         fullWidth
//       >
//         {loading ? <CircularProgress size={24} /> : "Login"}
//       </Button>
//     </Container>
//   );
// };

// export default Login;


import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Select, MenuItem, FormControl, InputLabel, Box, CircularProgress } from '@mui/material';

const generateCaptcha = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const Login = ({ open, onClose }) => {
    const { login } = useAuth();
    const [loginMethod, setLoginMethod] = useState('mobile');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [captcha, setCaptcha] = useState('');
    const [userInputCaptcha, setUserInputCaptcha] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setCaptcha(generateCaptcha());
    }, []);

    const handleLogin = () => {
        setLoading(true);
        let userDetails = {};

        if (loginMethod === 'mobile') {
            userDetails = { mobile, otp };
        } else {
            userDetails = { email, password };
        }

        // Simulate a successful login
        setTimeout(() => {
            if (userInputCaptcha === captcha) {
                login(userDetails);
                alert('Logged in successfully!');
                onClose(); // Close the modal
            } else {
                alert('Incorrect CAPTCHA. Please try again!');
            }
            setLoading(false);
        }, 1000);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Login</DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Login Method</InputLabel>
                    <Select value={loginMethod} onChange={(e) => setLoginMethod(e.target.value)}>
                        <MenuItem value="mobile">Mobile Number (OTP)</MenuItem>
                        <MenuItem value="email">Email & Password</MenuItem>
                    </Select>
                </FormControl>

                {loginMethod === 'mobile' ? (
                    <>
                        <TextField
                            fullWidth
                            margin="normal"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            label="Mobile Number"
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            label="OTP"
                            variant="outlined"
                        />
                    </>
                ) : (
                    <>
                        <TextField
                            fullWidth
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            label="Email"
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            label="Password"
                            variant="outlined"
                        />
                    </>
                )}

                <Box marginY={2}>
                    <Typography variant="body1">CAPTCHA: {captcha}</Typography>
                    <TextField
                        fullWidth
                        margin="normal"
                        value={userInputCaptcha}
                        onChange={(e) => setUserInputCaptcha(e.target.value)}
                        label="Enter CAPTCHA"
                        variant="outlined"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Login'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default Login;