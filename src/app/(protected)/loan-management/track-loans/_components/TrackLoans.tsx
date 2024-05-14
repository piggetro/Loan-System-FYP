/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import React from "react";
import { TrackLoansType } from "../page";
import TrackLoansTable from "./TrackLoansTable";

interface TrackLoansProps {
    data: TrackLoansType[];
}

const TrackLoans = ({ data }: TrackLoansProps) => {
    return (
        <div className="mt-2 rounded-md bg-white px-6 py-4">
            <TrackLoansTable
                trackLoans={data}
            />
        </div>
    );
}

export default TrackLoans;