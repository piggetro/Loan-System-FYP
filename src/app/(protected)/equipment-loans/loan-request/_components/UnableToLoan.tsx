/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { Button } from "@/app/_components/ui/button";
import { useRouter } from "next/navigation";

const UnableToLoanComponent: React.FC<{
  userOutstandingLoans: {
    outstandingLoans: {
      id: string;
      loanId: string;
      remarks: string;
      status: string;
    }[];
    overdueLoans: { id: string; loanId: string }[];
  };
}> = ({ userOutstandingLoans }) => {
  const router = useRouter();
  return (
    <div>
      <div className="flex h-full flex-col items-center rounded-lg bg-white p-5 shadow-md">
        <h1 className="text-4xl font-bold">
          You are unable to make a loan request
        </h1>
        <p className="mt-5 text-2xl font-semibold">
          Please settle all outstanding loans
        </p>
        <div className="my-10">
          <Table>
            <TableCaption>
              Once all outstanding loans are settled you may make a loan request
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Loan ID</TableHead>
                <TableHead className="w-[200px]">Status</TableHead>
                <TableHead className="w-[300px] text-left">Remarks</TableHead>
                <TableHead className="w-[200px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userOutstandingLoans.overdueLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{loan.loanId}</TableCell>
                  <TableCell>
                    <div className="flex  items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
                      Overdue
                    </div>
                  </TableCell>
                  <TableCell className="w-[300px] text-left ">
                    Please Return Loan
                  </TableCell>
                  <TableCell className="w-[200px] text-center">
                    <Button
                      onClick={() => {
                        router.push(`/equipment-loans/lost-damaged-loans`);
                      }}
                    >
                      View Overdue Loans
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {userOutstandingLoans.outstandingLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{loan.loanId}</TableCell>
                  <TableCell>
                    <div className="flex  items-center">
                      <div
                        className={`mr-2 h-3 w-3 rounded-full ${
                          loan.status === "Partially Outstanding" ||
                          loan.status === "Awaiting Request" ||
                          loan.status === "Pending"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      {loan.status}
                    </div>
                  </TableCell>
                  <TableCell className="w-[300px] text-left ">
                    {loan.remarks === ""
                      ? "No Outstanding Remarks"
                      : loan.remarks}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      onClick={() => {
                        router.push(
                          `/equipment-loans/lost-damaged-loans/${loan.id}`,
                        );
                      }}
                    >
                      Waiver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default UnableToLoanComponent;
