"use client";

import React, { useState } from "react";
import { useToast } from "@/app/_components/ui/use-toast";
import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { api } from "@/trpc/react";
import { EquipmentInventoryItem } from "./EquipmentInventoryColumns";
import InventoryItemsForm, {
  InventoryItem,
} from "@/app/_components/InventoryItemsForm";
import { Loader2 } from "lucide-react";

interface AddInventoryItemsDialogProps {
  setEquipmentInventoryItems: React.Dispatch<
    React.SetStateAction<EquipmentInventoryItem[]>
  >;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  equipmentId: string;
}

const AddInventoryItemsDialog = ({
  setEquipmentInventoryItems,
  isDialogOpen,
  setIsDialogOpen,
  equipmentId,
}: AddInventoryItemsDialogProps) => {
  const { toast } = useToast();

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [valid, setValid] = useState<boolean>(false);

  const { mutate: addInventoryItem, isPending } =
    api.equipment.addInventoryItem.useMutation({
      onSuccess: (data) => {
        setEquipmentInventoryItems(data);
        toast({
          title: "Success",
          description: "Equipment added to inventory successfully",
        });
        setIsDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while adding equipment to inventory",
          variant: "destructive",
        });
      },
    });

  const onSubmit = () => {
    addInventoryItem({
      id: equipmentId,
      inventoryItems: inventoryItems.map((item) => ({
        ...item,
        cost: parseFloat(item.cost),
      })),
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle> Add Equipment to Inventory</DialogTitle>
        </DialogHeader>
        <div>
          <InventoryItemsForm
            setInventoryItems={setInventoryItems}
            setValid={setValid}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={!valid || inventoryItems.length === 0 || isPending}
            onClick={onSubmit}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddInventoryItemsDialog;
