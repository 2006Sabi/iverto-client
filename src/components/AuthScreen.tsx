import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/store/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { addNotification } from "@/store/slices/uiSlice";
import { Spinner } from "@/components/ui/loading";
import { dataInitializer } from "@/services/dataInitializer";
import { useSendOTPMutation, useVerifyOTPMutation } from "@/store/api/authApi";
import { OtpVerification } from "./OtpVerification";

// Color palette
const palette = {
  primary: "#cd0447",
  cherub: "#f6d0db",
  cranberry: "#e05b80",
  deepBlush: "#e77b9c",
  carissma: "#e7849c",
  cabaret: "#dc3c74",
  maroonFlush: "#d41b5c",
};

export const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Registration state
  const [regStep, setRegStep] = useState<"form" | "otp">("form");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCompanyName, setRegCompanyName] = useState("");
  const [regOtp, setRegOtp] = useState("");
  const [regError, setRegError] = useState("");
  const [regCountdown, setRegCountdown] = useState(0);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading, error: loginApiError, isSuccess }] =
    useLoginMutation();
  const [sendOTP, { isLoading: isSendingOTP, error: sendOTPError }] =
    useSendOTPMutation();
  const [
    verifyOTP,
    {
      isLoading: isVerifyingOTP,
      error: verifyOTPError,
      isSuccess: isRegSuccess,
    },
  ] = useVerifyOTPMutation();

  const signUpNameInputRef = useRef<HTMLInputElement>(null);
  const loginEmailInputRef = useRef<HTMLInputElement>(null);

  // Login error handling
  useEffect(() => {
    if (loginApiError) {
      const errorMessage =
        "data" in loginApiError
          ? (loginApiError.data as any)?.message || "Login failed"
          : "Network error occurred";
      setLoginError(errorMessage);
    }
  }, [loginApiError]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(
        addNotification({
          type: "success",
          title: "Login Successful",
          message: "Welcome to Iverto AI",
        })
      );
      setEmail("");
      setPassword("");
      setLoginError("");
      (async () => {
        dataInitializer.clearCache();
        await dataInitializer.initialize();
        await dataInitializer.refreshCamerasData();
        navigate("/dashboard");
        setTimeout(() => {
          window.location.reload();
        }, 300);
      })();
    }
  }, [isSuccess, dispatch, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const result = await login({ email, password }).unwrap();
      if (result.success && result.data) {
        const { token, refreshToken, user } = result.data;
        dispatch(setCredentials({ user, token, refreshToken }));
        if (user.isApproved === false) {
          setLoginError(
            `Hey ${user.name}, your registration is pending approval.`
          );
        } else {
          dispatch(
            addNotification({
              type: "success",
              title: "Login Successful",
              message: "Welcome to Iverto AI",
            })
          );
        }
      } else {
        setLoginError("Login failed: Invalid response format");
      }
    } catch (err) {
      // Error is handled by the useEffect above
    }
  };

  // Registration: OTP countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (regCountdown > 0) {
      timer = setTimeout(() => setRegCountdown(regCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [regCountdown]);

  // Registration: error handling
  useEffect(() => {
    if (sendOTPError) {
      const errorMessage =
        "data" in sendOTPError
          ? (sendOTPError.data as any)?.message || "Failed to send OTP"
          : "Network error occurred";
      setRegError(errorMessage);
    }
  }, [sendOTPError]);

  useEffect(() => {
    if (verifyOTPError) {
      const errorMessage =
        "data" in verifyOTPError
          ? (verifyOTPError.data as any)?.message || "OTP verification failed"
          : "Network error occurred";
      setRegError(errorMessage);
    }
  }, [verifyOTPError]);

  useEffect(() => {
    if (isRegSuccess) {
      dispatch(
        addNotification({
          type: "success",
          title: "Registration Successful",
          message: "Welcome to Iverto AI! You are now logged in.",
        })
      );
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegCompanyName("");
      setRegOtp("");
      setRegError("");
      setRegStep("form");
      setIsSignUp(false); // Switch to login panel
      (async () => {
        dataInitializer.clearCache();
        await dataInitializer.initialize();
        navigate("/dashboard");
      })();
    }
  }, [isRegSuccess, dispatch, navigate]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (!regName || !regEmail || !regPassword || !regCompanyName) {
      setRegError("Please fill in all fields");
      return;
    }
    try {
      await sendOTP({
        name: regName,
        email: regEmail,
        companyName: regCompanyName,
      }).unwrap();
      setRegCountdown(60);
      dispatch(
        addNotification({
          type: "success",
          title: "OTP Sent",
          message: "Please check your email for the verification code.",
        })
      );
      // Navigate to OTP verification page with registration data
      navigate("/otp-verification", {
        state: {
          email: regEmail,
          name: regName,
          password: regPassword,
          companyName: regCompanyName,
        },
      });
    } catch (err) {}
  };

  const handleVerifyOTP = async (otpValue: string) => {
    setRegError("");
    try {
      const result = await verifyOTP({
        email: regEmail,
        otp: otpValue,
        name: regName,
        password: regPassword,
        companyName: regCompanyName,
      }).unwrap();
      if (result.success && result.data) {
        const { token, refreshToken, user } = result.data;
        dispatch(setCredentials({ user, token, refreshToken }));
        if (user.isApproved === false) {
          navigate("/pending-registration");
          return;
        }
        dispatch(
          addNotification({
            type: "success",
            title: "Registration Successful",
            message: "Welcome to Iverto AI! You are now logged in.",
          })
        );
        setRegName("");
        setRegEmail("");
        setRegPassword("");
        setRegCompanyName("");
        setRegOtp("");
        setRegError("");
        setRegStep("form");
        setIsSignUp(false);
        setTimeout(() => {
          loginEmailInputRef.current?.focus();
        }, 400);
        (async () => {
          dataInitializer.clearCache();
          await dataInitializer.initialize();
          navigate("/dashboard");
        })();
      } else {
        setRegError("Registration failed: Invalid response format");
      }
    } catch (err) {}
  };

  const handleResendOTP = async () => {
    setRegError("");
    try {
      await sendOTP({
        name: regName,
        email: regEmail,
        companyName: regCompanyName,
      }).unwrap();
      setRegCountdown(60);
      dispatch(
        addNotification({
          type: "success",
          title: "OTP Resent",
          message: "A new verification code has been sent to your email.",
        })
      );
    } catch (err) {}
  };

  const handleBackToForm = () => {
    setRegStep("form");
    setRegOtp("");
    setRegError("");
    setRegCountdown(0);
  };

  // OTP Verification step for registration
  if (isSignUp && regStep === "otp") {
    // REMOVE this block, navigation now handles OTP step
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: `url('/src/background.jpg') center center / cover no-repeat fixed`,
      }}
    >
      <div className={`auth-container${isSignUp ? " right-panel-active" : ""}`}>
        {" "}
        {/* Main container */}
        {/* Sign Up Panel */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSendOTP}>
            <h1>Create Account</h1>
            <input
              ref={signUpNameInputRef}
              type="text"
              placeholder="Name"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              disabled={isSendingOTP}
              required
              autoComplete="username"
            />
            <input
              type="text"
              placeholder="Company Name"
              value={regCompanyName}
              onChange={(e) => setRegCompanyName(e.target.value)}
              disabled={isSendingOTP}
              required
              autoComplete="organization"
            />
            <input
              type="email"
              placeholder="Email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              disabled={isSendingOTP}
              required
              autoComplete="email"
            />
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showRegPassword ? "text" : "password"}
                placeholder="Password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                disabled={isSendingOTP}
                required
                autoComplete="new-password"
                style={{ width: "100%", paddingRight: "40px" }}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowRegPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: palette.primary,
                  cursor: "pointer",
                }}
                aria-label={showRegPassword ? "Hide password" : "Show password"}
              >
                {showRegPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="24"
                    fill="none"
                    viewBox="0 0 12 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-10.5-7.5a10.05 10.05 0 012.876-4.425m2.122-1.768A9.956 9.956 0 0112 5c5 0 9.27 3.11 10.5 7.5a9.956 9.956 0 01-4.198 5.568M15 12a3 3 0 11-6 0 3 3 0 016 0zm-7.5 7.5l15-15"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M1.5 12C2.73 7.61 7 4.5 12 4.5s9.27 3.11 10.5 7.5c-1.23 4.39-5.5 7.5-10.5 7.5S2.73 16.39 1.5 12zm10.5 3a3 3 0 100-6 3 3 0 000 6z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {regError && <div className="error-message">{regError}</div>}
            <button
              type="submit"
              disabled={
                isSendingOTP ||
                !regName ||
                !regEmail ||
                !regPassword ||
                !regCompanyName
              }
            >
              {isSendingOTP ? <span>Sending OTP...</span> : "Register"}
            </button>
          </form>
        </div>
        {/* Sign In Panel */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLoginSubmit}>
            <h1>Sign in</h1>
            <div className="social-container">
              <a href="#" className="social">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social">
                <i className="fab fa-google-plus-g"></i>
              </a>
              <a href="#" className="social">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
            <span>or use your account</span>
            <input
              ref={loginEmailInputRef}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="current-password"
            />
            <a href="#">Forgot your password?</a>
            {loginError && <div className="error-message">{loginError}</div>}
            <button type="submit" disabled={isLoading || !email || !password}>
              {isLoading ? <span>Signing in...</span> : "Sign In"}
            </button>
          </form>
        </div>
        {/* Overlay Panel */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>
                To keep connected with us please login with your personal info
              </p>
              <button
                className="ghost"
                onClick={() => {
                  setIsSignUp(false);
                  setRegStep("form");
                }}
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button
                className="ghost"
                onClick={() => {
                  setIsSignUp(true);
                  setTimeout(() => {
                    signUpNameInputRef.current?.focus();
                  }, 400); // Wait for panel animation
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
        {/* Add styles inline or import a CSS file for the double slider effect */}
        <style>{`
          .auth-container {
            /* background: linear-gradient(135deg, #cd0447 0%, #fff 100%); */
            background: rgba(255,255,255,0.5);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-radius: 10px;
            box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
            position: relative;
            overflow: hidden;
            width: 768px;
            max-width: 100%;
            min-height: 480px;
            margin: 40px auto;
          }
          .form-container {
            position: absolute;
            top: 0;
            height: 100%;
            transition: all 0.6s ease-in-out;
            background: rgba(255,255,255,0.3);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          }
          .sign-in-container {
            left: 0;
            width: 50%;
            z-index: 2;
          }
          .auth-container.right-panel-active .sign-in-container {
            transform: translateX(100%);
          }
          .sign-up-container {
            left: 0;
            width: 50%;
            opacity: 0;
            z-index: 1;
          }
          .auth-container.right-panel-active .sign-up-container {
            transform: translateX(100%);
            opacity: 1;
            z-index: 5;
            animation: show 0.6s;
          }
          @keyframes show {
            0%, 49.99% {
              opacity: 0;
              z-index: 1;
            }
            50%, 100% {
              opacity: 1;
              z-index: 5;
            }
          }
          .overlay-container {
            position: absolute;
            top: 0;
            left: 50%;
            width: 50%;
            height: 100%;
            overflow: hidden;
            transition: transform 0.6s ease-in-out;
            z-index: 100;
          }
          .auth-container.right-panel-active .overlay-container {
            transform: translateX(-100%);
          }
          .overlay {
            background: url('/background.jpg') center center / cover no-repeat fixed;
            background-repeat: no-repeat;
            background-size: cover;
            background-position: 0 0;
            color: #FFFFFF;
            position: relative;
            left: -100%;
            height: 100%;
            width: 200%;
            transform: translateX(0);
            transition: transform 0.6s ease-in-out;
          }
          .auth-container.right-panel-active .overlay {
            transform: translateX(50%);
          }
          .overlay-panel {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            padding: 0 40px;
            text-align: center;
            top: 0;
            height: 100%;
            width: 50%;
            transform: translateX(0);
            transition: transform 0.6s ease-in-out;
          }
          .overlay-left {
            transform: translateX(-20%);
          }
          .auth-container.right-panel-active .overlay-left {
            transform: translateX(0);
          }
          .overlay-right {
            right: 0;
            transform: translateX(0);
          }
          .auth-container.right-panel-active .overlay-right {
            transform: translateX(20%);
          }
          .social-container {
            margin: 20px 0;
          }
          .social-container a {
            border: 1px solid #DDDDDD;
            border-radius: 50%;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            margin: 0 5px;
            height: 40px;
            width: 40px;
          }
          .error-message {
            color: #fff;
            background: #e05b80;
            border-radius: 8px;
            padding: 8px 12px;
            margin: 10px 0;
          }
          form {
            background-color: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            padding: 0 50px;
            height: 100%;
            text-align: center;
          }
          input {
            background-color: #eee;
            border: none;
            padding: 12px 15px;
            margin: 8px 0;
            width: 100%;
          }
          button {
            border-radius: 20px;
            border: 1px solid #cd0447;
            background-color: #cd0447;
            color: #FFFFFF;
            font-size: 12px;
            font-weight: bold;
            padding: 12px 45px;
            letter-spacing: 1px;
            text-transform: uppercase;
            transition: transform 80ms ease-in;
          }
          button:active {
            transform: scale(0.95);
          }
          button:focus {
            outline: none;
          }
          button.ghost {
            background-color: transparent;
            border-color: #FFFFFF;
          }
        `}</style>
      </div>
    </div>
  );
};
