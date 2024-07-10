/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { Skeleton } from "@/app/_components/ui/skeleton";
import { api } from "@/trpc/react";

import Image from "next/image";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useToast } from "@/app/_components/ui/use-toast";

import { Button } from "@/app/_components/ui/button";
import { type WaiveRequestStatus } from "@/db/enums";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";

type LostBrokenLoanItemDataType = {
  id: string;
  status: WaiveRequestStatus;
  remarks: string | null;
  loanId: string;
  dateIssued: Date;
  reason: string | null;
  approvedByUserId: string | null;
  loanItemId: string;
  equipment_name: string | null;
  equipment_checklist: string | null;
};

const formSchema = z.object({
  outstandingItems: z.array(
    z.object({
      id: z.string().min(1),
      reason: z.string().min(5),
      status: z.string().min(1),
    }),
  ),
});

const LostBrokenLoanDetails: React.FC<{
  id: string;
}> = ({ id }) => {
  //For Action Button Loading States
  const [isSubmitEnabled, setIsSubmitEnabled] = useState<boolean>(false);
  const [processedLostBrokenLoanData, setProcessedLostBrokenLoanData] =
    useState<LostBrokenLoanItemDataType[]>();
  const [processedLostBrokenItems, setProcessedLostBrokenItems] =
    useState<{ id: string; reason: string; status: string }[]>();

  const { toast } = useToast();
  //Get the Loan
  const { isFetching, refetch, data } =
    api.loan.getLostBrokenLoanByLoanId.useQuery({
      id: id,
    });
  //For Submitting Waiver
  const submitWaiver = api.waiver.proccessWaiverRequest.useMutation();

  useEffect(() => {
    if (data != undefined) {
      setProcessedLostBrokenLoanData(data?.loanItems);
    }
  }, [data]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });
  useEffect(() => {
    const proccessedData = data?.loanItems.map((item) => {
      if (item.status === "AWAITING_REQUEST") setIsSubmitEnabled(true);

      return {
        id: item.id,
        reason: item.reason ?? "",
        status: item.status,
      };
    });
    setProcessedLostBrokenItems(proccessedData);
  }, [data]);

  useEffect(() => {
    if (id && data && processedLostBrokenItems) {
      form.reset({
        outstandingItems: processedLostBrokenItems,
      });
    }
  }, [id, data, processedLostBrokenItems, form]);
  //To Refresh

  function refresh() {
    refetch().catch(() => {
      toast({
        title: "An Error Occured",
        description: "Please refresh the page to see updated details",
      });
    });
  }
  function onSubmit(values: z.infer<typeof formSchema>) {
    submitWaiver
      .mutateAsync({ outstandingItems: values.outstandingItems })
      .then(() => {
        toast({
          title: "Successfully Submitted Waive Request",
          description: "You Will be notified once Waiver has been reviewed",
        });
        refresh();
        setIsSubmitEnabled(false);
      })
      .catch((error) => {
        toast({ title: error });
      });
  }

  if (isFetching || !data || !processedLostBrokenLoanData) {
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mt-7">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Item Description</TableHead>

                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Waive Request</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedLostBrokenLoanData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.equipment_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div
                            className={`mr-2 h-3 w-3 rounded-full ${
                              item.status === "APPROVED"
                                ? "bg-green-500"
                                : item.status === "PENDING" ||
                                    item.status === "AWAITING_REQUEST"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                          ></div>
                          <p> {toStartCase(item.status)}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.remarks}</TableCell>

                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`outstandingItems.${index}.reason`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  disabled={
                                    item.status === "APPROVED" ||
                                    item.status === "PENDING"
                                  }
                                  placeholder="Enter Here"
                                  {...field}
                                  onClick={() => {
                                    setIsSubmitEnabled(true);
                                  }}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-10 flex justify-center">
              <Button disabled={!isSubmitEnabled} type="submit">
                Submit
              </Button>
            </div>
          </form>
        </Form>
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

export default LostBrokenLoanDetails;
