/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { api } from "@/trpc/react";
import React, { useCallback, useMemo, useState } from "react";

import { useRouter } from "next/navigation";
import { type LoanTableDataType } from "../page";
import { LoanPendingApprovalColumns } from "./LoanColumns";
import { DefaultLoanDataTable } from "./LoanDataTable";
import { Loader2 } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import { Skeleton } from "@/app/_components/ui/skeleton";
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
import { useToast } from "@/app/_components/ui/use-toast";

const LoanPage: React.FC<{
  allSemesters: { name: string }[];
  userLoans: LoanTableDataType[];
}> = ({ allSemesters }) => {
  const { data, refetch } = api.loan.getUsersLoans.useQuery();
  const requestCollection = api.loanRequest.requestForCollection.useMutation();
  const cancelLoan = api.loanRequest.cancelLoan.useMutation();

  const { toast } = useToast();
  const router = useRouter();
  const [openCancelDialog, setOpenCancelDialog] = useState<boolean>(false);
  const [openRequestDialog, setOpenRequestDialog] = useState<boolean>(false);
  const [requestCollectionId, setRequestCollectionId] = useState<string>();
  const [pendingCancel, setPendingCancel] = useState<boolean>();
  const [cancelId, setCancelId] = useState<string>();
  // const [loanPendingApprovalData, setLoanPendingApprovalData] = useState()
  const loanPendingApprovalData = data?.filter(
    (loan) => loan.status === "PENDING_APPROVAL",
  );

  const loanCollectionRequest = data?.filter(
    (loan) => loan.status === "REQUEST_COLLECTION",
  );

  const prepCollectRequest = data?.filter(
    (loan) => loan.status === "PREPARING" || loan.status === "READY",
  );

  const collectedRequest = data?.filter((loan) => loan.status === "COLLECTED");

  const onView = useCallback((loanDetails: LoanTableDataType) => {
    router.push(`/equipment-loans/loans/${loanDetails.id}`);
  }, []);
  const onCancel = useCallback((loanDetails: LoanTableDataType) => {
    setOpenCancelDialog(true);
    setCancelId(loanDetails.id);

    //Delete Loan **Issue is the count will be screwed in db
  }, []);
  const executeCancel = () => {
    setPendingCancel(true);
    if (cancelId != undefined) {
      cancelLoan
        .mutateAsync({ id: cancelId })
        .then(() => {
          setOpenCancelDialog(false);
          setCancelId("");
          setPendingCancel(false);
          refetch().catch((error) => {
            console.log(error);
            toast({
              title: "Something Unexpected Happened",
              description: "Please contact help desk",
              variant: "destructive",
            });
          });
        })
        .catch(() => {
          setPendingCancel(false);
          toast({
            title: "Something Unexpected Happened",
            description: "Please contact help desk",
            variant: "destructive",
          });
        });
    } else {
      setPendingCancel(false);
      toast({
        title: "Something Unexpected Happened",
        description: "Please contact help desk",
        variant: "destructive",
      });
    }
  };
  const onRequestCollection = useCallback((loanDetails: LoanTableDataType) => {
    setOpenRequestDialog(true);
    setRequestCollectionId(loanDetails.id);
  }, []);
  const executeRequestCollection = () => {
    //Request collection
    requestCollection
      .mutateAsync({ id: requestCollectionId! })
      .then((results) => {
        if (results === "PREPARING") {
          toast({
            title: "Request For Collection is Successful",
            description: "Loan is now Preparing",
          });
          refetch().catch(() => {
            //handle error
          });
        } else {
          toast({
            title: "Request Collection Was Unsuccessful",
            description:
              "The Equipment that you have requested is currently unavailable.\nAll Loan Request are subject to Equipment Availability",
          });
        }
      })
      .catch(() => {
        toast({
          title: "Something Unexpected Happened",
          description: "Contact Help Desk For Assistance",
        });
        //handle error
      });
  };
  const PendingApprovalColumns = useMemo(
    () =>
      LoanPendingApprovalColumns({
        onView,
        onCancel,
        onRequestCollection,
      }),
    [],
  );

  return (
    <div className="rounded-lg bg-white p-5 shadow-lg">
      <AlertDialog open={openCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will cancel your Loan Request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setOpenCancelDialog(false);
              }}
              disabled={pendingCancel}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                executeCancel();
              }}
              disabled={pendingCancel}
            >
              Continue
              {pendingCancel && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
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
              disabled={pendingCancel}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                executeRequestCollection();
              }}
              disabled={pendingCancel}
            >
              Continue
              {pendingCancel && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Tabs defaultValue="penApproval">
        <div className=" rounded-md bg-white px-6">
          <TabsList className="mb-2">
            <TabsTrigger value="penApproval">Pending Approval</TabsTrigger>
            <TabsTrigger value="collectionReq">Collection Request</TabsTrigger>
            <TabsTrigger value="prepCollect">
              Preperation/Collection
            </TabsTrigger>
            <TabsTrigger value="collected">Collected</TabsTrigger>
          </TabsList>
          <TabsContent value="penApproval">
            {loanPendingApprovalData !== undefined ? (
              <DefaultLoanDataTable
                data={loanPendingApprovalData}
                columns={PendingApprovalColumns}
                allSemesters={allSemesters}
                filterOptions={null}
              />
            ) : (
              <div>
                <Skeleton className=" h-7 w-1/2" />
                <div className="mt-5 flex flex-col items-center gap-3">
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="collectionReq">
            {loanCollectionRequest !== undefined ? (
              <DefaultLoanDataTable
                data={loanCollectionRequest}
                columns={PendingApprovalColumns}
                allSemesters={allSemesters}
                filterOptions={"collectionReq"}
              />
            ) : (
              <div>
                <Skeleton className=" h-7 w-1/2" />
                <div className="mt-5 flex flex-col items-center gap-3">
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="prepCollect">
            {prepCollectRequest !== undefined ? (
              <DefaultLoanDataTable
                data={prepCollectRequest}
                columns={PendingApprovalColumns}
                allSemesters={allSemesters}
                filterOptions={"prepCollect"}
              />
            ) : (
              <div>
                <Skeleton className=" h-7 w-1/2" />
                <div className="mt-5 flex flex-col items-center gap-3">
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="collected">
            {collectedRequest !== undefined ? (
              <DefaultLoanDataTable
                data={collectedRequest}
                columns={PendingApprovalColumns}
                allSemesters={allSemesters}
                filterOptions={null}
              />
            ) : (
              <div>
                <Skeleton className=" h-7 w-1/2" />
                <div className="mt-5 flex flex-col items-center gap-3">
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                  <Skeleton className=" h-7 w-full" />
                </div>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default LoanPage;
