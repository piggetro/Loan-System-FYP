"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/app/_components/ui/use-toast";
import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import {
  Equipment,
  equipmentColumns,
} from "@/app/_components/AddEquipmentColumns";
import { EquipmentDataTable } from "@/app/_components/EquipmentDataTable";

interface AddEquipmentProps {
  setEquipments: React.Dispatch<React.SetStateAction<Equipment[]>>;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  courseId: string;
}

const AddEquipment = ({
  setEquipments,
  isDialogOpen,
  setIsDialogOpen,
  courseId,
}: AddEquipmentProps) => {
  const { toast } = useToast();

  const [selectedEquipments, setSelectedEquipments] = useState<Equipment[]>([]);

  const {
    data,
    refetch,
    isFetching: isloadingData,
  } = api.courses.getAvailableEquipmentForCourse.useQuery(
    {
      id: courseId,
    },
    { enabled: false },
  );

  const { mutate: addEquipment, isPending } =
    api.courses.addEquipmentToCourse.useMutation({
      onSuccess: (data) => {
        setEquipments(data);
        toast({
          title: "Success",
          description: "Equipment assigned to course successfully",
        });
        setIsDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while assigning equipment to course",
          variant: "destructive",
        });
      },
    });

  useEffect(() => {
    async function fetchData() {
      if (isDialogOpen) {
        try {
          await refetch();
        } catch (error) {
          console.error("Failed to refetch data:", error);
        }
      }
    }
    void fetchData();
  }, [isDialogOpen]);

  const onSubmit = () => {
    addEquipment({
      id: courseId,
      equipmentIds: selectedEquipments.map((equipment) => equipment.id),
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Assign Equipment to Course</DialogTitle>
        </DialogHeader>
        {isloadingData == true ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <EquipmentDataTable
            data={data ?? []}
            columns={equipmentColumns()}
            setSelectedEquipments={setSelectedEquipments}
          />
        )}
        <DialogFooter>
          <Button
            type="button"
            disabled={isloadingData || selectedEquipments.length === 0}
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

export default AddEquipment;
