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
import { OrganizationUnits } from "./OrganizationUnitColumns";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";

// In DeleteOrganizationUnit.tsx
interface DeleteOrganizationUnitProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  organizationUnit: OrganizationUnits | null;
  setOrganizationUnits: React.Dispatch<React.SetStateAction<OrganizationUnits[]>>;
}

const DeleteOrganizationUnit = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  organizationUnit,
  setOrganizationUnits,
}: DeleteOrganizationUnitProps) => {
  const { toast } = useToast();

  const { mutate: deleteOrganizationUnit, isPending } =
    api.schoolAdmin.deleteOrganizationUnit.useMutation({
      onSuccess: () => {
        setOrganizationUnits((prev) =>
          prev.filter((item) => item.id !== organizationUnit?.id),
        );
        toast({
          title: "Organization Unit Deleted",
          description: "The organization unit has been deleted successfully",
        });
        setIsDeleteDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while deleting the organization unit",
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
            This action cannot be undone. This will permanently delete the
            data and remove the data from our servers.
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
              deleteOrganizationUnit({ id: organizationUnit?.id! });
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

export default DeleteOrganizationUnit;
