/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { Skeleton } from "@/app/_components/ui/skeleton";
import { api } from "@/trpc/react";
import LoanDetailsTable from "./LoanDetailsTable";
import LoanActions from "./LoanActions";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useToast } from "@/app/_components/ui/use-toast";
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

const LoanDetails: React.FC<{
  id: string;
}> = ({ id }) => {
  //For Action Button Loading States
  const [isPendingRejectLoan, setIsPendingRejectLoan] =
    useState<boolean>(false);
  const [isPendingApproveLoan, setIsPendingApproveLoan] =
    useState<boolean>(false);
  const [isPendingRequestCollection, setIsPendingRequestCollection] =
    useState<boolean>(false);

  const [openCollectLoanDialog, setOpenCollectLoanDialog] =
    useState<boolean>(false);
  const [openPreparationDialog, setOpenPreparationDialog] =
    useState<boolean>(false);
  const [openReturnDialog, setOpenReturnDialog] = useState<boolean>(false);
  const [openRequestDialog, setOpenRequestDialog] = useState<boolean>(false);

  const {
    refetch: userAccessRightsRefetch,
    isLoading: userAccessRightsIsLoading,
    data: userAccessRights,
  } = api.loan.getUsersLoanAccess.useQuery({
    id: id,
  });
  const approveRequest = api.loanRequest.approveLoanRequestWithId.useMutation();
  const requestCollection = api.loanRequest.requestForCollection.useMutation();
  const { toast } = useToast();
  const { isFetching, refetch, data } = api.loan.getLoanById.useQuery({
    id: id,
  });
  const rejectLoan = api.loanRequest.rejectLoanRequest.useMutation();
  function refresh() {
    refetch().catch((error) => {
      console.log(error);
    });
  }

  const onApprove = useCallback(() => {
    setIsPendingApproveLoan(true);
    approveRequest
      .mutateAsync({
        id: id,
      })
      .then(() => {
        setIsPendingApproveLoan(false);
        //Check if still need this
        userAccessRightsRefetch().catch((error) => {
          console.log(error);
        });
        toast({ title: "Loan Successfully Approved" });
        refresh();
      })
      .catch(() => {
        setIsPendingApproveLoan(false);
        toast({ title: "Something Unexpected Happened" });
      });
  }, []);
  const onReject = useCallback(() => {
    setIsPendingRejectLoan(true);
    rejectLoan
      .mutateAsync({ id: id })
      .then(() => {
        setIsPendingRejectLoan(false);
        refresh();
      })
      .catch(() => {
        setIsPendingRejectLoan(false);
        toast({ title: "Something Unexpected Happened" });
      });
  }, []);

  const onRequestForCollectionLoan = useCallback(() => {
    setOpenRequestDialog(true);
  }, []);
  const executeRequestCollection = () => {
    setIsPendingRequestCollection(true);
    requestCollection
      .mutateAsync({ id: id })
      .then((results) => {
        setIsPendingRequestCollection(false);
        if (results === "PREPARING") {
          toast({
            title: "Request For Collection is Successful",
            description: "Loan is now Preparing",
          });
          refresh();
        } else {
          toast({
            title: "Request Collection Was Unsuccessful",
            description:
              "The Equipment that you have requested is currently unavailable.\nAll Loan Request are subject to Equipment Availability",
          });
        }
      })
      .catch(() => {
        //handle error
        setIsPendingRequestCollection(false);
        toast({ title: "Something Unexpected Happened" });
      });
  };
  const onPrepareLoan = useCallback(() => {
    setOpenPreparationDialog(true);
  }, []);
  const onCollectLoan = useCallback(() => {
    setOpenCollectLoanDialog(true);
  }, []);
  const onReturnLoan = useCallback(() => {
    setOpenReturnDialog(true);
  }, []);
  if (isFetching || !data) {
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
  console.log(data);
  return (
    <div className="w-full">
      <AlertDialog open={openCollectLoanDialog}>
        <AlertDialogContent className=" h-3/4 w-11/12 max-w-none">
          <CollectionLoanDialog
            closeDialog={() => {
              setOpenCollectLoanDialog(false);
              refresh();
            }}
            id={id}
          />
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openRequestDialog} onOpenChange={setOpenRequestDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Subject to Item Availability. Once Requested please proceed to
              Classroom: _____ From _____ to _____
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

      <AlertDialog open={openReturnDialog}>
        <AlertDialogContent className=" h-3/4 w-11/12 max-w-none">
          <ReturnLoanDialog
            closeDialog={() => {
              setOpenReturnDialog(false);
              refetch().catch(() => {
                toast({
                  title: "Something Unexpected Happen",
                  description:
                    "Please refresh your browser to view updated data",
                });
              });
            }}
            id={id}
          />
        </AlertDialogContent>
      </AlertDialog>
      <div className="w-7/8 h-full  rounded-lg bg-white p-5 shadow-lg">
        <div className="text-xl font-bold">{data.loanId}</div>
        <div className="mt-4 text-sm">
          <p className="flex">
            <span className="font-bold">Loaner:&nbsp;</span>
            {!data.loanedById ? "Deleted Account" : data.loanedByName}
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
                    : data.status === "REJECTED" ||
                        data.status === "CANCELLED" ||
                        data.status === "OVERDUE"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }`}
              ></div>
              <span>{toStartCase(data.status)}</span>
            </div>
          </p>
          <p className="flex" suppressHydrationWarning>
            <span className="font-bold">Due Date:&nbsp;</span>
            {new Date(data.dueDate).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-7">
          <LoanDetailsTable loanData={data} />
        </div>

        {userAccessRights?.includes("Collection") && data.signature !== null ? (
          <div className="mt-5 flex flex-col items-center">
            <p className="font-semibold">Loaner&apos;s Signature</p>
            <Image
              src={data.signature}
              width={400}
              height={200}
              alt="Loaner's Signature"
            />
          </div>
        ) : null}

        <div className="mt-10">
          {userAccessRightsIsLoading || userAccessRights == undefined ? (
            <Skeleton className="h-10 w-1/6" />
          ) : (
            <LoanActions
              isPendingRequestCollection={isPendingRequestCollection}
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
