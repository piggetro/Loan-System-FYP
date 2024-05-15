/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Button } from "@/app/_components/ui/button";
import { Equipment, Loan } from "@prisma/client";
import { useState } from "react";

const LoanActions: React.FC<{
  status: string;
  userAccessRights: string[];
  approveLoan: () => void;
  rejectLoan: () => void;
  requestForCollectionLoan: () => void;
  prepareLoan: () => void;
}> = ({
  userAccessRights,
  approveLoan,
  status,
  requestForCollectionLoan,
  prepareLoan,
}) => {
  if (userAccessRights.includes("userAllowedToApproveLoan")) {
    return (
      <div className="flex justify-center gap-4">
        <Button variant={"destructive"}>Reject</Button>
        <Button
          onClick={() => {
            approveLoan();
          }}
        >
          Approve
        </Button>
      </div>
    );
  }
  if (
    userAccessRights.includes("usersOwnLoan") &&
    status === "REQUEST_COLLECTION"
  ) {
    return (
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => {
            requestForCollectionLoan();
          }}
        >
          Request For Collection
        </Button>
      </div>
    );
  }
  if (userAccessRights.includes("Preparation") && status === "PREPARING") {
    return (
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => {
            prepareLoan();
          }}
        >
          Prepare Loan
        </Button>
      </div>
    );
  }
  return <div></div>;
};
export default LoanActions;
