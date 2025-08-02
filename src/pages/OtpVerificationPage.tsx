import { useLocation, useNavigate } from "react-router-dom";
import { OtpVerification } from "@/components/OtpVerification";
import { useSendOTPMutation, useVerifyOTPMutation } from "@/store/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { addNotification } from "@/store/slices/uiSlice";
import { dataInitializer } from "@/services/dataInitializer";

const OtpVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [sendOTP, { isLoading: isSendingOTP }] = useSendOTPMutation();
  const [verifyOTP, { isLoading: isVerifyingOTP }] = useVerifyOTPMutation();

  // Registration data passed from /register
  const { email, name, password, companyName } = location.state || {};

  if (!email || !name) {
    navigate("/register");
    return null;
  }

  const handleVerifyOTP = async (otpValue: string) => {
    const result = await verifyOTP({
      email,
      otp: otpValue,
      name,
      password,
      companyName,
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
      dataInitializer.clearCache();
      await dataInitializer.initialize();
      navigate("/dashboard");
    } else {
      throw new Error("Registration failed: Invalid response format");
    }
  };

  const handleResendOTP = async () => {
    await sendOTP({ name, email, companyName }).unwrap();
  };

  return (
    <OtpVerification
      email={email}
      name={name}
      password={password}
      companyName={companyName}
      onSubmit={handleVerifyOTP}
      onResend={handleResendOTP}
      isLoading={isVerifyingOTP || isSendingOTP}
    />
  );
};

export default OtpVerificationPage;
