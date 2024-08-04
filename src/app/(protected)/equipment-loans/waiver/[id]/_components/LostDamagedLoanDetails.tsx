/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { Skeleton } from "@/app/_components/ui/skeleton";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import { useToast } from "@/app/_components/ui/use-toast";
import { Button } from "@/app/_components/ui/button";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { Textarea } from "@/app/_components/ui/textarea";
import { Label } from "@/app/_components/ui/label";
import { Input } from "@/app/_components/ui/input";
const formSchema = z.object({
  //Change this for the word requirement
  waiverRequest: z.string().min(1, { message: "Waiver Request is required" }),
});

const LostBrokenLoanDetails: React.FC<{
  id: string;
}> = ({ id }) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | undefined>();
  const [fileType, setFileType] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  //Get the Loan
  const { isFetching, refetch, data } =
    api.loan.getLostBrokenLoanByLoanId.useQuery({
      id: id,
    });
  //For Submitting Waiver
  const submitWaiver = api.waiver.proccessWaiverRequest.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (data) {
      form.setValue("waiverRequest", data.waiveRequest!);
    }
  }, [data]);
  //To Refresh

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? undefined;

    if (selectedFile) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];

      if (!validImageTypes.includes(selectedFile.type)) {
        alert("Please select a valid image file (JPG, PNG, GIF).");
        setFile(undefined);
        setFileType(null);
        setImagePreview(null);
        return;
      }

      setFile(selectedFile);

      const previewUrl = URL.createObjectURL(selectedFile);
      setImagePreview(previewUrl);

      const mimeTypeToExtension: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
      };

      const fileExtension = mimeTypeToExtension[selectedFile.type] ?? "unknown";
      setFileType(fileExtension);
    } else {
      setFile(undefined);
      setFileType(null);
      setImagePreview(null);
    }
  };

  function refresh() {
    refetch().catch(() => {
      toast({
        title: "An Error Occured",
        description: "Please refresh the page to see updated details",
      });
    });
  }
  function onSubmit(values: z.infer<typeof formSchema>) {
    submitWaiver
      .mutateAsync({
        id: id,
        waiveRequest: values.waiverRequest,
        photoType: fileType,
      })
      .then(async (data) => {
        try {
          if (!file) return;
          const formData = new FormData();
          formData.set("file", file);
          formData.set("photoPath", data.imagePath);

          const res = await fetch("/api/uploads", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error(await res.text());
        } catch (e) {
          console.error(e);
        } finally {
          toast({
            title: "Successfully Submitted Waive Request",
            description: "You Will be notified once Waiver has been reviewed",
          });
          setFile(undefined);
          setFileType(null);
          setImagePreview(null);
          refresh();
        }
      })
      .catch((error) => {
        toast({ title: error });
      });
  }

  if (isFetching || !data) {
    return (
      <div className="w-7/8 h-full  rounded-lg bg-white p-5 shadow-lg">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="mt-4 h-5 w-96" />
        <Skeleton className="mt-2 h-5 w-96" />
        <Skeleton className="mt-2 h-5 w-96" />
        <Skeleton className="mt-2 h-5 w-96" />
        <Skeleton className="mt-5 h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-7/8 h-full  rounded-lg bg-white p-5 shadow-lg">
        <div className="text-xl font-bold">{data.loanId}</div>
        <div className="mt-4 text-sm">
          <p className="flex">
            <span className="font-bold">Borrower:&nbsp;</span>
            {!data.loanedBy ? "Deleted Account" : data.loanedBy?.name}
          </p>
          <p className="flex">
            <span className="font-bold">Approved By:&nbsp;</span>
            {data.approvedBy?.name ?? "-"}
          </p>

          <p className="flex">
            <span className="font-bold">Prepared By:&nbsp;</span>
            {data.preparedBy?.name ?? "-"}
          </p>
          <p className="flex">
            <span className="font-bold">Issued By:&nbsp;</span>
            {data.issuedBy?.name ?? "-"}
          </p>
          <p className="flex">
            <span className="font-bold">Returned To:&nbsp;</span>
            {data.returnedTo?.name ?? "-"}
          </p>

          <p className="flex" suppressHydrationWarning>
            <span className="font-bold">Date Issued:&nbsp;</span>
            {new Date(data.dateIssued).toLocaleDateString()}
          </p>
          <p suppressHydrationWarning>
            <b>Date Updated: </b>
            {data.dateUpdated === null
              ? "-"
              : data.dateUpdated.toLocaleDateString()}
          </p>
          <p>
            <b>Updated By: </b>
            {data.updatedByName?.name ?? "-"}
          </p>
          <p className="flex">
            <span className="font-bold">Status:&nbsp;</span>
            <div className="flex items-center">
              <div
                className={`mr-2 h-3 w-3 rounded-full ${
                  data.status === "APPROVED" || data.status === "RESOLVED"
                    ? "bg-green-500"
                    : data.status === "PENDING" ||
                        data.status === "PENDING_REQUEST"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              ></div>
              <p> {toStartCase(data.status)}</p>
            </div>
          </p>
        </div>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="mt-2 flex items-start space-x-4">
                <div className="w-3/4">
                  <FormField
                    control={form.control}
                    name="waiverRequest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          Waive Request
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className="h-72 w-full"
                            disabled={data.status !== "PENDING_REQUEST"}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-1/4">
                  <Label htmlFor="file-upload">
                    Upload any necessary evidence
                  </Label>
                  {data.status === "PENDING_REQUEST" ? (
                    <Input
                      id="file-upload"
                      type="file"
                      name="file"
                      className="mt-2 cursor-pointer"
                      accept="image/jpeg, image/png, image/gif"
                      onChange={handleFileChange}
                      disabled={data.status !== "PENDING_REQUEST"}
                      style={{ color: "transparent" }}
                    />
                  ) : null}
                  {imagePreview ? (
                    <div className="mt-2 flex-shrink-0">
                      <img
                        src={imagePreview}
                        alt="Selected File Preview"
                        className="h-40 w-40 border border-gray-300 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mt-2 flex-shrink-0">
                      <img
                        src={"/api/uploads/" + data.imagePath}
                        alt="Selected File Preview"
                        className="h-40 w-40 border border-gray-300 object-cover"
                      />
                    </div>
                  )}
                  {file && (
                    <div className="mt-2">
                      <p>Selected file: {file.name}</p>
                      <p>File type: {fileType}</p>
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-2 text-sm font-medium">
                <b>Submitted On: </b>
                {data.dateSubmitted?.toLocaleString() ?? ""}
              </p>
              <div className="mt-10 flex justify-center">
                <Button
                  disabled={
                    form.getValues("waiverRequest") === "" ||
                    data.status !== "PENDING_REQUEST" ||
                    form.getValues("waiverRequest") === null ||
                    form.getValues("waiverRequest") === undefined
                  }
                  type="submit"
                >
                  Submit
                </Button>
              </div>
            </form>
          </Form>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mt-7">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Item Description</TableHead>

                    <TableHead>Checklist</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.loanItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.checklist}</TableCell>
                      <TableCell>{item.remarks}</TableCell>
                      <TableCell>$&nbsp;{item.cost ?? "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div
                            className={`mr-2 h-3 w-3 rounded-full ${
                              item.status === "RETURNED"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <p> {toStartCase(item.status!)}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
function toStartCase(string: string) {
  return string
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default LostBrokenLoanDetails;
