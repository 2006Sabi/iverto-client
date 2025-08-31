import React from "react";

const PieChartTitle: React.FC = () => (
  <div className="w-full flex justify-center mt-2 mb-2 lg:mb-4">
    <span className="inline-flex items-center gap-2">
      <span className="p-2 rounded-xl bg-purple-100">
        <svg
          className="h-5 w-5 sm:h-6 sm:w-6 text-purple-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
          />
        </svg>
      </span>
      Anomaly Types
    </span>
  </div>
);

export default PieChartTitle;
