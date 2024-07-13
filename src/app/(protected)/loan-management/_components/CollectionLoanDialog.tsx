import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import React, {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type TouchEvent,
} from "react";
import { api } from "@/trpc/react";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { Loader2, X } from "lucide-react";

import { useToast } from "@/app/_components/ui/use-toast";
import { Button } from "@/app/_components/ui/button";

type CollectionDataType = {
  equipmentId: string;
  loanItemId: string;
  description: string;
  checklist: string | undefined;
  assetNumber: string;
};

const CollectionLoanDialog: React.FC<{
  closeDialog: () => void;
  id: string;
}> = ({ closeDialog, id }) => {
  const [isCollecting, setIsCollecting] = useState<boolean>(false);
  const { isFetching, data } = api.loanRequest.getReadyLoanById.useQuery({
    id: id,
  });

  const processLoanCollection =
    api.loanRequest.processLoanCollection.useMutation();
  const processedLoanData: CollectionDataType[] = [];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSigned, setIsSigned] = useState<boolean>(false);

  const { toast: collectionLoanToast } = useToast();

  data?.loanItems.forEach((loanItem) => {
    processedLoanData.push({
      equipmentId: loanItem.equipment!.id ?? "",
      loanItemId: loanItem.id,
      description: loanItem.equipment!.name,
      checklist: loanItem.equipment!.checklist ?? "",
      assetNumber: "",
    });
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (
      ctx !== undefined &&
      ctx !== null &&
      data?.loanedBy?.name !== undefined
    ) {
      ctx.font = "15px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(data?.loanedBy?.name, 200, 180);
    }
  }, [data]);

  function onSubmit() {
    setIsCollecting(true);
    const canvas = canvasRef.current;

    if (canvas) {
      processLoanCollection
        .mutateAsync({ signatureData: canvas.toDataURL("image/png"), id: id })
        .then((results) => {
          setIsCollecting(false);
          collectionLoanToast({
            title: results.title,
            description: results.description,
            // @ts-expect-error ggg
            variant: results.variant,
          });
          if (results.variant !== "destructive") {
            closeDialog();
          }
        })
        .catch(() => {
          setIsCollecting(false);
          console.log("error");
        });
    }
  }

  const getCoordinates = (
    event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>,
  ) => {
    if ("touches" in event) {
      const touch = event.touches[0];
      const { left, top } = canvasRef.current!.getBoundingClientRect();
      return { x: touch!.clientX - left, y: touch!.clientY - top };
    } else {
      return { x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY };
    }
  };

  const startDrawing = (
    event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>,
  ) => {
    const { x, y } = getCoordinates(event);
    const context = canvasRef.current?.getContext("2d");
    if (context) {
      context.beginPath();
      context.moveTo(x, y);
      setIsDrawing(true);
      setIsSigned(true);
    }
  };

  const draw = (
    event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(event);
    const context = canvasRef.current?.getContext("2d");
    if (context) {
      context.lineTo(x, y);
      context.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const context = canvasRef.current?.getContext("2d");
    if (context) {
      context.closePath();
    }
  };

  const clearCanvas = () => {
    setIsSigned(false);
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (context && canvas !== null) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (
        context !== undefined &&
        context !== null &&
        data?.loanedBy?.name !== undefined
      ) {
        context.font = "15px sans-serif";
        context.textAlign = "center";
        context.fillText(data?.loanedBy?.name, 200, 180);
      }
    }
  };
  if (isFetching || !data) {
    return (
      <div className="w-7/8 h-full p-5 ">
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
    <div className="w-7/8 h-full overflow-y-scroll p-5">
      <div className="flex">
        <div className="flex w-1/2 flex-col">
          <div className="text-xl font-bold">{data.loanId}</div>
          <div className="mt-4 text-sm">
            <p className="flex">
              <span className="font-bold">Loaner:&nbsp;</span>
              {data.loanedBy === null ? "Deleted User" : data.loanedBy.name}
            </p>
            <p className="flex">
              <span className="font-bold">Approved By:&nbsp;</span>
              {data.approvedBy?.name ?? "-"}
            </p>
            <p className="flex">
              <span className="font-bold">Remark(s):&nbsp;</span> {data.remarks}
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
            <p className="flex">
              <span className="font-bold">Loan Status:&nbsp;</span>{" "}
              {data.status}
            </p>
            <p className="flex" suppressHydrationWarning>
              <span className="font-bold">Due Date:&nbsp;</span>
              {new Date(data.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex w-1/2 justify-end">
          <div
            onClick={() => {
              closeDialog();
            }}
          >
            <X></X>
          </div>
        </div>
      </div>

      <div className="mt-7">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Item Description</TableHead>
              <TableHead className="w-1/2">Checklist</TableHead>
              <TableHead>Asset Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.loanItems.map((loanItem) => (
              <TableRow key={loanItem.equipmentId}>
                <TableCell className="font-medium">
                  {loanItem.equipment?.name}
                </TableCell>
                <TableCell>{loanItem.equipment?.checklist}</TableCell>
                <TableCell>{loanItem.loanedInventory?.assetNumber}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-10 flex justify-center">
        <div className="flex flex-col items-center">
          <p className="font-semibold">Collection Reference Number</p>
          <p>{data.collectionReferenceNumber}</p>
        </div>
      </div>
      <div className="mt-10 flex flex-col items-center gap-2">
        <p className=" font-semibold">Rules and Regulations</p>
        <p>
          1. In the event of loss or irreparable damages, borrowers will be
          required to replace the equipment
          <br />
          2. Borrowers will be required to pay for the full cost of any repairs
          required for damaged equipment.
          <br />
          3. All equipment must be returned on the due date
          <br />
          4. Please present payment receipt at SOC IT Services for verifying and
          document purposes.
        </p>
        <div className="mt-10 flex flex-col items-center">
          <div className="font-bold">
            I, {data.loanedBy?.name}, acknowledge receipt of the above items.
          </div>
          <div>
            The Effective Date for the above items is&nbsp;
            <b>{new Date().toLocaleDateString()}</b>
          </div>
        </div>

        <div className=" overflow-hidden">
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="rounded-lg border border-black"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
        <Button
          onClick={() => {
            clearCanvas();
          }}
          variant={"secondary"}
          className="bg-gray-300 hover:bg-gray-200"
          type="button"
        >
          Clear Signature
        </Button>
      </div>
      <div className="mt-10 flex justify-center gap-3">
        <Button
          variant={"secondary"}
          className="bg-gray-300 hover:bg-gray-200"
          onClick={() => {
            closeDialog();
          }}
          type="button"
        >
          Close
        </Button>
        <Button
          onClick={() => {
            onSubmit();
          }}
          disabled={!isSigned || isCollecting}
        >
          {isCollecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Process Collection
        </Button>
      </div>
    </div>
  );
};

export default CollectionLoanDialog;
