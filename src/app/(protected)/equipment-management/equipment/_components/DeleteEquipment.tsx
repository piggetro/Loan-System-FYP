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
import { Equipment } from "./EquipmentColumns";

interface DeleteEquipmentProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  equipment: Equipment | null;
  setEquipments: React.Dispatch<React.SetStateAction<Equipment[]>>;
}

const DeleteEquipment = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  equipment,
  setEquipments,
}: DeleteEquipmentProps) => {
  const { toast } = useToast();

  const { mutate: deleteEquipment, isPending } =
    api.equipment.deleteEquipment.useMutation({
      onSuccess: () => {
        setEquipments((prev) =>
          prev.filter((item) => item.id !== equipment?.id),
        );
        toast({
          title: "Equipment Deleted",
          description: "The equipment has been deleted successfully",
        });
        setIsDeleteDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while deleting the equipment",
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
            disabled={isPending || equipment?.id === undefined} // Disable if pending or id is undefined
            onClick={() => {
              if (equipment?.id !== undefined) {
                // Check for undefined before calling deleteCourse
                deleteEquipment({ id: equipment.id });
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

export default DeleteEquipment;
