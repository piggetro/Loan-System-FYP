"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";

type TopHeaderType = {
  pathName: string;
  pageName: string;
  goBackLink?: string;
};

const TopHeaderComponent: React.FC<TopHeaderType> = ({
  pathName,
  pageName,
  goBackLink,
}) => {
  return (
    <div className="my-3">
      <div className="mb-3 flex items-center space-x-2 text-sm opacity-70">
        {goBackLink && (
          <span
            onClick={() => {
              window.location.href = goBackLink;
            }}
            className="flex items-center font-semibold text-[#1c6c91] hover:cursor-pointer hover:text-[#224e62]"
          >
            <ArrowLeft className="mr-1" />
            Go Back
          </span>
        )}
        <span>{pathName}</span>
      </div>
      <p className="text-2xl font-medium">{pageName}</p>
    </div>
  );
};

export default TopHeaderComponent;
