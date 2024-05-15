/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import React from "react";
import { TrackLoansType } from "../page";
import TrackLoansTable from "./TrackLoansTable";

interface TrackLoansProps {
    allSemesters: { name: string }[];
    data: TrackLoansType[];
}

const TrackLoans = ({ data, allSemesters }: TrackLoansProps) => {
    return (
        <div className="mt-2 rounded-md bg-white px-6 py-4">
            <TrackLoansTable
                trackLoans={data} allSemesters={allSemesters}
            />
        </div>
    );
}

export default TrackLoans;