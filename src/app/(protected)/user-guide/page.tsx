import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";

const page = () => {
  return (
    <div>
      <TopHeaderComponent pathName={"User Guide"} pageName={"User Guide"} />
      <div className="mt-2 flex justify-center">
        <object
          data="/user-guide.pdf"
          type="application/pdf"
          style={{
            width: "80vw", // 80% of the viewport width
            height: "80vh", // 80% of the viewport height
            minWidth: "300px", // Minimum width of 300px
            minHeight: "400px", // Minimum height of 400px
          }}
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
