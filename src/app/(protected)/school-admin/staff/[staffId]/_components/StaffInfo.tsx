import React, { useState } from "react";
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from "@/app/_components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Button } from "@/app/_components/ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/app/_components/ui/input";
import { Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { useToast } from "@/app/_components/ui/use-toast";
import { AccessRights } from "./AccessRightColumns";

interface StaffInfoProps {
  staff: Staff;
  setStaff: React.Dispatch<React.SetStateAction<Staff>>;
  setAccessRights: React.Dispatch<React.SetStateAction<AccessRights[]>>;
  organizationUnits: OrganizationUnit[];
  staffTypes: StaffType[];
  roles: Role[];
}

export type Staff = {
  id: string;
  mobile: string;
  email: string;
  name: string;
  organizationUnit: string;
  staffType: string;
  role: string;
};

export type OrganizationUnit = {
  id: string;
  name: string;
};

export type StaffType = {
  id: string;
  name: string;
};

export type Role = {
  id: string;
  role: string;
};

const formSchema = z.object({
  id: z
    .string()
    .min(1, { message: "Id must be at least 1 character long" })
    .max(255, { message: "Id must be at most 255 characters long" }),
  mobile: z
    .string()
    .regex(/^\d{8}$/, { message: "Mobile number must be 8 digits long" })
    .optional()
    .or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
  email: z.string().email({ message: "Invalid email" }),
  name: z
    .string()
    .min(1, { message: "Name must be at least 1 character long" })
    .max(255, { message: "Name must be at most 255 characters long" }),
  organizationUnit: z
    .string({
      required_error: "Please select an organization unit",
    })
    .min(1),
  staffType: z
    .string({
      required_error: "Please select a staff type",
    })
    .min(1),
  role: z
    .string({
      required_error: "Please select a role",
    })
    .min(1),
});

const StaffInfo = ({
  staff,
  setStaff,
  setAccessRights,
  organizationUnits,
  roles,
  staffTypes,
}: StaffInfoProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: staff.id,
      email: staff.email,
      name: staff.name,
      organizationUnit: staff.organizationUnit,
      staffType: staff.staffType,
      role: staff.role,
      mobile: staff.mobile,
      password: "",
    },
    mode: "onChange",
  });
  const { toast } = useToast();

  const [disabled, setDisabled] = useState(true);

  const { mutate: updateStaff, isPending } =
    api.schoolAdmin.updateStaff.useMutation({
      onSuccess: (data) => {
        setStaff({
          id: data.id,
          email: data.email,
          name: data.name,
          organizationUnit: data.organizationUnit,
          staffType: data.staffType,
          role: data.role,
          mobile: data.mobile,
        });
        setAccessRights(data.accessRights);
        setDisabled(true);
        toast({
          title: "Success",
          description: "Staff updated successfully",
        });
        form.reset({
          ...data,
          password: "",
        });
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while updating staff",
          variant: "destructive",
        });
      },
    });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    updateStaff({
      ...values,
      id: staff.id,
      newId: values.id,
    });
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <div className="mb-4 flex space-x-4">
          {/* Left Column */}
          <div className="flex-1 space-y-4">
            <FormField
              disabled={disabled}
              name="id"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Staff ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={disabled}
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={disabled}
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@ichat.edu.sg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={disabled}
              name="mobile"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={disabled}
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Update Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Right Column */}
          <div className="flex-1 space-y-4">
            <FormField
              control={form.control}
              name="organizationUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Unit</FormLabel>
                  <Select
                    disabled={disabled}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue(field.name, value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an Organization Unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizationUnits.map((organizationUnit) => (
                        <SelectItem
                          key={organizationUnit.id}
                          value={organizationUnit.id}
                        >
                          {organizationUnit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="staffType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff Type</FormLabel>
                  <Select
                    disabled={disabled}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue(field.name, value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Staff Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {staffTypes.map((staffType) => (
                        <SelectItem key={staffType.id} value={staffType.id}>
                          {staffType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue(field.name, value);
                    }}
                    value={field.value}
                    disabled={disabled}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Form>
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => {
            !disabled && form.reset();
            setDisabled(!disabled);
          }}
          className="mt-2"
        >
          {disabled ? "Edit" : "Cancel"}
        </Button>
        {!disabled && (
          <Button
            type="button"
            disabled={!form.formState.isValid || isPending}
            onClick={form.handleSubmit(onSubmit)}
            className="ms-2 mt-2"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        )}
      </div>
    </div>
  );
};

export default StaffInfo;
