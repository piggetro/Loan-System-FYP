"use client";

import type { ColumnDef } from "@tanstack/react-table";
import LoanDataTableRowActions from "./LoanDataTableRowActions";

export type CurrentLoans = {
  id: string;
  loanId: string;
  dueDate: Date;
};

interface CurrentLoansProps {
  onView: (value: CurrentLoans) => void;
}

export const currentLoansColumns = ({
  onView,
}: CurrentLoansProps): ColumnDef<CurrentLoans>[] => [
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
    id: "actions",
    cell: ({ row }) => <LoanDataTableRowActions row={row} onView={onView} />,
  },
];
