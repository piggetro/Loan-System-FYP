"use client";

import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import { Category } from "./CategoriesColumns";
import CategoryTable from "./CategoryTable";
import AddCategory from "./AddCategory";

interface CategoryiesProps {
  categories: Category[];
}

const Categories = ({ categories: data }: CategoryiesProps) => {
  const [categories, setCategories] = useState<Category[]>(data);

  return (
    <Tabs defaultValue="categories" className="mt-4">
      <div className="mt-2 rounded-md bg-white px-6 py-4">
        <TabsList className="mb-2">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="addCategory">Add Category</TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <CategoryTable
            categories={categories}
            setCategories={setCategories}
          />
        </TabsContent>
        <TabsContent value="addCategory" className="flex-1">
          <AddCategory setCategory={setCategories} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default Categories;
