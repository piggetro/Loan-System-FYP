import React, { useState } from 'react';
import { User } from '@prisma/client';
// import { updateUserProfile } from '@/lib/auth/actions';
import { useToast } from '@/app/_components/ui/use-toast';
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
    name: string,
    id: string,
    email: string,
    mobile: string,
    course: string,
  };
}

const formSchema = z
  .object({
    fullName: z
      .string()
      .min(1, { message: "Full name must be at least 1 character long" })
      .max(255, { message: "Full name must be at most 255 characters long" }),
    userID: z
      .string()
      .min(1, { message: "User ID must be at least 1 character long" })
      .max(255, { message: "User ID must be at most 255 characters long" }),
    email: z
      .string()
      .includes("@", { message: "Invalid email address" })
      .min(1, { message: "Email must be at least 1 character long" })
      .max(255, { message: "Email must be at most 255 characters long" }),
    mobileNumber: z
      .string(),
    course: z
      .string(),
  });

const PersonalParticularForm: React.FC<PersonalParticularFormProps> = ({ user }) => {
  // const [fullName, setFullName] = useState(user?.name);
  // const [userID, setUserID] = useState(user?.id);
  // const [email, setEmail] = useState(user?.email);
  // const [mobileNumber, setMobileNumber] = useState(user?.mobile);
  //const [course, setCourse] = useState(user?.courseId);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.name ?? "",
      userID: user?.id ?? "",
      email: user?.email ?? "",
      mobileNumber: user?.mobile ?? "",
      course: user?.course ?? ""
    },
    mode: "onChange",
  });


  const { mutate: updateParticulars, isPending } =
    api.profile.updateParticulars.useMutation({
      onSuccess: (data) => {
        console.log(data);
        toast({
          title: "Personal Particulars Updated",
          description: "Successfully updated personal particulars",
        });
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while updating your personal particulars.",
          variant: "destructive",
        });
      },
    });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    user.email = values.email;
    user.mobile = values.mobileNumber;

    updateParticulars({
      email: values.email ?? "",
      mobileNumber: values.mobileNumber ?? "",
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-4">
        {/* Full Name Input */}
        <FormField
          name="fullName"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                {/* <Input type="text" placeholder="Enter your full name" {...field} disabled/> */}
                <p>{user.name}</p>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* User ID Input */}
        <FormField
          name="userID"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>User ID</FormLabel>
              <FormControl>
                {/* <Input type="text" placeholder="Enter your user ID" {...field} disabled/> */}
                <p>{user.id}</p>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Email Input */}
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Mobile Number Input */}
        <FormField
          name="mobileNumber"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Enter your mobile number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Course Dropdown */}
        <FormField
          name="course"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course</FormLabel>
              <FormControl>
                {/* <Input type="text" placeholder="Enter your user ID" {...field} disabled/> */}
                <p>{user.course}</p>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buttons */}
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={!form.formState.isValid || isPending}
          className="w-20"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </form>
    </Form>
  );
};

export default PersonalParticularForm;