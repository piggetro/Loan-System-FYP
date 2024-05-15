import React from "react";
import { Course } from "./CourseColumns"
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


interface AddCourseProps {
    setCourse: React.Dispatch<React.SetStateAction<Course[]>>;
}

const formSchema =z.object({
    id: z
        .string()
        .min(1,{message:"ID must be at least 1 character long."})
        .max(255,{ message: "ID must be at most 255 Characters long."}),
    name: z.string().min(1, {message: "Name must be at least 1 character long."})
        .max(255, { message: "Name must be at most 255 characters long"}),
    code: z.string()
        .min(1,{ message: "Code must be atleast 1 character long."})
        .max(255, {message: "Code must be at most 255 Characters long."}),
    active: z.boolean()
});

const AddCourse =({
    setCourse,
}: AddCourseProps)=>{
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: "",
            name:"",
            code:"",
            active:false,
        },
        mode: "onChange",
    });

    const { toast } =useToast();

    const { mutate: addCoruse, isPending} = api.schoolAdmin.addCourse.useMutation({
        onSuccess:(data) => {
            setCourse((prev)=> [...prev,data]);
            toast({
                title:"Success",
                description:"Course added Successfully",
            });
            form.reset();
    },
    onError: (err) =>{
        console.log(err);
        toast({
            title:"Error",
            description:"An error occurred while adding Course",
            variant:"destructive",
        });
    },
});

const onSubmit: SubmitHandler<z.infer<typeof formSchema>>=(
    value:z.infer<typeof formSchema>,
) => {
    addCoruse(value);
};

return (
    <div className="w-full">
        
    </div>
)


}