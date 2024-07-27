/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/app/_components/ui/input";
import { api } from "@/trpc/react";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/app/_components/ui/use-toast";
import { Button } from "@/app/_components/ui/button";
import { Dialog, DialogContent } from "@/app/_components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

const formSchema = z.object({
  id: z.string().min(1).max(50),
  loanItems: z.array(
    z.object({
      equipmentId: z.string().min(1),
      description: z.string().min(1),
      checklist: z.string().optional(),
      quantityRequested: z.number().min(1),
      quantityApproved: z.string().min(1),
    }),
  ),
});

const ApprovalLoanDialog: React.FC<{
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  successCloseDialog: () => void;
  id: string;
}> = ({ isDialogOpen, setIsDialogOpen, id, successCloseDialog }) => {
  const [isPreparing, setIsPreparing] = useState<boolean>(false);
  const { isFetching, data } = api.loanRequest.getLoanToApproveById.useQuery({
    id: id,
  });
  const approveLoan = api.loanRequest.approveLoanRequestWithId.useMutation();
  const { toast: approvalLoanToast } = useToast();
  const [selectItems, setSelectItems] = useState<string[][]>([]);

  const processedLoanData = useMemo(() => {
    setSelectItems([]);
    return data?.loanItems.map((loanItem) => {
      const tempArray: string[] = [];
      for (let i = 0; i <= loanItem.quantityRequested; i++) {
        tempArray.push(i.toString());
      }
      setSelectItems((prevSelectItems) => [...prevSelectItems, tempArray]);

      return {
        equipmentId: loanItem.id ?? "",
        description: loanItem.name ?? "",
        checklist: loanItem.checklist ?? "",
        quantityRequested: loanItem.quantityRequested,
        quantityApproved: loanItem.quantityRequested.toString(),
      };
    });
  }, [data]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (id && data && processedLoanData) {
      form.reset({
        id: id,
        loanItems: processedLoanData,
      });
    }
  }, [id, data, processedLoanData, form]);

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      console.log(values);
      setIsPreparing(true);
      approveLoan
        .mutateAsync(values)
        .then((results) => {
          setIsPreparing(false);
          approvalLoanToast({
            title: results.title,
            description: results.description,
            // @ts-expect-error ggg
            variant: results.variant,
          });
          if (results.variant === "default") {
            successCloseDialog();
          }
        })
        .catch((error) => {
          setIsPreparing(false);
          console.log(error);
        });
    },
    [approveLoan, approvalLoanToast, setIsDialogOpen],
  );

  if (isFetching || !data) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="h-3/4 w-11/12 max-w-none pt-10">
          <div className="w-7/8 h-full p-5 ">
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="mt-4 h-5 w-96" />
            <Skeleton className="mt-2 h-5 w-96" />
            <Skeleton className="mt-2 h-5 w-96" />
            <Skeleton className="mt-2 h-5 w-96" />
            <Skeleton className="mt-5 h-96 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="h-3/4 w-11/12 max-w-none pt-10">
        <div className="w-7/8 h-full overflow-y-scroll px-5">
          <div className="flex">
            <div className="flex w-1/2 flex-col">
              <div className="text-xl font-bold">{data.loanId}</div>
              <div className="mt-4 text-sm">
                <p className="flex">
                  <span className="font-bold">Borrower:&nbsp;</span>{" "}
                  {data.loanedBy === null ? "Deleted User" : data.loanedBy.name}
                </p>
                <p className="flex">
                  <span className="font-bold">Approved By:&nbsp;</span>
                  {data.approvedBy?.name ?? "-"}
                </p>
                <p className="flex">
                  <span className="font-bold">Remark(s):&nbsp;</span>{" "}
                  {data.remarks}
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
                  <span className="font-bold">Loan Status:&nbsp;</span>
                  <div className="flex items-center">
                    <div
                      className={`mr-1 h-3 w-3 rounded-full ${
                        data.status === "COLLECTED" ||
                        data.status === "RETURNED"
                          ? "bg-green-500"
                          : data.status === "REJECTED" ||
                              data.status === "CANCELLED"
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
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="mt-7">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">Item Description</TableHead>
                      <TableHead className="w-1/2">Checklist</TableHead>
                      <TableHead>Quantity Requested</TableHead>
                      <TableHead>Quantity Approved</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedLoanData!.map((loanItem, index) => (
                      <TableRow key={loanItem.equipmentId}>
                        <TableCell className="font-medium">
                          {loanItem.description}
                        </TableCell>
                        <TableCell>{loanItem.checklist}</TableCell>
                        <TableCell>{loanItem.quantityRequested}</TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`loanItems.${index}.quantityApproved`}
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <FormControl>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={loanItem.quantityRequested.toString()}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select Quantity" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {selectItems[index]?.map((item) => {
                                          return (
                                            <SelectItem key={item} value={item}>
                                              {item}
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-10 flex justify-center gap-3">
                <Button
                  variant={"secondary"}
                  className="bg-gray-300 hover:bg-gray-200"
                  onClick={() => {
                    setIsDialogOpen(false);
                  }}
                  type="button"
                >
                  Close
                </Button>
                <Button type="submit" disabled={isPreparing}>
                  {isPreparing && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Approve Loan
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
function toStartCase(string: string) {
  return string
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
export default ApprovalLoanDialog;
