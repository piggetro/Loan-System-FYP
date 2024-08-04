// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import React from "react";
import PersonalParticularForm from "./PersonalParticularForm";
import PasswordForm from "./PasswordForm"; // Make sure the import path is correct

interface ProfilePageProps {
  user: {
    id: string;
    email: string;
    name: string;
    mobile: string | null;
    course: string | null;
    organizationUnit: string | null;
    staffType: string | null;
  };
}

const Profile = ({ user }: ProfilePageProps) => {
  return (
    <div defaultValue="Personal" className="mt-4">
      <div className="mt-2 rounded-md bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <PersonalParticularForm user={user} />
        </div>
        <PasswordForm adminId={user.id} />
      </div>
    </div>
  );
};

export default Profile;
