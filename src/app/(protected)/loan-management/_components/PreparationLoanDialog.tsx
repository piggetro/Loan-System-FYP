import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import React, { useState } from "react";
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
import { Loader2, X } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/app/_components/ui/use-toast";
import { Button } from "@/app/_components/ui/button";

const formSchema = z.object({
  id: z.string().min(1).max(50),
  collectionRefNum: z.string().min(1).max(50),
  loanedItem: z.array(
    z.object({
      loanItemId: z.string().min(1),
      equipmentId: z.string().min(1),
      description: z.string().min(1),
      checklist: z.string().optional(),
      assetNumber: z.string().min(1),
    }),
  ),
});

type PreparationDataType = {
  equipmentId: string;
  loanItemId: string;
  description: string;
  checklist: string | undefined;
  assetNumber: string;
};

const PreparationLoanDialog: React.FC<{
  closeDialog: () => void;
  id: string;
}> = ({ closeDialog, id }) => {
  const [isPreparing, setIsPreparing] = useState<boolean>(false);
  const { isFetching, data } = api.loanRequest.getPrepareLoanById.useQuery({
    id: id,
  });
  const prepareLoan = api.loanRequest.prepareLoanRequest.useMutation();
  const processedLoanData: PreparationDataType[] = [];
  const { toast: preperationLoanToast } = useToast();

  data?.loanItems.forEach((loanItem) => {
    processedLoanData.push({
      equipmentId: loanItem.equipment!.id,
      loanItemId: loanItem.id,
      description: loanItem.equipment!.name,
      checklist: loanItem.equipment!.checklist ?? "",
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
    setIsPreparing(true);
    prepareLoan
      .mutateAsync(values)
      .then((results) => {
        setIsPreparing(false);
        preperationLoanToast({
          title: results.title,
          description: results.description,
          // @ts-expect-error ggg
          variant: results.variant,
        });
        closeDialog();
      })
      .catch((error) => {
        setIsPreparing(false);
        console.log(error);
      });
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
    <div className="w-7/8 h-full overflow-y-scroll p-5">
      <div className="flex">
        <div className="flex w-1/2 flex-col">
          <div className="text-xl font-bold">{data.loanId}</div>
          <div className="mt-4 text-sm">
            <p className="flex">
              <span className="font-bold">Loaner:&nbsp;</span>{" "}
              {data.loanedBy === null ? "Deleted User" : data.loanedBy.name}
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
              <span className="font-bold">Loan Status:&nbsp;</span>{" "}
              {data.status}
            </p>
            <p className="flex" suppressHydrationWarning>
              <span className="font-bold">Due Date:&nbsp;</span>
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
                  <TableRow key={loanItem.equipmentId}>
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
              type="button"
            >
              Close
            </Button>
            <Button
              type="submit"
              onClick={() => {
                console.log("lolll");
              }}
              disabled={isPreparing}
            >
              {isPreparing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ready For Collection
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PreparationLoanDialog;
