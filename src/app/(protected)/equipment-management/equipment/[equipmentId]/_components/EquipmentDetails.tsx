"use client";

import React, { useCallback, useMemo, useState } from "react";
import EquipmentInfo, { Equipment } from "./EquipmentInfo";
import {
  EquipmentInventoryItem,
  equipmentInventoryItemColumns,
} from "./EquipmentInventoryColumns";
import { Category } from "../../_components/AddEquipment";
import { Course } from "@/app/(protected)/school-admin/courses/_components/CoursesColumns";
import { Separator } from "@/app/_components/ui/separator";
import AddInventoryItemsDialog from "./AddInventoryItemsDialog";
import EditInventoryItem from "./EditInventoryItem";
import DeleteInventoryItem from "./DeleteInventoryItem";
import { Button } from "@/app/_components/ui/button";
import { EquipmentInventoryItemsDataTable } from "./EquipmentInventoryItemsDataTable";
import Image from "next/image";

interface EquipmentDetailsProps {
  equipment: Equipment;
  inventoryItems: EquipmentInventoryItem[];
  categories: Category[];
  courses: Course[];
}

const EquipmentDetails = ({
  equipment: data,
  inventoryItems: dataInventoryItems,
  categories,
  courses,
}: EquipmentDetailsProps) => {
  const [equipment, setEquipment] = useState<Equipment>(data);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);

  const [equipmentInventoryItems, setEquipmentInventoryItems] =
    useState<EquipmentInventoryItem[]>(dataInventoryItems);

  const [selectedInventoryItem, setSelectedInventoryItem] =
    useState<EquipmentInventoryItem | null>(null);

  const onDelete = useCallback((inventoryItem: EquipmentInventoryItem) => {
    setSelectedInventoryItem(inventoryItem);
    setIsDeleteDialogOpen(true);
  }, []);

  const onEdit = useCallback((inventoryItem: EquipmentInventoryItem) => {
    setSelectedInventoryItem(inventoryItem);
    setIsEditDialogOpen(true);
  }, []);

  const TableColumns = useMemo(
    () => equipmentInventoryItemColumns({ onEdit, onDelete }),
    [],
  );

  return (
    <div className="mt-6 rounded-md bg-white px-6 py-4">
      <EquipmentInfo
        equipment={equipment}
        setEquipment={setEquipment}
        categories={categories}
        courses={courses}
      />
      <Separator className="my-3" />
      <AddInventoryItemsDialog
        setEquipmentInventoryItems={setEquipmentInventoryItems}
        isDialogOpen={isAddDialogOpen}
        setIsDialogOpen={setIsAddDialogOpen}
        equipmentId={equipment.id}
      />
      <EditInventoryItem
        inventoryItem={selectedInventoryItem}
        setEquipmentInventoryItems={setEquipmentInventoryItems}
        isDialogOpen={isEditDialogOpen}
        setIsDialogOpen={setIsEditDialogOpen}
      />
      <DeleteInventoryItem
        inventoryItem={selectedInventoryItem}
        setEquipmentInventoryItems={setEquipmentInventoryItems}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
      />
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">Inventory Items</h3>
          <div className="ms-10 space-x-4">
            <span className="text-sm font-medium">
              Total Count: {equipmentInventoryItems.length}
            </span>
            <span className="text-sm font-medium">
              Available Count:{" "}
              {
                equipmentInventoryItems.filter(
                  (item) => item.status === "AVAILABLE",
                ).length
              }
            </span>
            <span className="text-sm font-medium">
              Unavailable Count:{" "}
              {
                equipmentInventoryItems.filter(
                  (item) => item.status != "AVAILABLE",
                ).length
              }
            </span>
          </div>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Add Equipment to Inventory
        </Button>
      </div>
      <EquipmentInventoryItemsDataTable
        data={equipmentInventoryItems}
        columns={TableColumns}
      />
    </div>
  );
};

export default EquipmentDetails;
