"use client";

import React, { useCallback, useMemo, useState } from "react";

import { DataTable } from "./DataTable";
import { Holiday, holidayColumns } from "./HolidayColumns";
import DeleteHoliday from "./DeleteHoliday";
import EditHolidayForm from "./EditHolidayForm";

interface HolidayTableProps {
  holiday: Holiday[];
  setHolidays: React.Dispatch<React.SetStateAction<Holiday[]>>;
}

const HolidayTable = ({ holiday, setHolidays }: HolidayTableProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);

  const onEdit = useCallback((holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsDialogOpen(true);
  }, []);

  const onDelete = useCallback((holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsDeleteDialogOpen(true);
  }, []);

  const TableColumns = useMemo(() => holidayColumns({ onEdit, onDelete }), []);

  return (
    <>
      <DeleteHoliday
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        holiday={selectedHoliday}
        setHolidays={setHolidays}
      />
      <EditHolidayForm
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        holiday={selectedHoliday}
        setHolidays={setHolidays}
      />
      <DataTable data={holiday} columns={TableColumns} />
    </>
  );
};

export default HolidayTable;
