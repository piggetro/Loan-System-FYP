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
import { AccessRights } from "./AccessRightColumns";
import { AccessRightDataTable } from "@/app/_components/AddAccessRightDataTable";
import { accessRightColumns } from "@/app/_components/AddAccessRightColumns";

interface AddAccessRightProps {
  setAccessRights: React.Dispatch<React.SetStateAction<AccessRights[]>>;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  staffId: string;
}

const AddAccessRight = ({
  setAccessRights,
  isDialogOpen,
  setIsDialogOpen,
  staffId,
}: AddAccessRightProps) => {
  const { toast } = useToast();

  const [selectedAccessRights, setSelectedAccessRights] = useState<
    AccessRights[]
  >([]);

  const {
    data,
    refetch,
    isFetching: isloadingData,
  } = api.schoolAdmin.getStaffAvailableAccessRights.useQuery(
    {
      id: staffId,
    },
    { enabled: false },
  );

  const { mutate: addAccessRights, isPending } =
    api.schoolAdmin.addAcccessRightToStaff.useMutation({
      onSuccess: (data) => {
        setAccessRights(data);
        toast({
          title: "Success",
          description: "Access Rights added to staff successfully",
        });
        setIsDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while adding access right to staff",
          variant: "destructive",
        });
      },
    });

  useEffect(() => {
    isDialogOpen && refetch();
  }, [isDialogOpen]);

  const onSubmit = () => {
    addAccessRights({
      id: staffId,
      accessRights: selectedAccessRights.map((accessRight) => accessRight.id),
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Access Right to Staff</DialogTitle>
        </DialogHeader>
        {isloadingData == true ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <AccessRightDataTable
            columns={accessRightColumns()}
            data={data || []}
            setSelectedAccessRights={setSelectedAccessRights}
          />
        )}
        <DialogFooter>
          <Button
            type="button"
            disabled={isloadingData || selectedAccessRights.length === 0}
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

export default AddAccessRight;
