/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";

import React, { useEffect, useState } from "react";
import { EquipmentDataTable, SummaryDataTable } from "./DataTable";
import { equipmentColumns, summaryColumns } from "./Columns";
import { type Inventory } from "./Columns";
import { type Category, type SubCategory } from "@prisma/client";
import { Dialog, DialogTrigger } from "@/app/_components/ui/dialog";
import ReviewLoanRequest from "./ReviewLoanRequest";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { useToast } from "@/app/_components/ui/use-toast";

const formSchema = z.object({
  remarks: z.string().min(2).max(50),
  returnDate: z.string().date(),
});
type ApprovingLecturersType = {
  grantedUser: {
    name: string;
    email: string;
  };
};
const LoanRequestComponent: React.FC<{
  categoriesAndSubCategories: {
    categories: Category[];
    subCategories: SubCategory[];
  };
  equipmentAndInventory: Inventory[];
  approvingLecturers: ApprovingLecturersType[];
}> = ({
  categoriesAndSubCategories,
  equipmentAndInventory,
  approvingLecturers,
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState<Inventory[]>([]);
  const [approvingLecturer, setApprovingLecturer] = useState<string>("");
  const [approvingLecturerEmail, setApprovingLecturerEmail] =
    useState<string>("");
  const [reviewLoanRequestOpen, setReviewLoanRequestOpen] =
    useState<boolean>(false);
  const [remarks, setRemarks] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const { toast } = useToast();

  function addItem(itemToAdd: Inventory) {
    if (
      selectedEquipment.some(
        (equipment) => equipment.equipmentId == itemToAdd.equipmentId,
      )
    ) {
    } else {
      setSelectedEquipment((oldArray) => [...oldArray, itemToAdd]);
    }
  }
  function removeItem(itemIndex: number) {
    setSelectedEquipment((equipment) =>
      equipment.filter((s, i) => i != itemIndex),
    );
  }
  const closeDialog = (successMessage?: {
    title: string | undefined;
    description: string | undefined;
  }) => {
    setReviewLoanRequestOpen(false);
    if (successMessage != undefined) {
      toast({
        title: successMessage.title,
        description: successMessage.description,
      });
      setSelectedEquipment([]);
      setReturnDate("");
      setApprovingLecturer("");
      setApprovingLecturerEmail("");
      setRemarks("");
    }
  };

  useEffect(() => {
    const lecturer = approvingLecturers.find((lecturer) => {
      return lecturer.grantedUser.email === approvingLecturerEmail;
    });
    if (lecturer != undefined) {
      setApprovingLecturer(lecturer?.grantedUser.name);
    }
  }, [approvingLecturerEmail]);

  return (
    <div className="">
      <div className="w-full rounded-lg bg-white px-5 py-3 shadow-md">
        <h1 className="font-semibold">Loan Details</h1>
        <div className="mt-3 flex">
          <div className="flex w-1/2 flex-col gap-3">
            <div className="flex items-center">
              <div className="w-1/2 max-w-52">
                <Label>Remarks</Label>
              </div>
              <div className="w-1/2 ">
                <Input
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  className="h-7"
                />
              </div>
            </div>
            <div className="flex">
              <div className="w-1/2 max-w-52">
                <Label>Approving Lecturer</Label>
              </div>
              <div className="w-1/2">
                <Select
                  onValueChange={(value) => {
                    setApprovingLecturerEmail(value);
                  }}
                  value={approvingLecturerEmail}
                >
                  <SelectTrigger className="h-7 w-1/4 min-w-44">
                    <SelectValue placeholder="Lecturer Name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Lecturer Name</SelectLabel>

                      {approvingLecturers.map((lecturer) => (
                        <SelectItem
                          key={lecturer.grantedUser.email}
                          value={lecturer.grantedUser.email}
                        >
                          {lecturer.grantedUser.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex w-1/2 justify-end">
            <div className="flex w-3/5">
              <div className="flex h-7 items-center">
                <Label className=" h-fit w-28">Return Date</Label>
              </div>

              <Input
                className="h-7 "
                type="date"
                value={returnDate}
                onChange={(event) => setReturnDate(event.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <EquipmentDataTable
        data={equipmentAndInventory}
        columns={equipmentColumns(addItem)}
        categoriesAndSubCategories={categoriesAndSubCategories}
      />

      {/* 
      Summary is here */}

      <div className="mb-3 w-full rounded-lg bg-white px-5 py-3 shadow-md">
        <h1 className="font-semibold">Summary of Selected Items</h1>
        <div className="my-3 w-full ">
          <div className="rounded-md border">
            <SummaryDataTable
              data={selectedEquipment}
              columns={summaryColumns(removeItem)}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Dialog open={reviewLoanRequestOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setReviewLoanRequestOpen(true);
              }}
              className="h-8 w-28"
            >
              Next
            </Button>
          </DialogTrigger>
          <ReviewLoanRequest
            remarks={remarks}
            approvingLecturer={approvingLecturer}
            approvingLecturerEmail={approvingLecturerEmail}
            returnDate={returnDate}
            equipments={selectedEquipment}
            closeDialog={closeDialog}
          />
        </Dialog>
      </div>
    </div>
  );
};

export default LoanRequestComponent;
