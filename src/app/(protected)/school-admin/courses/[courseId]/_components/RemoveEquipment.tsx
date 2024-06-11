import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/app/_components/ui/alert-dialog";
import { useToast } from "@/app/_components/ui/use-toast";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { Equipment } from "@/app/_components/AddEquipmentColumns";

interface RemoveEquipmentProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  equipment: Equipment | null;
  setEquipments: React.Dispatch<React.SetStateAction<Equipment[]>>;
  courseId: string;
}

const RemoveEquipment = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  equipment,
  setEquipments,
  courseId,
}: RemoveEquipmentProps) => {
  const { toast } = useToast();

  const { mutate: removeEquipmentFromCourse, isPending } =
    api.courses.removeEquipmentFromCourse.useMutation({
      onSuccess: () => {
        setEquipments((prev) =>
          prev.filter((item) => item.id !== equipment?.id),
        );
        toast({
          title: "Equipment unassigned",
          description: "The equipment has been unsassigned successfully",
        });
        setIsDeleteDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while unassigning the equipment",
          variant: "destructive",
        });
      },
    });

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the data
            and remove the data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setIsDeleteDialogOpen(false);
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => {
              if (equipment?.id) {
                removeEquipmentFromCourse({
                  equipmentId: equipment.id,
                  id: courseId,
                });
              }
            }}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveEquipment;
