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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/app/_components/ui/form";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/app/_components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const formSchema = z.object({
  remarks: z.string().min(1, "Required").max(50),
  returnDate: z.date({}),
  approvingLecturer: z.string().min(1),
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
  const [returnDate, setReturnDate] = useState<Date>();
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

  function adjustQuantity(equipmentData: Inventory) {
    const index = selectedEquipment.findIndex(
      (equipment) => equipment.equipmentId === equipmentData.equipmentId,
    );

    selectedEquipment.splice(index, 1, equipmentData);
    console.log(selectedEquipment);
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
      setReturnDate(undefined);
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setRemarks(values.remarks);
    setReturnDate(values.returnDate);
    setReviewLoanRequestOpen(true);
  }

  return (
    <div className="">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="w-full rounded-lg bg-white px-5 py-3 shadow-md">
            <h1 className="font-semibold">Loan Details</h1>
            <div className="mt-3 flex">
              <div className="flex w-1/2 flex-col gap-3">
                <div className="flex items-center">
                  <div className="w-1/2 max-w-52">
                    <Label>Remarks</Label>
                  </div>
                  <div className="w-1/2 ">
                    <FormField
                      control={form.control}
                      name="remarks"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3">
                          <FormControl>
                            <Input
                              placeholder="Remarks"
                              {...field}
                              className="h-7"
                            />
                          </FormControl>

                          <FormMessage className="h-7" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/2 max-w-52">
                    <Label>Approving Lecturer</Label>
                  </div>
                  <div className="w-1/2">
                    <FormField
                      control={form.control}
                      name="approvingLecturer"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3">
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setApprovingLecturerEmail(value);
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-7 w-1/4 min-w-44">
                                <SelectValue placeholder="Lecturer Name" />
                              </SelectTrigger>
                            </FormControl>
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
                          <FormMessage className="h-7" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="flex w-1/2 justify-end">
                <div className="flex w-3/5">
                  <div className="flex h-7 items-center">
                    <Label className=" h-fit w-28">Return Date</Label>
                  </div>
                  <FormField
                    control={form.control}
                    name="returnDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "h-7 w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="" />
                      </FormItem>
                    )}
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

          <div className="mb-3 w-full rounded-lg bg-white px-5 py-3 shadow-md">
            <h1 className="font-semibold">Summary of Selected Items</h1>
            <div className="my-3 w-full ">
              <div className="rounded-md border">
                <SummaryDataTable
                  data={selectedEquipment}
                  columns={summaryColumns(removeItem, adjustQuantity)}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Dialog open={reviewLoanRequestOpen}>
              <DialogTrigger asChild>
                <Button
                  type="submit"
                  className="h-8 w-28"
                  disabled={selectedEquipment.length === 0}
                >
                  Next
                </Button>
              </DialogTrigger>
              {returnDate && (
                <ReviewLoanRequest
                  remarks={remarks}
                  approvingLecturer={approvingLecturer}
                  approvingLecturerEmail={approvingLecturerEmail}
                  returnDate={returnDate}
                  equipments={selectedEquipment}
                  closeDialog={closeDialog}
                />
              )}
            </Dialog>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LoanRequestComponent;
