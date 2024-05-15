/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Button } from "@/app/_components/ui/button";
import { Equipment, Loan } from "@prisma/client";
import { useState } from "react";

const LoanActions: React.FC<{
  userAccessRights: string[];
  approveLoan: () => void;
  rejectLoan: () => void;
}> = ({ userAccessRights, approveLoan }) => {
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
  return <div></div>;
};
export default LoanActions;
