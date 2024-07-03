import React, { useState } from "react";
import { useToast } from "@/app/_components/ui/use-toast";
import { Button } from "@/app/_components/ui/button";
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from "@/app/_components/ui/form";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/app/_components/ui/input";
import { Loader2 } from "lucide-react";
import { api } from "@/trpc/react";

interface PersonalParticularFormProps {
  user: {
    id: string;
    email: string;
    name: string;
    mobile: string | null;
    course: string | null;
    organizationUnit: string | null;
    staffType: string | null;
  };
}

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  mobile: z
    .string()
    .regex(/^\d{8}$/, { message: "Mobile number must be 8 digits long" }),
});

const PersonalParticularForm: React.FC<PersonalParticularFormProps> = ({
  user,
}) => {
  // const [fullName, setFullName] = useState(user?.name);
  // const [userID, setUserID] = useState(user?.id);
  // const [email, setEmail] = useState(user?.email);
  // const [mobileNumber, setMobileNumber] = useState(user?.mobile);
  //const [course, setCourse] = useState(user?.courseId);
  const { toast } = useToast();

  const [disabled, setDisabled] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email ?? "",
      mobile: user?.mobile ?? "",
    },
    mode: "onChange",
  });

  const { mutate: updateParticulars, isPending } =
    api.profile.updateParticulars.useMutation({
      onSuccess: (data) => {
        toast({
          title: "Personal Particulars Updated",
          description: "Successfully updated personal particulars",
        });

        form.reset({
          email: data.email,
          mobile: data.mobile ?? "",
        });
        setDisabled(true);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description:
            "An error occurred while updating your personal particulars.",
          variant: "destructive",
        });
      },
    });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    updateParticulars({
      email: values.email ?? "",
      mobile: values.mobile ?? "",
    });
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <div className="mb-4 flex space-x-4">
          {/* Left Column */}
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm font-medium leading-none">Full Name</p>
              <p>{user.name}</p>
            </div>

            <div>
              <p className="text-sm font-medium leading-none">User ID</p>
              <p>{user.id}</p>
            </div>

            {!user.course ? (
              <>
                <div>
                  <p className="text-sm font-medium leading-none">Staff Type</p>
                  <p>{user.staffType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">
                    Organization Unit
                  </p>
                  <p>{user.organizationUnit}</p>
                </div>
              </>
            ) : (
              <div>
                <p className="text-sm font-medium leading-none">Course</p>
                <p>{user.course}</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="flex-1 space-y-4">
            {/* EDITABLE INPUT BELOW THIS LINE */}
            {/* Email Input */}
            <FormField
              disabled={disabled}
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Mobile Number Input */}
            <FormField
              disabled={disabled}
              name="mobile"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Mobile" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Form>
      {/* Buttons */}
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
            onClick={form.handleSubmit(onSubmit)}
            disabled={!form.formState.isValid || isPending}
            className="ms-2 mt-2"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        )}
      </div>
    </div>
  );
};

export default PersonalParticularForm;
