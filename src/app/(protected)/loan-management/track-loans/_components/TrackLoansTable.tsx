"use client";

import React, { useCallback, useMemo, useState } from "react";
import { DataTable } from "./DataTable";
import { columns } from "./TrackLoansColumns";
import { TrackLoansType } from "../page";

interface trackLoansTableProps {
    trackLoans: TrackLoansType[];
}

const TrackLoansTable = ({
    trackLoans,
}: trackLoansTableProps) => {
    const onView = useCallback((trackLoans: TrackLoansType) => {
        // Insert Code for redirection to specified Loan Details.
    }, []);

    const TableColumns = useMemo(() => columns({ onView }), []);

    return (
        <DataTable data={trackLoans} columns={TableColumns} />
    );
}

export default TrackLoansTable;