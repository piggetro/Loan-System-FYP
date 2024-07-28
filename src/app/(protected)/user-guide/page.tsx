import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";

const page = () => {
  return (
    <div>
      <TopHeaderComponent pathName={"User Guide"} pageName={"User Guide"} />
      <div className="mt-10 flex justify-center">
        <object
          data="/user-guide.pdf"
          type="application/pdf"
          width="80%"
          height="600"
        >
          <p>
            Your browser does not support PDFs.&nbsp;
            <a href="/user-guide.pdf">Download the PDF</a>.
          </p>
        </object>
      </div>
    </div>
  );
};

export default page;
