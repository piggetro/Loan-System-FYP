"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();

  const search = searchParams.get("prev");

  return (
    <div className="my-3">
      <div className="mb-1 flex items-center space-x-2 text-sm opacity-70">
        {goBackLink && (
          <span
            onClick={() => {
              if (!search) {
                window.location.href = goBackLink;
              } else {
                switch (search) {
                  case "dashboard":
                    window.location.href = "/";
                    break;
                  case "approval-management":
                    window.location.href = "/approval-management";
                    break;
                  case "history":
                    window.location.href = "/equipment-loans/history";
                    break;
                  case "lost-damaged":
                    window.location.href =
                      "/equipment-loans/lost-damaged-loans";
                    break;
                  case "overdue":
                    window.location.href = "/equipment-loans/overdue-loans";
                    break;
                  case "collection":
                    window.location.href = "/loan-management/collection";
                    break;
                  case "manage-lost-damaged":
                    window.location.href =
                      "/loan-management/lost-damaged-loans";
                    break;
                  case "preparation":
                    window.location.href = "/loan-management/preparation";
                    break;
                  case "return":
                    window.location.href = "/loan-management/return";
                    break;
                  case "track":
                    window.location.href = "/loan-management/track-loans";
                    break;
                  case "waiver":
                    const waiver = searchParams.get("loan");
                    window.location.href = `/loan-management/waiver/${waiver}`;
                    break;
                  case "equipment-loans-waiver":
                    window.location.href = `/equipment-loans/waiver`;
                    break;
                  case "loan-details":
                    const loan = searchParams.get("loan");
                    window.location.href = `/equipment-loans/loans/${loan}`;
                    break;
                  case "loan-request":
                    window.location.href = `/equipment-loans/loan-request`;
                    break;
                  default:
                    window.location.href = "/equipment-loans/loans";
                    break;
                }
              }
            }}
            className="flex items-center font-semibold text-[#1c6c91] hover:cursor-pointer hover:text-[#224e62]"
          >
            <ArrowLeft className="mr-1" />
            Go Back
          </span>
        )}
        <span>{pathName}</span>
      </div>
      <p className="text-xl font-medium">{pageName}</p>
    </div>
  );
};

export default TopHeaderComponent;
