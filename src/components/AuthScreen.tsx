import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation, useSendOTPMutation } from "@/store/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { useToast } from "@/components/ui/custom-toaster";
import {
  FiEye,
  FiEyeOff,
  FiUser,
  FiHome,
  FiMail,
  FiLock,
} from "react-icons/fi";

export const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCompanyName, setRegCompanyName] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const [login, { isLoading }] = useLoginMutation();
  const [sendOTP, { isLoading: isSendingOTP }] = useSendOTPMutation();

  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width <= 768,
        isTablet: width > 768 && width <= 1024,
        isDesktop: width > 1024 && width <= 1440,
        isLargeDesktop: width > 1440,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLoginSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
      const { token, refreshToken, user } = result.data;
      dispatch(setCredentials({ user, token, refreshToken }));
      toast.success("Login Successful", "Welcome to Iverto AI");
      navigate("/dashboard");
    } catch {
      toast.error("Login Failed", "Invalid email or password");
    }
  };

  const handleSendOTP = async (e: any) => {
    e.preventDefault();
    try {
      await sendOTP({
        name: regName,
        email: regEmail,
        companyName: regCompanyName,
      }).unwrap();
      toast.success("OTP Sent", "Check your email");
      navigate("/otp-verification", {
        state: {
          email: regEmail,
          name: regName,
          password: regPassword,
          companyName: regCompanyName,
        },
      });
    } catch {
      toast.error("Registration Failed", "Unable to send OTP");
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: screenSize.isMobile ? "column" : "row",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        fontFamily: "'Poppins', sans-serif",
        // backgroundColor: "#f5f5f5", // Uncomment if you want a solid background, otherwise inherit from parent
      }}
    >
      {/* Logo */}
      <div
        style={{
          position: screenSize.isMobile ? "relative" : "absolute",
          top: screenSize.isMobile ? "0" : screenSize.isTablet ? 20 : 30,
          left: screenSize.isMobile ? "0" : screenSize.isTablet ? 20 : 30,
          display: "flex",
          alignItems: "center",
          marginBottom: screenSize.isMobile ? 30 : 0,
          zIndex: 2,
        }}
      >
        <img
          src="https://res.cloudinary.com/dhlhlbvea/image/upload/v1752658719/20250709_100851_ivkda1.png"
          alt="Logo"
          style={{
            height: "75px",
            marginRight: "1px",
          }}
        />
        <span
          style={{
            fontSize: "38px",
            fontWeight: "bold",
            color: "#cd0447",
          }}
        >
          iverto.ai
        </span>
      </div>

      {/* Top Right Image */}
      {!screenSize.isMobile && (
        <img
          src="https://res.cloudinary.com/dhlhlbvea/image/upload/v1752680588/Gemini_Generated_Image_ftuz4hftuz4hftuz_1_ahiiju.png"
          alt="Top Right"
          style={{
            position: "absolute",
            top: screenSize.isTablet ? -20 : -30,
            right: screenSize.isTablet ? -10 : -20,
            width: screenSize.isTablet ? "140px" : "180px",
            height: "auto",
            zIndex: 0,
          }}
        />
      )}

      {/* Background image */}
      {!screenSize.isMobile && (
        <img
          src="https://res.cloudinary.com/dhlhlbvea/image/upload/v1752658359/image1_annwl1.png"
          alt="Decorative"
          style={{
            position: "absolute",
            bottom: 0,
            left: screenSize.isTablet ? -10 : -5,
            width: screenSize.isTablet ? "360px" : "480px",
            height: "auto",
            zIndex: 0,
            top: screenSize.isTablet ? 120 : 180,
            opacity: 0.7,
          }}
        />
      )}

      {/* Quotes Section
      {!screenSize.isMobile && (
        <>
          <div style={getQuoteLineContainerStyle(screenSize, 1)}>
            <p style={getQuoteLineStyle(screenSize, 1)}>
              Empowering modern businesses through
            </p>
          </div>
          <div style={getQuoteLineContainerStyle(screenSize, 2)}>
            <p style={getQuoteLineStyle(screenSize, 2)}>
              AI-driven decision intelligence
            </p>
          </div>
          <div style={getQuoteLineContainerStyle(screenSize, 3)}>
            <p style={getQuoteLineStyle(screenSize, 3)}>
              Enable <span style={highlight}>automation</span>, detect{" "}
              <span style={highlight}>anomalies</span> &{" "}
              <span style={highlight}>innovate faster</span>.
            </p>
          </div>
        </>
      )} */}

      {/* Auth Form */}
      <div
        style={{
          width: screenSize.isMobile ? "100%" : "100%",
          maxWidth: screenSize.isMobile
            ? "100%"
            : screenSize.isTablet
            ? 400
            : 480,
          background: "#fff",
          padding: screenSize.isMobile ? 20 : screenSize.isTablet ? 30 : 40,
          borderRadius: 16,
          boxShadow: "0 0 30px rgba(0,0,0,0.08)",
          zIndex: 1,
          // Responsive positioning
          marginLeft: screenSize.isMobile
            ? 0
            : screenSize.isTablet
            ? "200px"
            : "880px",
          marginTop: screenSize.isMobile ? 20 : 0,
        }}
      >
        <form onSubmit={isSignUp ? handleSendOTP : handleLoginSubmit}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 20 }}>
            {isSignUp ? "Create Account" : "Sign In"}
          </h2>

          {isSignUp ? (
            <>
              <div style={{ position: "relative" }}>
                <FiUser style={inputIconStyle} />
                <input
                  type="text"
                  placeholder="Name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingLeft: "40px" }}
                />
              </div>
              <div style={{ position: "relative" }}>
                <FiHome style={inputIconStyle} />
                <input
                  type="text"
                  placeholder="Company Name"
                  value={regCompanyName}
                  onChange={(e) => setRegCompanyName(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingLeft: "40px" }}
                />
              </div>
              <div style={{ position: "relative" }}>
                <FiMail style={inputIconStyle} />
                <input
                  type="email"
                  placeholder="Email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingLeft: "40px" }}
                />
              </div>
              <div style={{ position: "relative" }}>
                <FiLock style={inputIconStyle} />
                <input
                  type={showRegPassword ? "text" : "password"}
                  placeholder="Password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  style={{
                    ...inputStyle,
                    paddingLeft: "40px",
                    paddingRight: "40px",
                  }}
                />
                <span
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  style={eyeStyle}
                >
                  {showRegPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </>
          ) : (
            <>
              <div style={{ position: "relative" }}>
                <FiMail style={inputIconStyle} />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingLeft: "40px" }}
                />
              </div>
              <div style={{ position: "relative" }}>
                <FiLock style={inputIconStyle} />
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    ...inputStyle,
                    paddingLeft: "40px",
                    paddingRight: "40px",
                  }}
                />
                <span
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={eyeStyle}
                >
                  {showLoginPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSignUp ? isSendingOTP : isLoading}
            style={buttonStyle}
          >
            {isSignUp
              ? isSendingOTP
                ? "Sending OTP..."
                : "Register"
              : isLoading
              ? "Signing In..."
              : "Sign In"}
          </button>

          <p style={{ marginTop: 16, textAlign: "center" }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <span
              onClick={() => setIsSignUp((prev) => !prev)}
              style={{ color: "#cd0447", fontWeight: 600, cursor: "pointer" }}
            >
              {isSignUp ? "Login" : "Register"}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

// === Styles ===

const inputStyle = {
  width: "100%",
  paddingTop: "12px",
  paddingBottom: "12px",
  paddingLeft: "14px",
  paddingRight: "14px",
  marginBottom: "14px",
  border: "1px solid #eee",
  borderRadius: "10px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  fontSize: "16px",
};

const buttonStyle = {
  width: "100%",
  backgroundColor: "#cd0447",
  color: "#fff",
  fontWeight: "bold",
  border: "none",
  borderRadius: "20px",
  padding: "12px 20px",
  marginTop: 10,
  cursor: "pointer",
  fontSize: "16px",
};

const eyeStyle = {
  position: "absolute" as const,
  right: 12,
  top: 14,
  cursor: "pointer",
  color: "#333",
  fontSize: "18px",
};

const inputIconStyle = {
  position: "absolute" as const,
  left: 12,
  top: 14,
  color: "#000",
  fontSize: "18px",
  zIndex: 1,
};

// === QUOTE STYLES ===

const quoteContainerStyle = {
  position: "absolute" as const,
  left: 480,
  top: 200,
  zIndex: 1,
  width: "640px",
  textAlign: "left" as const,
  lineHeight: 1.2,
};

// Responsive quote container styles
const getQuoteContainerStyle = (screenSize: any) => ({
  position: "absolute" as const,
  left: screenSize.isMobile ? 20 : screenSize.isTablet ? 100 : 380,
  top: screenSize.isMobile ? 100 : screenSize.isTablet ? 150 : 200,
  zIndex: 1,
  width: screenSize.isMobile
    ? "calc(100% - 50px)"
    : screenSize.isTablet
    ? "500px"
    : "640px",
  textAlign: "left" as const,
  lineHeight: 1.2,
});

// Responsive quote line container styles
const getQuoteLineContainerStyle = (screenSize: any, lineNumber: number) => {
  const baseContainerStyle = {
    position: "absolute" as const,
    zIndex: 1,
    textAlign: "left" as const,
  };

  if (lineNumber === 1) {
    return {
      ...baseContainerStyle,
      left: screenSize.isMobile ? 20 : screenSize.isTablet ? 50 : 50,
      top: screenSize.isMobile ? 100 : screenSize.isTablet ? 150 : 200,
      width: screenSize.isMobile
        ? "calc(100% - 50px)"
        : screenSize.isTablet
        ? "700px"
        : "1000px",
    };
  } else if (lineNumber === 2) {
    return {
      ...baseContainerStyle,
      left: screenSize.isMobile ? 20 : screenSize.isTablet ? 100 : 380,
      top: screenSize.isMobile ? 150 : screenSize.isTablet ? 200 : 250,
      width: screenSize.isMobile
        ? "calc(100% - 50px)"
        : screenSize.isTablet
        ? "500px"
        : "640px",
    };
  } else {
    return {
      ...baseContainerStyle,
      left: screenSize.isMobile ? 20 : screenSize.isTablet ? 100 : 380,
      top: screenSize.isMobile ? 200 : screenSize.isTablet ? 250 : 300,
      width: screenSize.isMobile
        ? "calc(100% - 50px)"
        : screenSize.isTablet
        ? "500px"
        : "640px",
    };
  }
};

// Responsive quote line styles
const getQuoteLineStyle = (screenSize: any, lineNumber: number) => {
  const baseStyle = {
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: "-0.02em",
  };

  if (lineNumber === 1) {
    return {
      ...baseStyle,
      marginTop: screenSize.isMobile ? "50px" : "-80px",
      fontSize: "45px",
      fontWeight: 600,
      color: "#0f172a",
      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
    };
  } else if (lineNumber === 2) {
    return {
      ...baseStyle,
      fontSize: screenSize.isMobile
        ? "28px"
        : screenSize.isTablet
        ? "36px"
        : "48px",
      fontWeight: 900,
      background: "linear-gradient(90deg, #9333ea, #db2777)",
      WebkitBackgroundClip: "text" as const,
      WebkitTextFillColor: "transparent",
      marginTop: screenSize.isMobile ? "10px" : "15px",
      textShadow: "0 2px 4px rgba(147, 51, 234, 0.2)",
    };
  } else {
    return {
      ...baseStyle,
      fontSize: screenSize.isMobile
        ? "16px"
        : screenSize.isTablet
        ? "18px"
        : "22px",
      fontWeight: 600,
      color: "#475569",
      marginTop: screenSize.isMobile ? "15px" : "25px",
      letterSpacing: "0.01em",
      lineHeight: 1.4,
      animation: "fadeInUp 1.2s ease-out 0.6s, typewriter 2s ease-out 1.8s",
      opacity: 0,
      animationFillMode: "forwards",
    };
  }
};

const quoteLine1 = {
  marginTop: "50px",
  fontSize: "48px",
  fontWeight: 900,
  color: "#0f172a",
  fontFamily: "'Poppins', sans-serif",
  letterSpacing: "-0.02em",
  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const quoteLine2 = {
  fontSize: "48px",
  fontWeight: 900,
  background: "linear-gradient(90deg, #9333ea, #db2777)",
  WebkitBackgroundClip: "text" as const,
  WebkitTextFillColor: "transparent",
  marginTop: "15px",
  fontFamily: "'Poppins', sans-serif",
  letterSpacing: "-0.02em",
  textShadow: "0 2px 4px rgba(147, 51, 234, 0.2)",
};

const quoteLine3 = {
  fontSize: "22px",
  fontWeight: 600,
  color: "#475569",
  marginTop: "25px",
  fontFamily: "'Poppins', sans-serif",
  letterSpacing: "0.01em",
  lineHeight: 1.4,
};

const highlight = {
  background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
  WebkitBackgroundClip: "text" as const,
  WebkitTextFillColor: "transparent",
  fontWeight: 600,
};
