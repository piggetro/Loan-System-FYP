import React from "react";
import TopHeaderComponent from "../../../_components/TopHeader";
import LoanRequestComponent from "./_components/LoanRequest";
import { api } from "@/trpc/server";
import { type Inventory } from "./_components/Columns";

const LoanRequestPage = async () => {
  const categoriesAndSubCategories = await api.loanRequest.getCategories();
  const equipmentAndInventory = await api.loanRequest.getEquipment();
  const inventory = await adaptEquipmentAndInventory();
  const approvingLecturers = await api.loanRequest.getApprovingLecturers();

  async function adaptEquipmentAndInventory() {
    const tempInventory: Inventory[] = [];
    equipmentAndInventory.forEach((equipment) => {
      const quantityAvailable = equipment.inventory.length;
      if (quantityAvailable != 0) {
        const tempEquipement = {
          equipmentId: equipment.id,
          itemDescription: equipment.name,
          category: equipment.subCategory.category.name,
          subCategory: equipment.subCategory.name,
          quantityAvailable: quantityAvailable,
          quantitySelected: 1,
        };
        tempInventory.push(tempEquipement);
      }
    });
    return tempInventory;
  }

  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Loans / Loans Request"
        pageName="Loan Request"
      />
      <LoanRequestComponent
        equipmentAndInventory={inventory}
        categoriesAndSubCategories={categoriesAndSubCategories}
        approvingLecturers={approvingLecturers}
      />
    </div>
  );
};

export default LoanRequestPage;
