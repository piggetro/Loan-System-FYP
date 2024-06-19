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
import { EquipmentInventoryItem } from "./EquipmentInventoryColumns";

interface DeleteInventoryItemProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  inventoryItem: EquipmentInventoryItem | null;
  setEquipmentInventoryItems: React.Dispatch<
    React.SetStateAction<EquipmentInventoryItem[]>
  >;
}

const DeleteInventoryItem = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  inventoryItem,
  setEquipmentInventoryItems,
}: DeleteInventoryItemProps) => {
  const { toast } = useToast();

  const { mutate: deleteEquipmentInventoryItem, isPending } =
    api.equipment.deleteEquipmentInventoryItem.useMutation({
      onSuccess: () => {
        setEquipmentInventoryItems((prev) =>
          prev.filter((item) => item.id !== inventoryItem?.id),
        );
        toast({
          title: "Inventory Item Deleted",
          description: "The inventory item has been deleted successfully",
        });
        setIsDeleteDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while deleting the inventory item",
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
              if (inventoryItem?.id) {
                deleteEquipmentInventoryItem({
                  id: inventoryItem.id,
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

export default DeleteInventoryItem;
