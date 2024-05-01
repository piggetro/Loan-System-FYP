import React from "react";
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
import { useToast } from "@/app/_components/ui/use-toast";

interface StaffInfoProps {}

export type Staff = {
  id: string;
  mobile: number;
  email: string;
  name: string;
  organizationUnit: string;
  staffType: string;
  role: string;
};

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

const StaffInfo = ({}: StaffInfoProps) => {
  return <div>StaffInfo</div>;
};

export default StaffInfo;
