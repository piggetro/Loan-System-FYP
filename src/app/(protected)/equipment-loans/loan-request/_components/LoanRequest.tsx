/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";

import React, { useEffect, useState } from "react";
import { EquipmentDataTable, SummaryDataTable } from "./DataTable";
import { equipmentColumns, summaryColumns } from "./Columns";
import { Dialog, DialogTrigger } from "@/app/_components/ui/dialog";
import ReviewLoanRequest from "./ReviewLoanRequest";
import { z } from "zod";
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
import { CalendarIcon, ChevronsUpDown, Search } from "lucide-react";
import { Calendar } from "@/app/_components/ui/calendar";
import { type Inventory } from "../page";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Textarea } from "@/app/_components/ui/textarea";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { type Category, type SubCategory } from "@/db/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/_components/ui/command";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { table } from "console";

const formSchema = z.object({
  remarks: z.string().min(1, "Required").max(150),
  returnDate: z.date({}),
  approver: z.string().min(1),
});
type ApproverType = {
  name: string;
  email: string;
};
const LoanRequestComponent: React.FC<{
  categoriesAndSubCategories: {
    categories: Category[];
    subCategories: SubCategory[];
  };
  approvers: ApproverType[];
}> = ({ categoriesAndSubCategories, approvers }) => {
  const [selectedEquipment, setSelectedEquipment] = useState<Inventory[]>([]);
  const [approver, setApprover] = useState<string>("");
  const [approverEmail, setApproverEmail] = useState<string>("");
  const [openApproverDropdown, setOpenApproverDropdown] =
    useState<boolean>(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("All");
  const [selectedSubCategoryId, setSelectedSubCategoryId] =
    useState<string>("All");
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncerIsLoading, setDebouncerIsLoading] = useState<boolean>(false);
  const [reviewLoanRequestOpen, setReviewLoanRequestOpen] =
    useState<boolean>(false);
  const [remarks, setRemarks] = useState<string>("");
  const [returnDate, setReturnDate] = useState<Date>();
  const { toast } = useToast();
  const router = useRouter();
  const { data: equipmentAndInventory, mutateAsync: fetchSearch } =
    api.loanRequest.getEquipmentAndInventory.useMutation();
  const { data: disabledCalendarDates } = api.loan.getHolidays.useQuery();
  function addItem(itemToAdd: Inventory) {
    if (
      selectedEquipment.some(
        (equipment) => equipment.equipmentId == itemToAdd.equipmentId,
      )
    ) {
      const indexOfItem = selectedEquipment.findIndex(
        (item) => item.equipmentId === itemToAdd.equipmentId,
      );
      if (
        itemToAdd.quantitySelected +
          selectedEquipment[indexOfItem]!.quantitySelected >
        itemToAdd.quantityAvailable
      ) {
        toast({
          title: "Maximum Quantity Reached",
          description: `Total Quantity Available: ${itemToAdd.quantityAvailable}`,
          variant: "destructive",
        });
      } else {
        const updatedItems = [...selectedEquipment];
        updatedItems[indexOfItem] = {
          quantitySelected:
            updatedItems[indexOfItem]!.quantitySelected +
            itemToAdd.quantitySelected,
          itemDescription: updatedItems[indexOfItem]!.itemDescription,
          equipmentId: updatedItems[indexOfItem]!.equipmentId,
          category: updatedItems[indexOfItem]!.category,
          subCategory: updatedItems[indexOfItem]!.subCategory,
          quantityAvailable: updatedItems[indexOfItem]!.quantityAvailable,
        };
        setSelectedEquipment(updatedItems);
      }
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
  }

  useEffect(() => {
    setSelectedSubCategoryId("All");
  }, [selectedCategoryId]);
  const closeDialog = (successMessage: {
    title: string;
    description: string;
    variant: "default" | "destructive" | "close";
  }) => {
    if (successMessage.variant === "default") {
      setReviewLoanRequestOpen(false);
      toast({
        title: successMessage.title,
        description: successMessage.description,
      });
      setSelectedEquipment([]);
      setReturnDate(undefined);
      setRemarks("");
      form.reset({
        remarks: "",
        approver: "",
      });
      router.push("/equipment-loans/loans");
    } else if (successMessage.variant === "destructive") {
      toast({
        title: successMessage.title,
        description: successMessage.description,
      });
    }
  };

  //Using email to assign approving lecturer name
  useEffect(() => {
    const approver = approvers.find((approver) => {
      return approver.email === approverEmail;
    });
    if (approver != undefined) {
      setApprover(approver.name);
    }
  }, [approverEmail]);

  function executeSearch() {
    setDebouncerIsLoading(true);
    if (searchInput !== "") {
      fetchSearch({
        searchInput: searchInput,
        categoryId: selectedCategoryId,
        subCategoryId: selectedSubCategoryId,
      })
        .then(() => {
          setDebouncerIsLoading(false);
        })
        .catch((e) => console.log(e));
    }
  }

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
        <form
          onKeyDown={(event) => {
            if (event.keyCode == 13) {
              event.preventDefault();
              return false;
            }
          }}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
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
                            <Textarea placeholder="Remarks" {...field} />
                          </FormControl>

                          <FormMessage className="h-7" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex">
                  <div className="flex w-1/2  max-w-52 items-center">
                    <Label>Approver</Label>
                  </div>
                  <div className="w-1/2">
                    <FormField
                      control={form.control}
                      name="approver"
                      render={({ field }) => (
                        <Popover
                          open={openApproverDropdown}
                          onOpenChange={setOpenApproverDropdown}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openApproverDropdown}
                              className="w-[250px] justify-between"
                            >
                              {field.value
                                ? approvers.find(
                                    (approver) =>
                                      approver.email === approverEmail,
                                  )?.name
                                : "Select Approver"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[250px] p-0">
                            <Command>
                              <CommandInput placeholder="Search Lecturer" />
                              <CommandList>
                                <CommandEmpty>No Approver</CommandEmpty>
                                <CommandGroup>
                                  {approvers.map((approver) => {
                                    return (
                                      <CommandItem
                                        key={approver.email}
                                        value={approver.email}
                                        onSelect={(currentValue) => {
                                          setApproverEmail(currentValue);
                                          field.onChange(currentValue);
                                          setOpenApproverDropdown(false);
                                        }}
                                      >
                                        {approver.name}
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                          <FormMessage className="h-7" />
                        </Popover>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="flex w-1/2 justify-end">
                <div className="flex h-min w-3/5">
                  <div className="flex items-center">
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
                                  " w-[240px] pl-3 text-left font-normal",
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
                              captionLayout="dropdown-buttons"
                              fromYear={new Date().getFullYear()}
                              toYear={new Date().getFullYear() + 1}
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date <
                                  new Date(
                                    new Date().setDate(
                                      new Date().getDate() + 7,
                                    ),
                                  ) ||
                                date >
                                  new Date(
                                    new Date().setDate(
                                      new Date().getDate() + 365,
                                    ),
                                  ) ||
                                disabledCalendarDates!.some(
                                  (disabledDate) =>
                                    date.getFullYear() ===
                                      disabledDate.startDate.getFullYear() &&
                                    date.getMonth() ===
                                      disabledDate.startDate.getMonth() &&
                                    date.getDate() ===
                                      disabledDate.startDate.getDate(),
                                )
                              }
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
          <div className="my-3 w-full rounded-lg bg-white px-5 py-2 shadow-md">
            <h1 className="font-semibold">Search For Item</h1>
            <div className="my-2 flex gap-3">
              <Input
                placeholder="Search"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    if (searchInput !== "") executeSearch();
                  }
                }}
              />
              <Select
                onValueChange={(key) => {
                  setSelectedCategoryId(key);
                }}
              >
                <SelectTrigger className="w-1/4  min-w-44">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Category</SelectLabel>
                    <SelectItem key={"All"} value={"All"}>
                      All
                    </SelectItem>
                    {categoriesAndSubCategories.categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                onValueChange={(key) => {
                  setSelectedSubCategoryId(key);
                }}
                value={selectedSubCategoryId}
              >
                <SelectTrigger className="w-1/4 min-w-44">
                  <SelectValue placeholder="Sub-Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sub Category</SelectLabel>
                    <SelectItem key={"All"} value={"All"}>
                      All
                    </SelectItem>
                    {categoriesAndSubCategories.subCategories.map(
                      (subCategory) =>
                        selectedCategoryId == subCategory.categoryId ? (
                          <SelectItem
                            key={subCategory.id}
                            value={subCategory.id}
                          >
                            {subCategory.name}
                          </SelectItem>
                        ) : null,
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={() => {
                  if (searchInput !== "") executeSearch();
                }}
              >
                <Search />
              </Button>
            </div>
            {debouncerIsLoading ? (
              <div>
                <div className="my-3 w-full">
                  <Skeleton className="mb-3 h-7" />
                  <Skeleton className="h-44" />
                </div>
              </div>
            ) : equipmentAndInventory !== undefined ? (
              <EquipmentDataTable
                data={equipmentAndInventory}
                columns={equipmentColumns(addItem)}
              />
            ) : (
              <div>
                <div className="my-3 flex h-[100px] w-full items-center justify-center">
                  <div>No Results Found</div>
                </div>
              </div>
            )}
          </div>
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
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="submit"
                  className=" w-28"
                  disabled={selectedEquipment.length === 0}
                >
                  Next
                </Button>
              </DialogTrigger>
              {reviewLoanRequestOpen && returnDate && (
                <ReviewLoanRequest
                  remarks={remarks}
                  approver={approver}
                  approverEmail={approverEmail}
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
