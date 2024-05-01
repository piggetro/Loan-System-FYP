import React from "react";
import { Staff } from "./StaffColumns";
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

interface AddStaffProps {
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  organizationUnits: OrganizationUnit[];
  staffTypes: StaffType[];
  roles: Role[];
}

const formSchema = z.object({
  id: z
    .string()
    .min(1, { message: "Id must be at least 1 character long" })
    .max(255, { message: "Id must be at most 255 characters long" }),
  mobile: z
    .string()
    .min(8, { message: "Mobile number must be at least 8 digits long" })
    .max(8, { message: "Mobile number must be no more than 8 digits long" })
    .regex(/^\d+$/, { message: "Mobile number must be numeric" }),
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

const AddStaff = ({
  setStaff,
  organizationUnits,
  staffTypes,
  roles,
}: AddStaffProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      email: "",
      mobile: "",
      name: "",
      organizationUnit: "",
      staffType: "",
      role: "",
    },
    mode: "onChange",
  });

  const { toast } = useToast();

  const { mutate: addStaff, isPending } = api.schoolAdmin.addStaff.useMutation({
    onSuccess: (data) => {
      setStaff((prev) => [...prev, data]);
      toast({
        title: "Success",
        description: "Staff added successfully",
      });
      form.reset();
    },
    onError: (err) => {
      console.log(err);
      toast({
        title: "Error",
        description: "An error occurred while adding staff",
        variant: "destructive",
      });
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    addStaff({ ...values, mobile: parseInt(values.mobile) });
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form className="mb-4 space-y-4">
          <FormField
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
            name="mobile"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="Mobile Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
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
            control={form.control}
            name="staffType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Staff Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Staff Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {staffTypes.map((staffType) => (
                      <SelectItem value={staffType.id}>
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
            name="organizationUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Unit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an Organization Unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {organizationUnits.map((organizationUnit) => (
                      <SelectItem value={organizationUnit.id}>
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
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem value={role.id}>{role.role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <div className="flex justify-end">
        <Button
          type="button"
          disabled={!form.formState.isValid || isPending}
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

export default AddStaff;
