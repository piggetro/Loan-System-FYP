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

import { Input } from "@/app/_components/ui/input";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/app/_components/ui/use-toast";
import { ApprovalManagementType } from "../page";

const ViewLoanRequest: React.FC<ApprovalManagementType> = () => {
  const { toast } = useToast();

  return (
    <DialogContent className="max-w-screen w-5/6">
      <DialogHeader>
        <DialogTitle className="text-2xl">Review Loan Request</DialogTitle>
      </DialogHeader>

      <DialogFooter>
        <DialogClose className="mr-3">
          <Button className="bg-gray-400 hover:bg-gray-600">Close</Button>
        </DialogClose>
        <Button type="submit" className="w-28">
          {<Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ViewLoanRequest;
