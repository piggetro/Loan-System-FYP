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
  AlertDialogContent,
} from "@/app/_components/ui/alert-dialog";

const LoanDetails: React.FC<{
  id: string;
}> = ({ id }) => {
  const {
    refetch: userAccessRightsRefetch,
    isLoading: userAccessRightsIsLoading,
    data: userAccessRights,
  } = api.loan.getUsersLoanAccess.useQuery({
    id: id,
  });
  const [openCollectLoanDialog, setOpenCollectLoanDialog] =
    useState<boolean>(false);
  const approveRequest = api.loanRequest.approveLoanRequestWithId.useMutation();
  const requestCollection = api.loanRequest.requestForCollection.useMutation();
  const { toast } = useToast();
  const { isFetching, refetch, data } = api.loan.getLoanById.useQuery({
    id: id,
  });
  function refresh() {
    refetch().catch((error) => {
      console.log(error);
    });
  }

  const onApprove = useCallback(() => {
    approveRequest
      .mutateAsync({
        id: id,
      })
      .then((results) => {
        // console.log("jelo");
        // toast({
        //   title: "Loan has been approved",
        //   description: `Loan ${results} has been approved`,
        // });

        //Updating frontend for UX
        userAccessRightsRefetch().catch((error) => {
          console.log(error);
        });
        refresh();
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  const onReject = useCallback(() => {
    //Derricks part, use api.loanRequest.rejectLoanRequest
    console.log("onreject");
  }, []);
  const onRequestForCollectionLoan = useCallback(() => {
    requestCollection
      .mutateAsync({ id: id })
      .then(() => {
        refresh();
      })
      .catch(() => {
        //handle error
      });
    console.log("onreject");
  }, []);
  const onPrepareLoan = useCallback(() => {
    console.log("onreject");
  }, []);
  const onCollectLoan = useCallback(() => {
    setOpenCollectLoanDialog(true);
  }, []);
  const onReturnLoan = useCallback(() => {
    setOpenCollectLoanDialog(true);
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
  return (
    <div className="w-full">
      <AlertDialog open={openCollectLoanDialog}>
        <AlertDialogContent className=" h-3/4 w-11/12 max-w-none">
          <CollectionLoanDialog
            closeDialog={() => {
              setOpenCollectLoanDialog(false);
              // refetch().catch(() => {
              //   toast({
              //     title: "Something Unexpected Happen",
              //     description:
              //       "Please refresh your browser to view updated data",
              //   });
              // });
            }}
            id={id}
          />
        </AlertDialogContent>
      </AlertDialog>
      <div className="w-7/8 h-full  rounded-lg bg-white p-5 shadow-lg">
        <div className="text-xl font-bold">{data.loanId}</div>
        <div className="mt-4 text-sm">
          <p className="flex">
            <span className="font-bold">Loaner:&nbsp;</span>{" "}
            {data.loanedBy.name}
          </p>
          <p className="flex">
            <span className="font-bold">Approved By:&nbsp;</span>
            {data.approvedBy?.name ?? "-"}
          </p>
          <p className="flex">
            <span className="font-bold">Remark(s):&nbsp;</span> {data.remarks}
          </p>
          <p className="flex">
            <span className="font-bold">Prepared By:&nbsp;</span>
            {data.preparedBy?.name ?? "-"}
          </p>
          <p className="flex">
            <span className="font-bold">Issued By:&nbsp;</span>
            {data.issuedBy?.name ?? "-"}
          </p>
          <p className="flex">
            <span className="font-bold">Returned To:&nbsp;</span>
            {data.returnedTo?.name ?? "-"}
          </p>
          <p className="flex">
            <span className="font-bold">Loan Status:&nbsp;</span> {data.status}
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
