import React, { useState } from "react";
import { useToast } from "@/app/_components/ui/use-toast";
import { createPasswordResetToken } from "@/lib/auth/actions";
import { Button } from "@/app/_components/ui/button";
import { Loader2 } from "lucide-react";
interface PasswordFormProps {
  adminId: string;
}

const PasswordForm = ({ adminId }: PasswordFormProps) => {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const performResetPasswordRequest = () => {
    setIsPending(true);
    createPasswordResetToken(adminId)
      .then((result) => {
        toast({
          title: result.title,
          description: result.description,
          variant: result.success ? "default" : "destructive",
        });
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  return (
    <Button
      onClick={performResetPasswordRequest}
      disabled={isPending || adminId === ""}
      className="mb-5"
    >
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Send Reset Password Email
    </Button>
  );
};

export default PasswordForm;
