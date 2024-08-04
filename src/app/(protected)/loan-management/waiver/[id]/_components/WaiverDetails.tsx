/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { Skeleton } from "@/app/_components/ui/skeleton";
import { api } from "@/trpc/react";
import LoanDetailsTable from "./WaiverDetailsTable";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/app/_components/ui/use-toast";
import { Button } from "@/app/_components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Label } from "@/app/_components/ui/label";

const WaiverDetails: React.FC<{
  id: string;
}> = ({ id }) => {
  const router = useRouter();
  const { toast } = useToast();
  //For Approve and Reject Actions
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState<boolean>(true);
  const { isFetching, refetch, data } = api.waiver.getWaiverByLoanId.useQuery({
    id: id,
  });
  const approveWaiver = api.waiver.approveWaiver.useMutation();
  const rejectLoan = api.waiver.rejectWaiver.useMutation();
  const resolveLoan = api.waiver.resolveWaiver.useMutation();
  useEffect(() => {
    if (data !== undefined) {
      if (data.status === "REJECTED" || data.status === "APPROVED")
        setIsSubmitEnabled(false);
    }
  }, [data]);
  const onApprove = useCallback(() => {
    setIsLoading(true);
    approveWaiver
      .mutateAsync({ id: id })
      .then(() => {
        toast({ title: "Successfully Approved Waive Request" });
        refresh();
        setIsLoading(false);
      })
      .catch((error) => {
        toast({ title: "An Error Occured", description: error });
      });
  }, []);
  const onReject = useCallback(() => {
    setIsLoading(true);
    rejectLoan
      .mutateAsync({ id: id })
      .then(() => {
        toast({ title: "Successfully Rejected Waive Request" });
        refresh();
        setIsLoading(false);
      })
      .catch((error) => {
        toast({ title: "An Error Occured", description: error });
      });
  }, []);
  const onResolve = useCallback(() => {
    setIsLoading(true);
    resolveLoan
      .mutateAsync({ id: id })
      .then(() => {
        toast({ title: "Successfully Resolved Waive Request" });
        refresh();
        setIsLoading(false);
      })
      .catch((error) => {
        toast({ title: "An Error Occured", description: error });
      });
  }, []);
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
      <div className="w-7/8 mb-10  h-full rounded-lg bg-white p-5 shadow-lg">
        <div className="text-xl font-bold">{data.loanId}</div>
        <div className="mt-4 text-sm">
          <p className="flex">
            <span className="font-bold">Borrower:&nbsp;</span>
            {!data.loanedBy ? "Deleted Account" : data.loanedBy?.name}
          </p>
          <p className="flex">
            <span className="font-bold">Approved By:&nbsp;</span>
            {data.approvedBy?.name ?? "-"}
          </p>
          <p className="flex">
            <span className="font-bold">Remark(s):&nbsp;</span>
            {data.loanRemarks}
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
        <div className="mt-5 text-sm">
          <p className="mb-3 text-xl font-semibold">Waiver</p>
          <p>
            <b>Waiver Remarks:</b> {data.remarks}
          </p>
          <p suppressHydrationWarning>
            <b>Date Issued: </b>
            {data.dateIssued.toLocaleDateString()}
          </p>
          <p className="flex items-center">
            <b>Waiver Status: </b>
            <div
              className={`ml-2 mr-1 h-3 w-3 rounded-full ${
                data.status === "APPROVED" || data.status === "RESOLVED"
                  ? "bg-green-500"
                  : data.status === "REJECTED"
                    ? "bg-red-500"
                    : "bg-yellow-500"
              }`}
            ></div>
            <span>{toStartCase(data.status)}</span>
          </p>
          <p suppressHydrationWarning>
            <b>Date Updated: </b>
            {data.dateUpdated === null
              ? "-"
              : data.dateUpdated.toLocaleDateString()}
          </p>
          <p>
            <b>Updated By: </b>
            {data.updatedByName?.name ?? "-"}
          </p>
          <div className="mt-5">
            <div className="mb-1 flex items-start space-x-4">
              <div className="w-3/4">
                <p className="mb-2 text-lg font-semibold">Waive Request</p>

                <p className="min-h-20 w-full rounded-md border-2 p-2">
                  {data.waiveRequest ?? (
                    <span className="flex min-h-20 w-full items-center justify-center text-lg font-medium text-red-500 ">
                      Awaiting Request
                    </span>
                  )}
                </p>
              </div>
              <div className="w-1/4">
                <Label htmlFor="file-upload">
                  Upload any necessary evidence
                </Label>
                <div className="mt-4 flex-shrink-0">
                  <img
                    src={"/api/uploads/" + data.imagePath}
                    alt="Selected File Preview"
                    className="h-40 w-40 border border-gray-300 object-cover"
                  />
                </div>
              </div>
            </div>

            <p>
              <b>Submitted On: </b>
              {data.dateSubmitted?.toLocaleString() ?? ""}
            </p>

            <div className="mt-4 flex w-full justify-center gap-3">
              <Button
                onClick={() => {
                  onReject();
                }}
                className={`${data.status === "REJECTED" || data.status === "APPROVED" || data.status === "RESOLVED" ? "hidden" : ""}`}
                disabled={isLoading || !isSubmitEnabled}
                variant={"destructive"}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reject
              </Button>
              <Button
                onClick={() => {
                  onResolve();
                }}
                className={`${data.status === "APPROVED" || data.status === "RESOLVED" ? "hidden" : ""}`}
                disabled={isLoading || !isSubmitEnabled}
                variant={"default"}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Resolve
              </Button>
              <Button
                onClick={() => {
                  onApprove();
                }}
                disabled={isLoading || !isSubmitEnabled}
                variant={"default"}
                className={`${data.status === "REJECTED" || data.status === "APPROVED" || data.status === "RESOLVED" ? "hidden" : ""}`}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Approve
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-7">
          <div className="flex justify-between">
            <p className="mb-4 text-xl font-semibold">Outstanding Items</p>
            <Button
              onClick={() => {
                router.push(
                  `/equipment-loans/loans/${id}?ooid=true&prev=waiver&loan=${id}`,
                );
              }}
            >
              Resolve Outstanding Items
            </Button>
          </div>

          <LoanDetailsTable outstandingItems={data.loanItems} />
        </div>
      </div>
    </div>
  );
};
function toStartCase(string: string) {
  return string
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
export default WaiverDetails;
