/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { Skeleton } from "@/app/_components/ui/skeleton";
import { api } from "@/trpc/react";
import { useEffect } from "react";
import { useToast } from "@/app/_components/ui/use-toast";
import { Button } from "@/app/_components/ui/button";
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
  FormField,
  FormItem,
  FormMessage,
} from "@/app/_components/ui/form";
import { Textarea } from "@/app/_components/ui/textarea";
const formSchema = z.object({
  //Change this for the word requirement
  waiverRequest: z.string().min(1),
});

const LostBrokenLoanDetails: React.FC<{
  id: string;
}> = ({ id }) => {
  const { toast } = useToast();
  //Get the Loan
  const { isFetching, refetch, data } =
    api.loan.getLostBrokenLoanByLoanId.useQuery({
      id: id,
    });
  //For Submitting Waiver
  const submitWaiver = api.waiver.proccessWaiverRequest.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (data) {
      form.setValue("waiverRequest", data.waiveRequest!);
    }
  }, [data]);
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
      .mutateAsync({ id: id, waiveRequest: values.waiverRequest })
      .then(() => {
        toast({
          title: "Successfully Submitted Waive Request",
          description: "You Will be notified once Waiver has been reviewed",
        });
        refresh();
      })
      .catch((error) => {
        toast({ title: error });
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
            <span className="font-bold">Borrower:&nbsp;</span>
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
          <p className="flex">
            <span className="font-bold">Status:&nbsp;</span>
            <div className="flex items-center">
              <div
                className={`mr-2 h-3 w-3 rounded-full ${
                  data.status === "APPROVED"
                    ? "bg-green-500"
                    : data.status === "PENDING" ||
                        data.status === "AWAITING_REQUEST"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              ></div>
              <p> {toStartCase(data.status)}</p>
            </div>
          </p>
        </div>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <p className="mb-3 mt-5 text-lg font-semibold">Waive Request</p>
              <FormField
                control={form.control}
                name="waiverRequest"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        disabled={data.status !== "AWAITING_REQUEST"}
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="mt-2 text-sm font-medium">
                <b>Submitted On: </b>
                {data.dateSubmitted?.toLocaleString() ?? ""}
              </p>
              <div className="mt-10 flex justify-center">
                <Button
                  disabled={
                    form.getValues("waiverRequest") === "" ||
                    data.status !== "AWAITING_REQUEST" ||
                    form.getValues("waiverRequest") === null ||
                    form.getValues("waiverRequest") === undefined
                  }
                  type="submit"
                >
                  Submit
                </Button>
              </div>
            </form>
          </Form>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mt-7">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Item Description</TableHead>

                    <TableHead>Checklist</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.loanItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.checklist}</TableCell>
                      <TableCell>{item.remarks}</TableCell>
                      <TableCell>$&nbsp;{item.cost ?? "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div
                            className={`mr-2 h-3 w-3 rounded-full ${
                              item.status === "RETURNED"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <p> {toStartCase(item.status!)}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
