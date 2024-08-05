/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { api } from "@/trpc/react";
import React, { useCallback, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { PreparationColumns } from "./TrackLoansColumns";
import { TrackLoansDataTable } from "./TrackLoansDataTable";
import { Input } from "@/app/_components/ui/input";
import { Button } from "@/app/_components/ui/button";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

export interface TrackLoansType {
  id: string;
  loanId: string;
  remarks: string;
  dueDate: Date;
  status: string;
  dateCreated: Date;
  loanedBy: { name: string } | null;
}

const loanStatus = [
  "PENDING_APPROVAL",
  "REJECTED",
  "REQUEST_COLLECTION",
  "PREPARING",
  "READY",
  "COLLECTED",
  "CANCELLED",
  "RETURNED",
  "PARTIAL_RETURN",
];

type TrackLoansStatus =
  | "PENDING_APPROVAL"
  | "REJECTED"
  | "REQUEST_COLLECTION"
  | "PREPARING"
  | "READY"
  | "COLLECTED"
  | "CANCELLED"
  | "RETURNED"
  | "PARTIAL_RETURN"
  | "All";

const TrackLoansPage: React.FC<{ allSemesters: { name: string }[] }> = ({
  allSemesters,
}) => {
  const { data: data, mutateAsync: fetchSearch } =
    api.loanRequest.searchLoans.useMutation();
  const [debouncerIsLoading, setDebouncerIsLoading] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [semester, setSemester] = useState<string>("All");
  const [status, setStatus] = useState<TrackLoansStatus>("All");
  const router = useRouter();

  //search funtion
  function executeSearch() {
    if (
      searchInput !== "" ||
      (searchInput === "" && semester !== "All") ||
      (searchInput === "" && status !== "All")
    ) {
      setDebouncerIsLoading(true);
      fetchSearch({
        searchInput: searchInput,
        status: status,
        semester: semester,
      })
        .then(() => {
          setDebouncerIsLoading(false);
        })
        .catch((e) => console.log(e));
    }
  }

  const onView = useCallback((loanDetails: TrackLoansType) => {
    router.push(`/equipment-loans/loans/${loanDetails.id}?prev=track`);
  }, []);

  const PreparationTableColumns = useMemo(
    () => PreparationColumns({ onView }),
    [],
  );

  return (
    <div className="rounded-lg bg-white p-5 shadow-lg">
      <div>
        <div>
          <p className="mb-2 font-semibold">Search Loans</p>
        </div>
        <div className="flex gap-3">
          <Input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
            placeholder="Search Loan ID/Borrower Name"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                if (
                  searchInput !== "" ||
                  (searchInput === "" && semester !== "All") ||
                  (searchInput === "" && status !== "All")
                )
                  executeSearch();
              }
            }}
          />
          <Select
            onValueChange={(key) => {
              setSemester(key);
            }}
          >
            <SelectTrigger className="w-1/4 min-w-44">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Semester</SelectLabel>
                <SelectItem key={"All"} value={"All"}>
                  All Semesters
                </SelectItem>
                {allSemesters.map((semester) => (
                  <SelectItem key={semester.name} value={semester.name}>
                    {semester.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(key: TrackLoansStatus) => {
              setStatus(key);
            }}
          >
            <SelectTrigger className="w-1/4 min-w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem key={"All"} value={"All"}>
                  All Status
                </SelectItem>
                {loanStatus.map((status) => (
                  <SelectItem key={status} value={status}>
                    {toStartCase(status)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={() => {
              if (
                searchInput !== "" ||
                (searchInput === "" && semester !== "All") ||
                (searchInput === "" && status !== "All")
              )
                executeSearch();
            }}
          >
            <Search />
          </Button>
        </div>

        <TrackLoansDataTable
          columns={PreparationTableColumns}
          data={data!}
          allSemesters={allSemesters}
          debouncerIsLoading={debouncerIsLoading}
        />
      </div>
    </div>
  );
};
function toStartCase(string: string) {
  return string
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
export default TrackLoansPage;
