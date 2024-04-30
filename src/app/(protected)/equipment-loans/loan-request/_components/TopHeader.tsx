import React from "react";

type TopHeaderType = {
  pathName: string;
  pageName: string;
};

const TopHeaderComponent: React.FC<TopHeaderType> = ({
  pathName,
  pageName,
}) => {
  return (
    <div className="my-3">
      <p className="mb-3 text-sm opacity-70">{pathName}</p>
      <p className="text-2xl font-medium">{pageName}</p>
    </div>
  );
};

export default TopHeaderComponent;
