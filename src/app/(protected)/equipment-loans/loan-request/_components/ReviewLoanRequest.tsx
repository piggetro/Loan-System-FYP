import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
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

import { Inventory } from "./Columns";
import { Input } from "@/app/_components/ui/input";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/app/_components/ui/use-toast";

type LoanRequestType = {
  remarks: string;
  returnDate: Date;
  approvingLecturer: string;
  approvingLecturerEmail: string;
  equipments: Inventory[];
  closeDialog: (successMessage?: {
    title: string | undefined;
    description: string | undefined;
  }) => void;
};
const ReviewLoanRequest: React.FC<LoanRequestType> = ({
  remarks,
  returnDate,
  approvingLecturer,
  equipments,
  approvingLecturerEmail,
  closeDialog,
}) => {
  const { toast } = useToast();
  const { mutate: createLoanRequest, isPending } =
    api.loanRequest.createLoanRequest.useMutation({
      onSuccess: () => {
        closeDialog({
          title: "Loan Request Made Successfully",
          description: "You may view your Loan Request in Loans",
        });
      },
      onError: (error) => {
        toast({
          title: "Something Unexpected Happened",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  return (
    <DialogContent className="max-w-screen w-5/6">
      <DialogHeader>
        <DialogTitle className="text-2xl">Review Loan Request</DialogTitle>
      </DialogHeader>
      <div className="mt-8 flex flex-col text-lg">
        <p className=" text-xl font-medium">Loan Details</p>
        <div className="mt-5 flex">
          <div className=" flex w-1/2 flex-col">
            <div className=" flex   items-center">
              <Label className="mr-8 w-1/3 text-base">Remarks</Label>
              <Input
                readOnly={true}
                className="h-7  w-1/2 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={remarks}
              />
            </div>
            <div className="mt-2 flex items-center justify-start">
              <Label className="mr-8 w-1/3 text-base">Approving Lecturer</Label>
              <Input
                readOnly={true}
                className="h-7 w-1/2 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={approvingLecturer}
              />
            </div>
          </div>
          <div className="mr-3 w-1/2 ">
            <div className="flex items-center justify-end">
              <Label className=" mr-8 text-base">Return Date</Label>
              <Input
                readOnly={true}
                className="h-7 w-44 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={returnDate.toLocaleDateString()}
              />
            </div>
          </div>
        </div>
        <div className="my-16 ">
          <p className="mb-3 font-medium">Requested Equipment</p>
          <Table className=" ">
            <TableHeader className="border-black">
              <TableRow className=" ">
                <TableHead className="w-1/2">Item Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sub-Category</TableHead>
                <TableHead className="">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipments.map((equipment) => (
                <TableRow key={equipment.equipmentId}>
                  <TableCell className="font-medium">
                    {equipment.itemDescription}
                  </TableCell>
                  <TableCell>{equipment.category}</TableCell>
                  <TableCell>{equipment.subCategory}</TableCell>
                  <TableCell className="">
                    {equipment.quantitySelected}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <DialogFooter>
        <DialogClose className="mr-3">
          <Button
            onClick={() => closeDialog()}
            className="bg-gray-400 hover:bg-gray-600"
          >
            Close
          </Button>
        </DialogClose>
        <Button
          onClick={() => {
            createLoanRequest({
              equipment: equipments,
              remarks: remarks,
              dueDate: returnDate,
              approvingLecturerEmail: approvingLecturerEmail,
            });
          }}
          disabled={isPending}
          type="submit"
          className="w-28"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ReviewLoanRequest;
