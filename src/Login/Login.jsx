import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Box,
  CircularProgress,
} from "@mui/material";

const generateCaptcha = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const Login = ({ open, onClose }) => {
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [userInputCaptcha, setUserInputCaptcha] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  const handleSendOtp = () => {
    setOtpLoading(true);
    setTimeout(() => {
      const generatedOtp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      setOtp(generatedOtp);
      setOtpVisible(true);
      setOtpLoading(false);
    }, 2000);
  };

  const handleLogin = () => {
    setLoading(true);
    let userDetails = {};

    if (loginMethod === "mobile") {
      userDetails = { mobile, otp: enteredOtp };
    } else {
      userDetails = { email, password };
    }

    setTimeout(() => {
      if (userInputCaptcha === captcha) {
        if (loginMethod === "mobile" && enteredOtp !== otp) {
          alert("Incorrect OTP. Please try again!");
        } else {
          login(userDetails);
          alert("Logged in successfully!");
          onClose();
        }
      } else {
        alert("Incorrect CAPTCHA. Please try again!");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Login</DialogTitle>

      <DialogContent>
        <Typography>Select Login Type</Typography>
        <FormControl fullWidth margin="normal">
          <Select
            value={loginMethod}
            onChange={(e) => {
              setLoginMethod(e.target.value);
              setOtpVisible(false);
              setMobile("");
              setEmail("");
              setPassword("");
              setEnteredOtp("");
            }}
          >
            <MenuItem value="mobile">Mobile Number</MenuItem>
            <MenuItem value="email">Email</MenuItem>
          </Select>
        </FormControl>

        {loginMethod === "mobile" ? (
          <>
            <Typography>Mobile Number</Typography>
            <TextField
              fullWidth
              margin="normal"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              variant="outlined"
            />
            <Box display="flex" alignItems="center">
              <Button onClick={handleSendOtp} disabled={otpLoading}>
                {otpLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Send OTP"
                )}
              </Button>
              {otpVisible && (
                <Typography variant="body1" marginLeft={2}>
                  OTP: {otp}
                </Typography>
              )}
            </Box>
            {otpVisible && (
              <>
                <Typography>Enter OTP</Typography>
                <TextField
                  fullWidth
                  margin="normal"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  variant="outlined"
                />
              </>
            )}
          </>
        ) : (
          <>
            <Typography>Email</Typography>
            <TextField
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
            />
            <Typography>Password</Typography>
            <TextField
              fullWidth
              margin="normal"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {loading ? <CircularProgress size={24} /> : "Login"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Login;
