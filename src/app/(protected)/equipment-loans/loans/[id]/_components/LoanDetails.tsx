/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { Skeleton } from "@/app/_components/ui/skeleton";
import { api } from "@/trpc/react";
import LoanDetailsTable from "./LoanDetailsTable";
import LoanActions from "./LoanActions";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/app/_components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import CollectionLoanDialog from "@/app/(protected)/loan-management/_components/CollectionLoanDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/_components/ui/alert-dialog";
import PreparationLoanDialog from "@/app/(protected)/loan-management/_components/PreparationLoanDialog";
import ReturnLoanDialog from "@/app/(protected)/loan-management/_components/ReturnLoanDialog";
import { Button } from "@/app/_components/ui/button";
import { Dialog, DialogContent } from "@/app/_components/ui/dialog";
import OutstandingItemDialog from "./OutstandingItemsDialog";
import ApprovalLoanDialog from "@/app/(protected)/loan-management/_components/ApprovalLoanDialog";
import { Loader2 } from "lucide-react";

const LoanDetails: React.FC<{
  id: string;
}> = ({ id }) => {
  //Check if the outstanding modal needs to be open
  const searchParams = useSearchParams();
  const outsandingItemsOptionFromURL = searchParams.get("ooid");
  const router = useRouter();
  //For Action Button Loading States
  const [isPendingRejectLoan, setIsPendingRejectLoan] =
    useState<boolean>(false);
  const [isPendingApproveLoan, setIsPendingApproveLoan] =
    useState<boolean>(false);
  const [isActionButtonPending, setIsActionButtonPending] =
    useState<boolean>(false);

  const [openCollectLoanDialog, setOpenCollectLoanDialog] =
    useState<boolean>(false);
  const [openPreparationDialog, setOpenPreparationDialog] =
    useState<boolean>(false);
  const [openReturnDialog, setOpenReturnDialog] = useState<boolean>(false);
  const [openRequestDialog, setOpenRequestDialog] = useState<boolean>(false);
  const [openApproveDialog, setOpenApproveDialog] = useState<boolean>(false);
  const [openOutstandingItemsDialog, setOpenOutstandingItemsDialog] =
    useState<boolean>(false);
  const [openCancelLoanDialog, setOpenCancelLoanDialog] =
    useState<boolean>(false);
  const [openRejectLoanDialog, setOpenRejectLoanDialog] =
    useState<boolean>(false);
  useEffect(() => {
    if (openOutstandingItemsDialog === false) refresh();
  }, [openOutstandingItemsDialog]);

  const {
    refetch: userAccessRightsRefetch,
    isLoading: userAccessRightsIsLoading,
    data: userAccessRights,
  } = api.loan.getUsersLoanAccess.useQuery({
    id: id,
  });
  useEffect(() => {
    if (userAccessRights !== undefined) {
      if (
        outsandingItemsOptionFromURL === "true" &&
        !userAccessRights.includes("usersOwnLoan")
      ) {
        setOpenOutstandingItemsDialog(true);
      }
    }
  }, [userAccessRights]);
  const requestCollection = api.loanRequest.requestForCollection.useMutation();
  const { toast } = useToast();
  const { refetch, data } = api.loan.getLoanById.useQuery({
    id: id,
  });
  const { data: loanTimingData } = api.loan.getLoanTimings.useQuery();
  const rejectLoan = api.loanRequest.rejectLoanRequest.useMutation();
  const cancelLoan = api.loanRequest.cancelLoan.useMutation();
  function refresh() {
    refetch().catch((error) => {
      console.log(error);
    });
  }
  const onApprove = useCallback(() => {
    setOpenApproveDialog(true);
  }, []);
  const onReject = useCallback(() => {
    setOpenRejectLoanDialog(true);
  }, []);

  function executeRejectLoan() {
    setIsPendingRejectLoan(true);
    rejectLoan
      .mutateAsync({ id: id })
      .then(() => {
        setIsPendingRejectLoan(false);
        refresh();
      })
      .catch(() => {
        setIsPendingRejectLoan(false);
        toast({
          title: "An unexpected error occured. Please try again later",
          variant: "destructive",
        });
      });
  }

  const onRequestForCollectionLoan = useCallback(() => {
    setOpenRequestDialog(true);
  }, []);
  const executeRequestCollection = () => {
    setIsActionButtonPending(true);
    requestCollection
      .mutateAsync({ id: id })
      .then((results) => {
        setIsActionButtonPending(false);
        if (results === "PREPARING") {
          toast({
            title: "Request For Collection is Successful",
            description: "Loan is now Preparing",
          });
          refresh();
        } else if (results === "UNAVAILABLE") {
          toast({
            title: "Request Collection Was Unsuccessful",
            description:
              "The Equipment that you have requested is currently unavailable.\nAll Loan Request are subject to Equipment Availability",
            variant: "destructive",
          });
        } else if (results === "COLLECTION TIME ERROR") {
          toast({
            title: "Request Collection Was Unsuccessful",
            description: `Please request during Request Collection Timing\nRequest Collection Timing is ${loanTimingData?.startRequestForCollection} to ${loanTimingData?.endRequestForCollection}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Request Collection Was Unsuccessful",
            description: `Request Collection is unavailable on block out dates, Please try again on another day`,
            variant: "destructive",
          });
        }
      })
      .catch(() => {
        //handle error
        setIsActionButtonPending(false);
        toast({
          title: "An unexpected error occured. Please try again later",
          variant: "destructive",
        });
      });
  };

  function successCloseApproveDialog() {
    setOpenApproveDialog(false);
    refresh();
  }
  const onPrepareLoan = useCallback(() => {
    setOpenPreparationDialog(true);
  }, []);
  const onCollectLoan = useCallback(() => {
    setOpenCollectLoanDialog(true);
  }, []);
  const onReturnLoan = useCallback(() => {
    setOpenReturnDialog(true);
  }, []);
  const onCancelLoan = () => {
    setOpenCancelLoanDialog(true);
  };
  const executeCancelLoan = () => {
    setIsActionButtonPending(true);

    cancelLoan
      .mutateAsync({ id: id })
      .then(() => {
        setIsActionButtonPending(false);
        setOpenCancelLoanDialog(false);
        toast({
          title: "Loan Successfully Cancelled",
        });
        refresh();
      })
      .catch(() => {
        setIsActionButtonPending(false);
        toast({
          title: "An unexpected error occured. Please try again later",
          variant: "destructive",
        });
      });
  };
  if (!data) {
    return (
      <div className="w-7/8 h-full  rounded-lg bg-white p-5 shadow-lg">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="mt-4 h-5 w-96" />
        <Skeleton className="mt-2 h-5 w-96" />
        <Skeleton className="mt-2 h-5 w-96" />
        <Skeleton className="mt-2 h-5 w-96" />
        <Skeleton className="mt-5 h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <AlertDialog
        open={openCancelLoanDialog}
        onOpenChange={setOpenCancelLoanDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will cancel your the Request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setOpenCancelLoanDialog(false);
              }}
              disabled={isActionButtonPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                executeCancelLoan();
              }}
              disabled={isActionButtonPending}
            >
              Continue
              {isActionButtonPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={openRejectLoanDialog}
        onOpenChange={setOpenRejectLoanDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will reject the Loan Request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setOpenRejectLoanDialog(false);
              }}
              disabled={isActionButtonPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                executeRejectLoan();
              }}
              disabled={isActionButtonPending}
            >
              Reject
              {isActionButtonPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ApprovalLoanDialog
        id={id}
        successCloseDialog={successCloseApproveDialog}
        isDialogOpen={openApproveDialog}
        setIsDialogOpen={setOpenApproveDialog}
      />
      <Dialog
        open={openOutstandingItemsDialog}
        onOpenChange={setOpenOutstandingItemsDialog}
      >
        <DialogContent className=" h-3/4 w-11/12 max-w-none">
          <OutstandingItemDialog
            outstandingItems={data.outstandingItems}
            id={data.id}
            loanId={data.loanId}
            refresh={() => {
              refresh();
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={openCollectLoanDialog}
        onOpenChange={setOpenCollectLoanDialog}
      >
        <DialogContent className=" h-3/4 w-11/12 max-w-none">
          <CollectionLoanDialog
            closeDialog={() => {
              setOpenCollectLoanDialog(false);
              refresh();
            }}
            id={id}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={openRequestDialog} onOpenChange={setOpenRequestDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Collection</AlertDialogTitle>
            <AlertDialogDescription>
              You may only request for loan from&nbsp;
              <b className="text-red-500">
                {loanTimingData?.startRequestForCollection}
              </b>
              &nbsp;to&nbsp;
              <b className="text-red-500">
                {loanTimingData?.endRequestForCollection}
              </b>
              <br />
              <br />
              Subjected To item availability, if item if unavailable please try
              request for collection at another time
              <br /> <br />
              Once Loan is Ready for collection, please collect at SOC IT
              Services from&nbsp;
              <b className="text-red-500">
                {loanTimingData?.startTimeOfCollection}
              </b>
              &nbsp;to&nbsp;
              <b className="text-red-500">
                {loanTimingData?.endTimeOfCollection}
              </b>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setOpenRequestDialog(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                executeRequestCollection();
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PreparationLoanDialog
        isDialogOpen={openPreparationDialog}
        setIsDialogOpen={setOpenPreparationDialog}
        onSuccessClose={() => {
          setOpenPreparationDialog(false);
          refresh();
        }}
        id={id}
      />

      <Dialog open={openReturnDialog} onOpenChange={setOpenReturnDialog}>
        <DialogContent className=" h-3/4 w-11/12 max-w-none">
          <ReturnLoanDialog
            closeDialog={() => {
              setOpenReturnDialog(false);
              refetch().catch(() => {
                toast({
                  title: "An unexpected error occured. Please try again later",
                  variant: "destructive",
                });
              });
            }}
            id={id}
          />
        </DialogContent>
      </Dialog>
      <div className="w-7/8 h-full  rounded-lg bg-white p-5 shadow-lg">
        <div className="text-xl font-bold">{data.loanId}</div>
        <div className="mt-4 text-sm">
          <p className="flex">
            <span className="font-bold">Borrower:&nbsp;</span>
            {!data.loanedById ? "Deleted Account" : data.loanedByName}
          </p>
          <p className="flex">
            <span className="font-bold">Approver:&nbsp;</span>
            {data.approverName ?? "-"}
          </p>
          <p className="flex">
            <span className="font-bold">Approved By:&nbsp;</span>
            {data.approvedByName ?? "-"}
          </p>
          <p className="flex">
            <span className="font-bold">Remark(s):&nbsp;</span> {data.remarks}
          </p>
          <p className="flex">
            <span className="font-bold">Prepared By:&nbsp;</span>
            {data.preparedByName ?? "-"}
          </p>
          <p className="flex">
            <span className="font-bold">Issued By:&nbsp;</span>
            {data.issuedByName ?? "-"}
          </p>
          <p className="flex">
            <span className="font-bold">Returned To:&nbsp;</span>
            {data.returnedToName ?? "-"}
          </p>
          <p className="flex">
            <span className="font-bold">Loan Status:&nbsp;</span>{" "}
            <div className="flex items-center">
              <div
                className={`mr-2 h-3 w-3 rounded-full ${
                  data.status === "COLLECTED" || data.status === "RETURNED"
                    ? "bg-green-500"
                    : data.status === "REJECTED" || data.status === "CANCELLED"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }`}
              ></div>
              <span>{toStartCase(data.status)}</span>
            </div>
          </p>
          <p className="flex" suppressHydrationWarning>
            <span className="font-bold">Due Date:&nbsp;</span>
            {new Date(data.dueDate) < new Date() &&
            (data.status === "COLLECTED" ||
              data.status === "PARTIAL_RETURN") ? (
              <p className="font-semibold text-red-500">
                {new Date(data.dueDate).toLocaleDateString()}&nbsp;(Overdue)
              </p>
            ) : (
              <p> {new Date(data.dueDate).toLocaleDateString()}</p>
            )}
          </p>
        </div>
        <div className="flex w-full justify-end gap-3">
          {userAccessRights?.includes("Waiver Option") ? (
            <Button
              onClick={() => {
                router.push(
                  `/equipment-loans/waiver/${id}?loan=${id}&prev=loan-details`,
                );
              }}
            >
              View Waiver
            </Button>
          ) : userAccessRights?.includes("Admin Waiver Option") ? (
            <Button
              onClick={() => {
                router.push(
                  `/loan-management/waiver/${id}?prev=loan-details&loan=${id}`,
                );
              }}
            >
              View Waiver
            </Button>
          ) : null}

          {userAccessRights?.includes("Lost/Damaged Loans") &&
          !userAccessRights.includes("usersOwnLoan") ? (
            <Button
              onClick={() => {
                setOpenOutstandingItemsDialog(true);
              }}
            >
              Outstanding Items
              <div
                className={`ml-2 h-5 w-5 ${
                  data.outstandingItems.filter(
                    (item) =>
                      item.status === "DAMAGED" ||
                      item.status === "LOST" ||
                      item.status === "MISSING_CHECKLIST_ITEMS",
                  ).length === 0
                    ? "hidden"
                    : ""
                } rounded-full bg-white font-semibold text-primary`}
              >
                {
                  data.outstandingItems.filter(
                    (item) =>
                      item.status === "DAMAGED" ||
                      item.status === "LOST" ||
                      item.status === "MISSING_CHECKLIST_ITEMS",
                  ).length
                }
              </div>
            </Button>
          ) : null}
        </div>
        <div className="mt-7">
          <LoanDetailsTable
            loanData={data}
            outstandingItems={data.outstandingItems.length === 0 ? false : true}
          />
        </div>

        {(userAccessRights?.includes("Collection") ??
          userAccessRights?.includes("usersOwnLoan")) &&
        data.signature !== null ? (
          <div className="mt-5 flex flex-col items-center">
            <p className=" font-semibold">Rules and Regulations</p>
            <p>
              1. In the event of loss or irreparable damages, borrowers will be
              required to replace the equipment
              <br />
              2. Borrowers will be required to pay for the full cost of any
              repairs required for damaged equipment.
              <br />
              3. All equipment must be returned on the due date
              <br />
              4. Please present payment receipt at SOC IT Services for verifying
              and document purposes.
            </p>
            <div className="mt-10 flex flex-col items-center">
              <div className="font-bold">
                I, {data.loanedByName}, acknowledge receipt of the above items.
              </div>
              <div>
                The Effective Date for the above items is&nbsp;
                <b>{new Date().toLocaleDateString()}</b>
              </div>
            </div>
            <Image
              src={data.signature}
              width={400}
              height={200}
              alt="Borrower's Signature"
            />
          </div>
        ) : null}

        <div className="mt-10">
          {userAccessRightsIsLoading || userAccessRights == undefined ? (
            <Skeleton className="h-10 w-1/6" />
          ) : (
            <LoanActions
              cancelLoan={onCancelLoan}
              isActionButtonPending={isActionButtonPending}
              isPendingApproveLoan={isPendingApproveLoan}
              isPendingRejectLoan={isPendingRejectLoan}
              userAccessRights={userAccessRights}
              approveLoan={onApprove}
              rejectLoan={onReject}
              status={data.status}
              requestForCollectionLoan={onRequestForCollectionLoan}
              prepareLoan={onPrepareLoan}
              collectLoan={onCollectLoan}
              returnLoan={onReturnLoan}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;

function toStartCase(string: string) {
  return string
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
