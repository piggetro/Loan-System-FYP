import { Button } from "@/app/_components/ui/button";

import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/_components/ui/accordion";

import { useToast } from "@/app/_components/ui/use-toast";
import { Textarea } from "@/app/_components/ui/textarea";
import { type WaiverRequest } from "@/db/types";
import { api } from "@/trpc/react";
import { useEffect } from "react";

const WaiverRequestDialog: React.FC<{
  waiverRequestArray: WaiverRequest[] | undefined;
  selectedWaiverId: string;
}> = ({ waiverRequestArray, selectedWaiverId }) => {
  const { toast } = useToast();
  const { data } = api.waiver.getWaiverRequestByWaiverId.useQuery({
    id: selectedWaiverId,
  });
  const createWaiverRequest = api.waiver.proccessWaiverRequest.useMutation();

  useEffect(() => {
    console.log(data);
  }, [data]);
  function submitWaiverRequest() {
    createWaiverRequest
      .mutateAsync({ id: selectedWaiverId, reason: "Halo" })
      .then(() => {
        toast({
          title: "Waiver Request Successfully Submitted",
          description: "You will be informed of the outcome soon",
        });
      })
      .catch((error) => {
        toast({ title: "An unexpected error occurred" });
      });
  }
  return (
    <DialogContent className="max-w-screen max-h-screen w-5/6">
      <DialogHeader>
        <DialogTitle className="text-2xl">Waiver Request</DialogTitle>
      </DialogHeader>
      <div className="mt-8 flex flex-col text-lg">
        <p className=" mb-5 text-xl font-medium">
          Please write your waiver request below
        </p>
        <div>
          <Textarea
            rows={10}
            value={`Reasoning Goes here Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero quae dignissimos doloribus veritatis quod. Eum exercitationem iste maxime beataperiam deserunt optio, sunt labore officiis veniam doloremque iusto magnam incidunt?`}
          ></Textarea>
        </div>
        <div className="mt-5 flex justify-end">
          <Button
            onClick={() => {
              submitWaiverRequest();
            }}
            type="submit"
            className="w-28"
          >
            {/* {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} */}
            Submit
          </Button>
        </div>
      </div>
      {data?.length !== 0 ? (
        <div className="mt-8 flex flex-col text-lg">
          <p className=" mb-5 text-xl font-medium">Past Waiver Request</p>
          <div>
            <Accordion type="single" collapsible className="w-full">
              {data?.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger>
                    <div className="flex">
                      <div className="text-left">
                        <p suppressHydrationWarning>
                          Submited On:{" "}
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                        <p className="flex items-center">
                          <div
                            className={`mr-2 h-3 w-3 rounded-full ${
                              item.status === "APPROVED"
                                ? "bg-green-500"
                                : item.status === "PENDING" ||
                                    item.status === "AWAITING_REQUEST"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                          ></div>
                          {toStartCase(item.status)}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {item.reason} Lorem ipsum dolor sit amet consectetur
                    adipisicing elit. Libero quae dignissimos doloribus
                    veritatis quod. Eum exercitationem iste maxime beatae
                    aperiam deserunt optio, sunt labore officiis veniam
                    doloremque iusto magnam incidunt?
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      ) : null}
    </DialogContent>
  );
};

function toStartCase(string: string) {
  return string
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default WaiverRequestDialog;
