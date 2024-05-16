import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { Button } from "@/app/_components/ui/button";
import React from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import page from "../../page";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/app/_components/ui/input";
import { api } from "@/trpc/react";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useForm } from "react-hook-form";
import { Label } from "@/app/_components/ui/label";
import { X } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/app/_components/ui/use-toast";

const formSchema = z.object({
  id: z.string().min(1).max(50),
  collectionRefNum: z.string().min(1).max(50),
  loanedItem: z.array(
    z.object({
      id: z.string().min(1).default(""),
      description: z.string().min(1),
      checklist: z.string().optional(),
      assetNumber: z.string().min(1),
    }),
  ),
});

type PreparationDataType = {
  id: string;
  description: string;
  checklist: string | undefined;
  assetNumber: string;
};

const PreparationLoanDialog: React.FC<{
  closeDialog: () => void;
  id: string;
}> = ({ closeDialog, id }) => {
  const { isFetching, data } = api.loan.getLoanById.useQuery({ id: id });
  const prepareLoan = api.loanRequest.prepareLoanRequest.useMutation();
  const processedLoanData: PreparationDataType[] = [];
  const { toast: preperationLoanToast } = useToast();
  data?.loanItems.forEach((loanItem) => {
    processedLoanData.push({
      id: loanItem.equipment.id,
      description: loanItem.equipment.name,
      checklist: !loanItem.equipment.checklist
        ? undefined
        : loanItem.equipment.checklist,
      assetNumber: "",
    });
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: id,
      collectionRefNum: "",
      loanedItem: processedLoanData,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    prepareLoan
      .mutateAsync(values)
      .then((results) => {
        preperationLoanToast({
          title: results.title,
          description: results.description,
          // @ts-expect-error ggg
          variant: results.variant,
        });
      })
      .catch((error) => {
        console.log("error");
      });
    console.log(values);
  }

  if (isFetching || !data) {
    return (
      <div className="w-7/8 h-full p-5 ">
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
    <div className="w-7/8 h-full  overflow-scroll p-5">
      <div className="flex">
        <div className="flex w-1/2 flex-col">
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
              {new Date(data.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex w-1/2 justify-end">
          <div
            onClick={() => {
              closeDialog();
            }}
          >
            <X></X>
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
                  <TableHead>Asset Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedLoanData.map((loanItem, index) => (
                  <TableRow key={loanItem.id}>
                    <TableCell className="font-medium">
                      {loanItem.description}
                    </TableCell>
                    <TableCell>{loanItem.checklist}</TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`loanedItem.${index}.assetNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Enter Here" {...field} />
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
            <div className="flex items-center">
              <FormField
                control={form.control}
                name="collectionRefNum"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collection Reference Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Here" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="mt-10 flex justify-center gap-3">
            <Button
              variant={"secondary"}
              className="bg-gray-300 hover:bg-gray-200"
              onClick={() => {
                closeDialog();
              }}
            >
              Close
            </Button>
            <Button type="submit">Ready For Collection</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PreparationLoanDialog;
