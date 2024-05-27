"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "./DataTable";
import { columns } from "./TrackLoansColumns";
import { TrackLoansType } from "../page";

interface trackLoansTableProps {
    trackLoans: TrackLoansType[];
    allSemesters: {name: string}[];
}

const TrackLoansTable = ({
    trackLoans,
    allSemesters,
}: trackLoansTableProps) => {
    const router = useRouter();
    const onView = useCallback((trackLoans: TrackLoansType) => {
        // Insert Code for redirection to specified Loan Details.
        router.push(`/equipment-loans/loans/${trackLoans.id}`);
    }, []);

    const TableColumns = useMemo(() => columns({ onView }), []);

    return (
        <DataTable data={trackLoans} columns={TableColumns} allSemesters={allSemesters}/>
    );
}

export default TrackLoansTable;