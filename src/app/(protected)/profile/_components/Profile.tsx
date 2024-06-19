// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import React from 'react';
import PersonalParticularForm from './PersonalParticularForm';
import PasswordForm from './PasswordForm';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/app/_components/ui/tabs";

interface ProfilePageProps {
    user: {
        name: string,
        id: string,
        email: string,
        mobile: string,
        course: string,
        role: string,
        organizationUnit: string,
        staffType: string,
    };
}

const Profile = ({ user }: ProfilePageProps) => {
    // This file (the front end) is by Jing Ru but heavily refactored by Franc.
    return (
        <Tabs defaultValue="Personal" className="mt-4">
            <div className="mt-2 rounded-md bg-white px-6 py-4">
                <TabsList className="mb-2">
                    <TabsTrigger value="Personal">Personal Particulars</TabsTrigger>
                    <TabsTrigger value="Password">Change Password</TabsTrigger>
                </TabsList>
                <TabsContent value="Personal">
                    <PersonalParticularForm user={user} />
                </TabsContent>
                <TabsContent value="Password" className="flex-1">
                    <PasswordForm />
                </TabsContent>
            </div>
        </Tabs>
    );
};

export default Profile;
