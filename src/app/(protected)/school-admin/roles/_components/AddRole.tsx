"use client";

import React, { useState } from "react";
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from "@/app/_components/ui/form";
import { Button } from "@/app/_components/ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/app/_components/ui/input";
import { Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { Roles } from "./RolesColumns";
import { useToast } from "@/app/_components/ui/use-toast";
import { AccessRights, accessRightColumns } from "../../../../_components/AddAccessRightColumns";
import { AccessRightDataTable } from "../../../../_components/AddAccessRightDataTable";

interface AddRoleProps {
  setRoles: React.Dispatch<React.SetStateAction<Roles[]>>;
  accessRights: AccessRights[];
}

const formSchema = z.object({
  role: z
    .string()
    .min(1, { message: "Role Name must be at least 1 character long" })
    .max(255, { message: "Role Name must be at most 255 characters long" }),
});

const AddRole = ({ setRoles, accessRights }: AddRoleProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "",
    },
    mode: "onChange",
  });

  const { toast } = useToast();
  const [selectedAccessRights, setSelectedAccessRights] = useState<
    AccessRights[]
  >([]);

  const { mutate: addRole, isPending } = api.schoolAdmin.addRole.useMutation({
    onSuccess: (data) => {
      setRoles((prev) => [...prev, data]);
      toast({
        title: "Success",
        description: "Role added successfully",
      });
      form.reset();
      //unselect table

    },
    onError: (err) => {
      console.log(err);
      toast({
        title: "Error",
        description: "An error occurred while adding role",
        variant: "destructive",
      });
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    addRole({
      role: values.role,
      accessRights: selectedAccessRights.map((accessRight) => accessRight.id),
    });
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form className="mb-4 space-y-4">
          <FormField
            name="role"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role Name</FormLabel>
                <FormControl>
                  <Input placeholder="Role Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <p className="mb-4 text-sm font-medium leading-none">
        Grant Access Rights
      </p>
      <AccessRightDataTable
        columns={accessRightColumns()}
        data={accessRights}
        setSelectedAccessRights={setSelectedAccessRights}
      />
      <div className="flex justify-end">
        <Button
          type="button"
          disabled={
            !form.formState.isValid || isPending || !selectedAccessRights.length
          }
          onClick={form.handleSubmit(onSubmit)}
          className="mt-2"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default AddRole;
