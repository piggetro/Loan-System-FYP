"use client";

import { Skeleton } from "@/app/_components/ui/skeleton";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import LoanDetailsTable from "./LoanDetailsTable";
import LoanActions from "./LoanActions";
import { useCallback } from "react";
import { useToast } from "@/app/_components/ui/use-toast";

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
    <div className="w-7/8 h-full  rounded-lg bg-white p-5 shadow-lg">
      <div className="text-xl font-bold">{data.loanId}</div>
      <div className="mt-4 text-sm">
        <p className="flex">
          <p className="font-bold">Loaner:&nbsp;</p> {data.loanedBy.name}
        </p>
        <p className="flex">
          <p className="font-bold">Approved By:&nbsp;</p>
          {data.approvedBy?.name ?? "-"}
        </p>
        <p className="flex">
          <p className="font-bold">Remark(s):&nbsp;</p> {data.remarks}
        </p>
        <p className="flex">
          <p className="font-bold">Prepared By:&nbsp;</p>
          {data.preparedBy?.name ?? "-"}
        </p>
        <p className="flex">
          <p className="font-bold">Issued By:&nbsp;</p>
          {data.issuedBy?.name ?? "-"}
        </p>
        <p className="flex">
          <p className="font-bold">Returned To:&nbsp;</p>
          {data.returnedTo?.name ?? "-"}
        </p>
        <p className="flex">
          <p className="font-bold">Loan Status:&nbsp;</p> {data.status}
        </p>
        <p className="flex" suppressHydrationWarning>
          <p className="font-bold">Due Date:&nbsp;</p>
          {new Date(data.dueDate).toLocaleDateString("en-SG")}
        </p>
      </div>
      <div className="mt-7">
        <LoanDetailsTable loanData={data} />
      </div>
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
          />
        )}
      </div>
    </div>
  );
};

export default LoanDetails;
