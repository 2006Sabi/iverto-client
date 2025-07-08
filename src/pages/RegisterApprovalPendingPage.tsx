import React, { useState, useEffect } from "react";
import { FaEnvelopeOpenText } from "react-icons/fa";
import { FaRegHourglassHalf } from "react-icons/fa6";
import { useAppSelector } from "@/store/hooks";
import { useGetProfileQuery } from "@/store/api/authApi";
import { useNavigate } from "react-router-dom";

const RegisterApprovalPendingPage = () => {
  const [flipped, setFlipped] = useState(false);
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  // Poll for approval status every 5 seconds
  const { data: profileData, refetch } = useGetProfileQuery();
  const approved = profileData?.data?.isApproved;

  useEffect(() => {
    const interval = setInterval(() => {
      setFlipped((prev) => !prev);
      refetch();
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
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl overflow-hidden border border-[#912c58] grid grid-cols-1 md:grid-cols-2">
        <div className="bg-[#912c58] text-white flex flex-col justify-center items-center p-8 space-y-4">
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
            <h1 className="text-2xl font-bold text-[#912c58] mb-4">
              Account Approval Pending
            </h1>
            <p className="text-gray-600 mb-6 text-sm">
              Thank you for signing up! Our admin team is reviewing your
              registration. This process may take a little time.
            </p>
            <div className="flex items-center space-x-2 text-[#912c58] mb-6">
              <FaEnvelopeOpenText className="text-xl" />
              <span className="text-sm">
                You'll receive an email once you're approved.
              </span>
            </div>
          </div>

          <a
            href="https://iverto-webite1.vercel.app/#contact"
            className="mt-4 bg-[#912c58] text-white text-center py-2 rounded-md hover:bg-[#6d1e41] transition duration-300"
          >
            Contact Our Team
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterApprovalPendingPage;
