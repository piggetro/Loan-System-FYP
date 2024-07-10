"use client";

import React, { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import {
  Equipment,
  equipmentColumns,
} from "@/app/_components/AddEquipmentColumns";
import { EquipmentDataTable } from "@/app/_components/EquipmentDataTable";

interface AddEquipmentDialogProps {
  equipments: Equipment[];
  setSeletedEquipments: React.Dispatch<React.SetStateAction<Equipment[]>>;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddEquipmentDialog = ({
  equipments,
  setSeletedEquipments,
  isDialogOpen,
  setIsDialogOpen,
}: AddEquipmentDialogProps) => {
  const [selected, setSelected] = useState<Equipment[]>([]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Assign Equipment to Course</DialogTitle>
        </DialogHeader>
        <EquipmentDataTable
          columns={equipmentColumns()}
          data={equipments}
          setSelectedEquipments={setSelected}
        />
        <DialogFooter>
          <Button
            type="button"
            onClick={() => {
              setSeletedEquipments(selected);
              setIsDialogOpen(false);
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEquipmentDialog;
