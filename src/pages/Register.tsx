import { useNavigate } from "react-router-dom";
import { AuthScreen } from "@/components/AuthScreen";

const Register = () => {
  const navigate = useNavigate();

  // No need for handleSwitchToLogin, AuthScreen handles panel switching

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <AuthScreen />
    </div>
  );
};

export default Register;
