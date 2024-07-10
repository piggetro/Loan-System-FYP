import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Category, categoryColumns } from "./CategoriesColumns";
import DeleteCategory from "./DeleteCategory";
import { CategoriesDataTable } from "./CategoriesDataTable";

interface CategoryTableProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const CategoryTable = ({ categories, setCategories }: CategoryTableProps) => {
  const router = useRouter();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const onView = useCallback((category: Category) => {
    router.push(`/equipment-management/equipment-categories/${category.id}`);
  }, []);

  const onDelete = useCallback((category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  }, []);

  const TableColumns = useMemo(() => categoryColumns({ onView, onDelete }), []);

  return (
    <>
      <DeleteCategory
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        category={selectedCategory}
        setCategories={setCategories}
      />
      <CategoriesDataTable data={categories} columns={TableColumns} />
    </>
  );
};

export default CategoryTable;
