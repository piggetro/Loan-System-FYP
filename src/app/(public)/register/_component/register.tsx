/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import React, { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { Input } from "@/app/_components/ui/input";
import { useToast } from "@/app/_components/ui/use-toast";
import { register } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { Dialog, DialogContent } from "@/app/_components/ui/dialog";
import TermsComponent from "./Terms";

const RegisterComponent = () => {
  const router = useRouter();
  const [adminId, setAdminId] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [termsSelected, setTermsSelected] = useState<boolean>(false);
  const { toast } = useToast();
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isTermDialogOpen, setIsTermDialogOpen] = useState<boolean>(false);

  const performRegister = () => {
    if (adminId.length == 0) {
      toast({
        title: "User ID not entered",
        description: "Please enter User ID",
        variant: "destructive",
      });
      return;
    }
    //todo fix
    if (mobile == undefined) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter Singapore phone number without +65 prefix",
        variant: "destructive",
      });
      return;
    }
    setIsPending(true);
    register(adminId, mobile)
      .then((result) => {
        if (result?.title != undefined) {
          toast({
            title: result.title,
            description: result.description,
            variant: result.variant ? "destructive" : "default",
          });
        }
        setIsPending(false);
      })
      .catch((error) => {
        console.log(error);
        setIsPending(false);
      });
  };

  return (
    <div className="flex w-screen justify-center">
      <Dialog open={isTermDialogOpen} onOpenChange={setIsTermDialogOpen}>
        <DialogContent className="h-5/6 max-w-screen-md">
          <TermsComponent />
        </DialogContent>
      </Dialog>
      <div className="min w-1/3">
        <div className="mb-4 rounded-xl bg-white px-8 pb-8 pt-6 shadow-lg">
          <h1 className="mb-4 text-2xl tracking-tight">Registration</h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              performRegister();
            }}
          >
            <div className="">
              <Label
                className="mb-2 block text-sm font-bold text-gray-700"
                htmlFor="email"
              >
                User ID
              </Label>
              <Input
                value={adminId}
                onChange={(e) => {
                  setAdminId(e.target.value);
                }}
                id="adminId"
                placeholder="User ID Input"
                minLength={1}
                type="number"
                autoCapitalize="none"
                autoComplete="User Number"
                autoCorrect="off"
                disabled={isPending}
                className="mb-3"
              />
              <div className="mb-2 flex items-center text-sm">
                <Label
                  className="block w-1/2 font-bold text-gray-700"
                  htmlFor="mobile number"
                >
                  Contact Number
                </Label>
              </div>
              <Input
                value={mobile}
                onChange={(e) => {
                  if (e.target.value.length <= 8) {
                    setMobile(e.target.value);
                  }
                }}
                id="mobileNumber"
                placeholder="Password Input"
                minLength={1}
                type="number"
                autoCapitalize="none"
                autoComplete="tel"
                autoCorrect="off"
                disabled={isPending}
                className=""
              />
            </div>
            <div className="mb-4 mt-2 flex items-center text-sm font-medium">
              <Checkbox
                checked={termsSelected}
                onCheckedChange={(event) => {
                  if (typeof event === "boolean") setTermsSelected(event);
                }}
                id="terms"
              />
              <p className="ml-2">Accept&nbsp;</p>
              <p
                className="text-primary hover:cursor-pointer hover:font-semibold"
                onClick={() => {
                  setIsTermDialogOpen(true);
                }}
              >
                terms and conditions
              </p>
            </div>
            <Button
              disabled={
                isPending || !termsSelected || adminId === "" || mobile === ""
              }
              className="w-full"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register
            </Button>
          </form>
          <span className="mt-4 flex  text-sm font-medium">
            Have an account?
            <div
              className="ml-1 hover:cursor-pointer hover:text-cyan-700"
              onClick={() => {
                router.push("login");
              }}
            >
              Login Here
            </div>
          </span>
          <span className="mt-2 flex  text-sm font-medium">
            Forgot Password?
            <div
              className="ml-1 hover:cursor-pointer hover:text-cyan-700"
              onClick={() => {
                router.push("reset-password");
              }}
            >
              Reset Password
            </div>
          </span>
        </div>
      </div>
    </div>
  );
};

export default RegisterComponent;
