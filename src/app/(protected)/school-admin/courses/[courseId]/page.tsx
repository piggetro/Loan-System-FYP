import React from "react";

interface pageProps {
  params: { courseId: string };
}

const page = ({ params }: pageProps) => {
  return <div>page</div>;
};

export default page;
