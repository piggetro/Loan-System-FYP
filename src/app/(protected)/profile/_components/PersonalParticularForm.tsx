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
    mobile: string
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
      .string()
      .length(8, { message: "Invalid mobile number" }) // 8 digits
      .regex(new RegExp("[0-9]", "g"), { message: "Invalid mobile number" }) // Only digits
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
      mobileNumber: user?.mobile ?? ""
    },
    mode: "onChange",
  });

  // const handleSave = async () => {
  //   try {
  //     // Perform save action for personal particulars
  //     // Assuming you have an API route for updating user data
  //     const response = await fetch('/api/updateUser', {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         fullName,
  //         userID,
  //         email,
  //         mobileNumber,
  //         course,
  //       }),
  //     });

  //     if (response.ok) {
  //       console.log('Personal particulars updated successfully');
  //     } else {
  //       console.error('Failed to update personal particulars');
  //     }
  //   } catch (error) {
  //     console.error('Error updating personal particulars:', error);
  //   }
  // try {
  //     const result = await updateUserProfile(fullName, mobileNumber , course);

  //     if (result?.title) {
  //       toast({
  //         title: result.title,
  //         description: result.description,
  //         variant: result.variant ? 'destructive' : 'default',
  //       });
  //     } else {
  //       toast({
  //         title: 'Profile updated successfully',
  //         description: 'Your personal particulars have been updated.',
  //         variant: 'default',
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error updating personal particulars:', error);
  //     toast({
  //       title: 'Error updating personal particulars',
  //       description: 'An error occurred while updating your personal particulars.',
  //       variant: 'destructive',
  //     });
  //   }
  // };

  // const handleCancel = () => {
  //   // Reset form fields for personal particulars
  //   setFullName(user.name);
  //   setUserID(user.id);
  //   setEmail(user.email);
  //   setMobileNumber(user.mobile);
  //   //setCourse(user.courseId);
  // };

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
    updateParticulars({
      fullName: values.fullName ?? "",
      userID: values.userID ?? "",
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
                <Input type="text" placeholder="Enter your full name" {...field} disabled/>
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
                <Input type="text" placeholder="Enter your user ID" {...field} disabled/>
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

        {/* Buttons */}
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={!form.formState.isValid || isPending}
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </form>
    </Form>
  );
};

export default PersonalParticularForm;