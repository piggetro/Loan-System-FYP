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
    .number()
    .min(8, { message: "Mobile number must be at least 8 numbers long" })
    .positive({ message: "Mobile number must be a positive integer" }),
  email: z.string().email({ message: "Invalid email" }),
  name: z
    .string()
    .min(1, { message: "Name must be at least 1 character long" })
    .max(255, { message: "Name must be at most 255 characters long" }),
  organizationUnit: z.string({
    required_error: "Please select an organization unit",
  }),
  staffType: z.string({
    required_error: "Please select a staff type",
  }),
  role: z.string({
    required_error: "Please select a role",
  }),
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
      mobile: undefined,
      name: "",
      organizationUnit: "",
      staffType: "",
      role: "",
    },
    mode: "onChange",
  });

  const { toast } = useToast();

  const {mutate: addStaff} = api.schoolAdmin.addStaff.useMutation({
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
