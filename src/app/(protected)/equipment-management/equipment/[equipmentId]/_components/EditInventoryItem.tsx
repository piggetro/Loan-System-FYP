import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { z } from "zod";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
  FormField,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import { Calendar } from "@/app/_components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/app/_components/ui/button";
import { toast } from "@/app/_components/ui/use-toast";
import { EquipmentInventoryItem } from "./EquipmentInventoryColumns";
import { api } from "@/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

interface EditInventoryItemProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  inventoryItem: EquipmentInventoryItem | null;
  setEquipmentInventoryItems: React.Dispatch<
    React.SetStateAction<EquipmentInventoryItem[]>
  >;
}

const assetSchema = z.object({
  assetNumber: z.string().min(1, { message: "Asset Number is required" }),
  cost: z.string().regex(/^\d+(\.\d{2})?$/, {
    message: "Cost must be a valid number with exactly two decimal places",
  }),
  status: z.string().min(1, { message: "Status is required" }),
  datePurchased: z.date({
    required_error: "Please select a date",
  }),
  warrantyExpiry: z.date({
    required_error: "Please select a date",
  }),
});

const EditInventoryItem = ({
  inventoryItem,
  isDialogOpen,
  setIsDialogOpen,
  setEquipmentInventoryItems,
}: EditInventoryItemProps) => {
  const form = useForm<z.infer<typeof assetSchema>>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      assetNumber: inventoryItem?.assetNumber ?? "",
      cost: inventoryItem?.cost ?? "",
      status: inventoryItem?.status ?? "",
      datePurchased: inventoryItem?.datePurchased ?? new Date(),
      warrantyExpiry: inventoryItem?.warrantyExpiry ?? new Date(),
    },
    mode: "onChange",
  });

  const { mutate: updateAccessRight, isPending } =
    api.equipment.updateInventoryItem.useMutation({
      onSuccess: (data) => {
        if (inventoryItem) {
          setEquipmentInventoryItems((prev) =>
            prev.map((item) =>
              item.id === inventoryItem.id ? { ...item, ...data } : item,
            ),
          );
          toast({
            title: "Inventory Item Updated",
            description: "The inventory item has been updated successfully",
          });
        }
        setIsDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while updating the inventory item",
          variant: "destructive",
        });
      },
    });

  useEffect(() => {
    if (inventoryItem) {
      form.reset({
        assetNumber: inventoryItem?.assetNumber ?? "",
        cost: inventoryItem?.cost ?? "",
        status: inventoryItem?.status ?? "",
        datePurchased: inventoryItem?.datePurchased ?? new Date(),
        warrantyExpiry: inventoryItem?.warrantyExpiry ?? new Date(),
      });
    } else {
      form.reset();
    }
  }, [isDialogOpen, inventoryItem]);

  const onSubmit: SubmitHandler<z.infer<typeof assetSchema>> = (
    values: z.infer<typeof assetSchema>,
  ) => {
    updateAccessRight({
      id: inventoryItem?.id ?? "",
      assetNumber: values.assetNumber,
      cost: parseFloat(values.cost),
      status: values.status,
      datePurchased: values.datePurchased,
      warrantyExpiry: values.warrantyExpiry,
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4">
            <div className="flex-1">
              <FormField
                name="assetNumber"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Asset Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                name="cost"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue(field.name, value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select one" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem key="AVAILABLE" value="AVAILABLE">
                          Available
                        </SelectItem>
                        <SelectItem key="LOANED" value="LOANED">
                          Loaned
                        </SelectItem>
                        <SelectItem key="LOST" value="LOST">
                          Lost
                        </SelectItem>
                        <SelectItem key="BROKEN" value="BROKEN">
                          Broken
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="datePurchased"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Purchased</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
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
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="warrantyExpiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warranty Expirary</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
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
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button
            type="button"
            disabled={!form.formState.isValid || isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditInventoryItem;
