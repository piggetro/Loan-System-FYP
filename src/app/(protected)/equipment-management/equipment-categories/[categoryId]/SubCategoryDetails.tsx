"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Category } from "../_components/CategoriesColumns";
import {
  SubCategory,
  subCategoryColumns,
} from "./_components/SubCategoryColumns";
import { Separator } from "@/app/_components/ui/separator";
import CategoryInfo from "./_components/CategoryInfo";
import AddSubCategoryDialog from "./_components/AddSubCategoryDialog";
import EditSubCategory from "./_components/EditSubCategory";
import DeleteSubCategory from "./_components/DeleteSubCategory";
import { CategoriesDataTable } from "../_components/CategoriesDataTable";

interface SubCategoryDetailsProps {
  category: Category;
  subCategory: SubCategory[];
}

const SubCategoryDetails = ({
  category: data,
  subCategory: dataSubCategory,
}: SubCategoryDetailsProps) => {
  const [category, setCategory] = useState<Category>(data);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);

  const [subCategories, setSubCategories] =
    useState<SubCategory[]>(dataSubCategory);

  const [selectedSubCategories, setSelectedSubCategories] =
    useState<SubCategory | null>(null);

  const onDelete = useCallback((subCategory: SubCategory) => {
    setSelectedSubCategories(subCategory);
    setIsDeleteDialogOpen(true);
  }, []);

  const onEdit = useCallback((subCategory: SubCategory) => {
    setSelectedSubCategories(subCategory);
    setIsEditDialogOpen(true);
  }, []);

  const TableColumns = useMemo(
    () => subCategoryColumns({ onEdit, onDelete }),
    [],
  );

  return (
    <div className="mt-6 rounded-md bg-white px-6 py-4">
      <CategoryInfo category={category} setCategory={setCategory} />
      <Separator className="my-3" />
      <AddSubCategoryDialog
        isDialogOpen={isAddDialogOpen}
        setIsDialogOpen={setIsAddDialogOpen}
        categoryId={category.id}
        setSubCategories={setSubCategories}
      />
      <EditSubCategory
        isDialogOpen={isEditDialogOpen}
        setIsDialogOpen={setIsEditDialogOpen}
        subCategory={selectedSubCategories}
        setSubCategories={setSubCategories}
      />
      <DeleteSubCategory
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        subCategory={selectedSubCategories}
        setSubCategories={setSubCategories}
      />
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sub Categories</h3>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Add Sub Categories to Category
        </Button>
      </div>
      <CategoriesDataTable columns={TableColumns} data={subCategories} />
    </div>
  );
};

export default SubCategoryDetails;
