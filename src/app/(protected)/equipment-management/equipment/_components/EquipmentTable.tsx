import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Equipment, equipmentColumns } from "./EquipmentColumns";
import DeleteEquipment from "./DeleteEquipment";
import { EquipmentDataTable } from "@/app/_components/EquipmentDataTable";

interface EquipmentTableProps {
  equipments: Equipment[];
  setEquipments: React.Dispatch<React.SetStateAction<Equipment[]>>;
}

const EquipmentTable = ({ equipments, setEquipments }: EquipmentTableProps) => {
  const router = useRouter();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );

  const onView = useCallback((equipment: Equipment) => {
    router.push(`/equipment-management/equipment/${equipment.id}`);
  }, []);

  const onDelete = useCallback((equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsDeleteDialogOpen(true);
  }, []);

  const TableColumns = useMemo(
    () => equipmentColumns({ onView, onDelete }),
    [],
  );

  return (
    <>
      <DeleteEquipment
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        equipment={selectedEquipment}
        setEquipments={setEquipments}
      />
      <EquipmentDataTable data={equipments} columns={TableColumns} />
    </>
  );
};

export default EquipmentTable;
