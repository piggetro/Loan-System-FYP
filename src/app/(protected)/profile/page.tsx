// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
 "use client";

import React, { useState } from 'react';
import { User } from '@prisma/client'; // Importing User from Prisma client
import TopHeaderComponent from 'src/app/_components/TopHeader';
import PersonalParticularForm from './personalParticularForm';
import PasswordForm from './password';

interface ProfilePageProps {
  user: User;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('personal');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <TopHeaderComponent pathName="My Profile" pageName="My Profile" />
      <div className="bg-white p-4">
        <div className="flex">
          {/* Left Side - Tabs */}
          <div className="mr-4">
            <div
              className={`p-4 mb-2 cursor-pointer ${
                activeTab === 'personal' ? 'bg-gray-200' : ''
              }`}
              onClick={() => handleTabClick('personal')}
            >
              Personal Particular
            </div>
            <div
              className={`p-4 mb-2 cursor-pointer ${
                activeTab === 'password' ? 'bg-gray-200' : ''
              }`}
              onClick={() => handleTabClick('password')}
            >
              Password
            </div>
          </div>
          {/* Right Side - Form */}
          <div className="flex-1">
            {activeTab === 'personal' && <PersonalParticularForm user={user} />}
            {activeTab === 'password' && <PasswordForm />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
