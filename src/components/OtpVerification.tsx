import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/loading";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface OtpVerificationProps {
  email: string;
  name: string;
  password?: string;
  companyName?: string;
  onSubmit: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack?: () => void;
  isLoading?: boolean;
  error?: string;
  countdown?: number;
}

export const OtpVerification = ({
  email,
  name,
  password,
  companyName,
  onSubmit,
  onResend,
  onBack,
  isLoading = false,
  error = "",
  countdown = 0,
}: OtpVerificationProps) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [localError, setLocalError] = useState("");
  const [localCountdown, setLocalCountdown] = useState(countdown || 60);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isTablet = !isMobile && window.innerWidth <= 1024;

  useEffect(() => {
    if (countdown && countdown > 0) {
      setLocalCountdown(countdown);
    }
  }, [countdown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (localCountdown > 0) {
      timer = setTimeout(() => setLocalCountdown(localCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [localCountdown]);

  // Autofocus first box on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) return;
    const newOtp = [...otp];
    newOtp[idx] = val[val.length - 1]; // Only last digit
    setOtp(newOtp);
    if (idx < 5 && val) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace") {
      if (otp[idx]) {
        const newOtp = [...otp];
        newOtp[idx] = "";
        setOtp(newOtp);
      } else if (idx > 0) {
        inputRefs.current[idx - 1]?.focus();
        const newOtp = [...otp];
        newOtp[idx - 1] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData
      .getData("Text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      setTimeout(() => inputRefs.current[5]?.focus(), 10);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setLocalError("Please enter a valid 6-digit OTP");
      return;
    }
    try {
      await onSubmit(otpValue);
      navigate("/pending-registration");
    } catch (err) {
      setLocalError("OTP verification failed. Please try again.");
    }
  };

  const handleResend = async () => {
    setLocalError("");
    await onResend();
    setLocalCountdown(60);
  };

  // Back button navigates to register
  const handleBack = () => {
    navigate("/register");
  };

  return (
    <>
      {/* Content */}
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative z-10 w-full max-w-md px-4">
          {/* OTP Card */}
          <Card className="w-full border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              {/* Logo inside card */}
              <div className="flex justify-center items-center mb-4">
                <div
                  className="bg-white overflow-hidden flex items-center justify-center p-3 rounded-[16px] border-2 border-gray-200 shadow-sm"
                  style={{
                    width: "160px",
                    height: "64px",
                    borderRadius: "16px",
                    boxShadow: "0 2px 8px rgba(205, 4, 71, 0.08)",
                  }}
                >
                  <img
                    src="https://www.iverto.ai/static/media/logo.aef148084a7a5d79ad65.png"
                    alt="Iverto Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <CardTitle
                className="text-3xl font-extrabold text-center mb-1 tracking-tight"
                style={{ color: "#cd0447", letterSpacing: "-0.5px" }}
              >
                Verify your identity
              </CardTitle>
              <p className="text-center text-gray-700 text-base font-medium mb-1">
                Check your email for a 6-digit code
              </p>
              <p className="text-center text-gray-500 text-sm mb-2">
                Sent to{" "}
                <span className="font-semibold text-gray-800">{email}</span>
              </p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {(error || localError) && (
                <Alert
                  variant="destructive"
                  className="mb-6 text-base font-semibold"
                >
                  <AlertDescription>{error || localError}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-7">
                <div className="mb-2 flex justify-center gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(e, idx)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      onPaste={idx === 0 ? handlePaste : undefined}
                      className="w-12 h-14 text-2xl font-bold text-center border-2 border-gray-300 rounded-xl bg-[#f8f8fa] shadow focus:border-[#cd0447] focus:ring-2 focus:ring-[#f8d2df] transition-all outline-none"
                      disabled={isLoading}
                      autoFocus={idx === 0}
                      aria-label={`OTP digit ${idx + 1}`}
                    />
                  ))}
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-full py-4 text-lg font-extrabold shadow-lg transition-all bg-gradient-to-r from-[#cd0447] to-[#e94e77] hover:from-[#b0033b] hover:to-[#cd0447] tracking-wider uppercase"
                  style={{
                    color: "#fff",
                  }}
                  disabled={isLoading || otp.join("").length !== 6}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      Verifying...
                    </div>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>
                <div className="flex items-center justify-between mt-7 pt-4 border-t border-gray-100 text-base">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    className="text-[#cd0447] hover:bg-[#f8d2df] transition-colors font-semibold px-4 py-2 rounded-lg"
                    disabled={isLoading}
                  >
                    ← Back
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResend}
                    className="text-[#cd0447] hover:bg-[#f8d2df] transition-colors font-semibold px-4 py-2 rounded-lg"
                    disabled={isLoading || localCountdown > 0}
                  >
                    {localCountdown > 0
                      ? `Resend in ${localCountdown}s`
                      : "Resend OTP"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
