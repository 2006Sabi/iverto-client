import React, { useState, useEffect } from "react";
import { FaEnvelopeOpenText } from "react-icons/fa";
import { FaRegHourglassHalf } from "react-icons/fa6";
import { useAppSelector } from "@/store/hooks";
import { useGetProfileQuery } from "@/store/api/authApi";
import { useNavigate } from "react-router-dom";
import logo from "@/iverto.png";

const RegisterApprovalPendingPage = () => {
  const [flipped, setFlipped] = useState(false);
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  // Poll for approval status once on mount and on refresh
  const { data: profileData, refetch } = useGetProfileQuery();
  const approved = profileData?.data?.isApproved;

  useEffect(() => {
    // Poll once when component mounts
    refetch();

    // Set up interval for visual animation only (no API calls)
    const interval = setInterval(() => {
      setFlipped((prev) => !prev);
    }, 5000); 
    return () => clearInterval(interval);
  }, [refetch]); 
  useEffect(() => {
    if (approved) {
      navigate("/dashboard");
    }
  }, [approved, navigate]);

  return (
    <div className="min-h-screen bg-[#f9f4f8] flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl overflow-hidden border border-[#cd0447] grid grid-cols-1 md:grid-cols-2">
        <div className="bg-[#cd0447] text-white flex flex-col justify-center items-center p-8 space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={logo}
              alt="Iverto Logo"
              className="w-20 h-20 rounded-full shadow-lg bg-white p-2"
            />
            <span className="text-5xl font-bold">iverto.ai</span>
          </div>
          <FaRegHourglassHalf
            className={`text-6xl transition-transform duration-500 ${
              flipped ? "rotate-180" : "rotate-0"
            }`}
          />
          <h2 className="text-3xl font-semibold">
            Hold On{user?.name ? `, ${user.name}` : ""}!
          </h2>
          <p className="text-center text-sm opacity-90">
            Your registration is under review. We'll notify you as soon as it's
            approved.
          </p>
        </div>

        <div className="p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#cd0447] mb-4">
              Account Approval Pending
            </h1>
            <p className="text-gray-600 mb-8 text-base">
              Thank you for signing up! Our admin team is reviewing your
              registration. This process may take a little time.
            </p>
            <div className="flex items-center space-x-2 text-[#cd0447] mb-6">
              <FaEnvelopeOpenText className="text-xl" />
              <span className="text-base">
                You'll receive an email once you're approved.
              </span>
            </div>
          </div>

          <a
            href="https://iverto-webite1.vercel.app/#contact"
            className="mt-4 bg-[#cd0447] text-white text-center py-2 rounded-md hover:bg-[#a00336] transition duration-300"
          >
            Contact Our Team
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterApprovalPendingPage;
