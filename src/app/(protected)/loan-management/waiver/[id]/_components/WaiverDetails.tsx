/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { Skeleton } from "@/app/_components/ui/skeleton";
import { api } from "@/trpc/react";
import LoanDetailsTable from "./WaiverDetailsTable";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useToast } from "@/app/_components/ui/use-toast";

const WaiverDetails: React.FC<{
  id: string;
}> = ({ id }) => {
  //For Action Button Loading States

  const { toast } = useToast();
  const { isFetching, refetch, data } = api.waiver.getWaiverByLoanId.useQuery({
    id: id,
  });

  function refresh() {
    refetch().catch(() => {
      toast({
        title: "An Error Occurred",
        description: "Please refresh the page to see updated details",
      });
    });
  }

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
      <div className="w-7/8 h-full  rounded-lg bg-white p-5 shadow-lg">
        <div className="text-xl font-bold">{data.loanId}</div>
        <div className="mt-4 text-sm">
          <p className="flex">
            <span className="font-bold">Loaner:&nbsp;</span>
            {!data.loanedBy ? "Deleted Account" : data.loanedBy?.name}
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

          <p className="flex" suppressHydrationWarning>
            <span className="font-bold">Date Issued:&nbsp;</span>
            {new Date(data.dateIssued).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-7">
          <LoanDetailsTable
            refresh={() => {
              refresh();
            }}
            outstandingItems={data.loanItems}
          />
        </div>

        {/* <div className="mt-10">
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
        </div> */}
      </div>
    </div>
  );
};

export default WaiverDetails;
