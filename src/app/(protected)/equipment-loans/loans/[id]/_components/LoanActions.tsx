/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Button } from "@/app/_components/ui/button";
import { Loader2 } from "lucide-react";

const LoanActions: React.FC<{
  status: string;
  userAccessRights: string[];
  approveLoan: () => void;
  rejectLoan: () => void;
  requestForCollectionLoan: () => void;
  prepareLoan: () => void;
  collectLoan: () => void;
  returnLoan: () => void;
  cancelLoan: () => void;
  isPendingRejectLoan: boolean;
  isPendingApproveLoan: boolean;
  isActionButtonPending: boolean;
}> = ({
  userAccessRights,
  approveLoan,
  status,
  requestForCollectionLoan,
  prepareLoan,
  collectLoan,
  returnLoan,
  rejectLoan,
  cancelLoan,
  isPendingRejectLoan,
  isPendingApproveLoan,
  isActionButtonPending,
}) => {
  if (
    userAccessRights.includes("userAllowedToApproveLoan") &&
    status === "PENDING_APPROVAL"
  ) {
    return (
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => {
            rejectLoan();
          }}
          variant={"destructive"}
          disabled={isPendingApproveLoan}
        >
          {isPendingRejectLoan && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Reject
        </Button>
        <Button
          onClick={() => {
            approveLoan();
          }}
          disabled={isPendingApproveLoan}
        >
          {isPendingApproveLoan && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
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
            cancelLoan();
          }}
          disabled={isActionButtonPending}
          variant={"destructive"}
        >
          {isActionButtonPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Cancel Loan
        </Button>
        <Button
          onClick={() => {
            requestForCollectionLoan();
          }}
          disabled={isActionButtonPending}
        >
          {isActionButtonPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Request For Collection
        </Button>
      </div>
    );
  }
  if (status === "REQUEST_COLLECTION") {
    return (
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => {
            cancelLoan();
          }}
          disabled={isActionButtonPending}
          variant={"destructive"}
        >
          {isActionButtonPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Cancel Loan
        </Button>
      </div>
    );
  }
  if (
    userAccessRights.includes("Preparation") &&
    status === "PREPARING" &&
    !userAccessRights.includes("usersOwnLoan")
  ) {
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
  if (
    userAccessRights.includes("Collection") &&
    status === "READY" &&
    !userAccessRights.includes("usersOwnLoan")
  ) {
    return (
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => {
            collectLoan();
          }}
        >
          Collect Loan
        </Button>
      </div>
    );
  }
  if (
    userAccessRights.includes("Return") &&
    status === "COLLECTED" &&
    !userAccessRights.includes("usersOwnLoan")
  ) {
    return (
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => {
            returnLoan();
          }}
        >
          Return Loan
        </Button>
      </div>
    );
  }
  if (
    userAccessRights.includes("usersOwnLoan") &&
    status === "PENDING_APPROVAL"
  ) {
    return (
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => {
            cancelLoan();
          }}
          variant={"destructive"}
          disabled={isActionButtonPending}
        >
          {isActionButtonPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Cancel Loan
        </Button>
      </div>
    );
  }
  return <div></div>;
};
export default LoanActions;
