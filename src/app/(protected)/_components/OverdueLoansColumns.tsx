"use client";

import type { ColumnDef } from "@tanstack/react-table";
import LoanDataTableRowActions from "./LoanDataTableRowActions";

export type OverdueLoans = {
  id: string;
  loanId: string;
  dueDate: Date;
  numberOfDaysDue: string;
};

interface OverdueLoansProps {
  onView: (value: OverdueLoans) => void;
}

export const overdueLoansColumns = ({
  onView,
}: OverdueLoansProps): ColumnDef<OverdueLoans>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: (props) => {
      const date = props.cell.getValue() as Date;
      return <span>{date?.toLocaleDateString("en-SG")}</span>;
    },
  },
  {
    accessorKey: "numberOfDaysDue",
    header: "Number of Days Due",
  },
  {
    id: "actions",
    cell: ({ row }) => <LoanDataTableRowActions row={row} onView={onView} />,
  },
];
