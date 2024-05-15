"use client";

import { type ColumnDef } from "@tanstack/react-table";
import DataTableRowActions from "./DataTableRowActions";
import { TrackLoansType } from "../page";

interface ColumnProps {
    onView: (value: TrackLoansType) => void;
}

export const columns = ({
    onView,
}: ColumnProps): ColumnDef<TrackLoansType>[] => [
        {
            accessorKey: "loanId",
            header: "Loan ID",
        },
        {
            accessorKey: "dateRequested",
            header: "Date Requested",
            cell: ({ row }) => {
                const dateRequestedValue = row.getValue("dateRequested");
                if (dateRequestedValue !== null) {
                    const dateRequested = new Date(row.getValue("dateRequested")).toLocaleDateString("en-SG");
                    return <div suppressHydrationWarning>{dateRequested}</div>
                } else {
                    return "";
                }
            },
        },
        {
            accessorKey: "dateCollected",
            header: "Date Collected",
            cell: ({ row }) => {
                const dateCollectedValue = row.getValue("dateCollected");
                if (dateCollectedValue !== null) {
                    const dateCollected = new Date(row.getValue("dateCollected")).toLocaleDateString("en-SG");
                    return <div suppressHydrationWarning>{dateCollected}</div>
                } else {
                    return "";
                }
            },
        },
        {
            accessorKey: "dueDate",
            header: "Due Date",
            cell: ({ row }) => {
                const dueDateValue = row.getValue("dueDate");
                if (dueDateValue !== null) {
                    const dueDate = new Date(row.getValue("dueDate")).toLocaleDateString("en-SG");
                    return <div suppressHydrationWarning>{dueDate}</div>
                } else {
                    return "";
                }
            },
        },
        {
            accessorKey: "approvingLecturer",
            header: "Approver",
        },
        {
            accessorKey: "status",
            header: "Status",
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DataTableRowActions row={row} onView={onView} />
            ),
        },
    ];