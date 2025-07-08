import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/loading";
import { useNavigate } from "react-router-dom";

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
  const [otp, setOtp] = useState("");
  const [localError, setLocalError] = useState("");
  const [localCountdown, setLocalCountdown] = useState(countdown || 60);
  const navigate = useNavigate();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (!otp || otp.length !== 6) {
      setLocalError("Please enter a valid 6-digit OTP");
      return;
    }
    try {
      await onSubmit(otp);
      // If onSubmit does not throw, assume success and navigate
      navigate("/pending-registration");
    } catch (err) {
      // If onSubmit throws, show error (optional)
      setLocalError("OTP verification failed. Please try again.");
    }
  };

  const handleResend = async () => {
    setLocalError("");
    await onResend();
    setLocalCountdown(60); // Restart timer on resend
  };
  return (
    <div className="w-full h-full min-h-screen flex flex-col justify-center items-center">
      <div className="flex justify-start items-start mb-[-32px] z-10">
        <div
          className="bg-white overflow-hidden flex items-left justify-center p-3 rounded-[12px] mb-4"
          style={{
            width: "180px",
            height: "60px",
            borderRadius: "12px 12px 12px 0px", // top-left 0, others rounded
            boxShadow: "none", // no shadow
            border: "none", // no border
          }}
        >
          <img
            src="https://www.iverto.ai/static/media/logo.aef148084a7a5d79ad65.png"
            alt="Iverto Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      <Card className="p-6 mt-0 w-full max-w-md border justify-center items-center border-gray-100 shadow-none">
        <CardHeader>
          <CardTitle
            className="text-2xl font-bold text-center mb-4"
            style={{ color: "#cd0447" }}
          >
            Enter Your OTP
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(error || localError) && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error || localError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-4">
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-5 py-3 text-base border border-gray-200 shadow-sm focus:border-[#cd0447] focus:ring-2 focus:ring-[#f8d2df]"
                disabled={isLoading}
                required
                maxLength={6}
                autoComplete="one-time-code"
                style={{
                  background: "#faf7fa",
                  letterSpacing: "0.3em",
                  textAlign: "center",
                }}
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-full py-3 text-lg font-bold shadow-md transition-all"
              style={{
                backgroundColor: "#cd0447",
                color: "#fff",
                letterSpacing: "0.5px",
              }}
              disabled={isLoading || !otp || otp.length !== 6}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Verifying...
                </div>
              ) : (
                "Verify"
              )}
            </Button>
            <div className="flex items-center justify-between mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="text-[#cd0447]"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResend}
                className="text-[#cd0447]"
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
  );
};
