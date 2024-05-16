import React, { useState } from 'react';
import { User } from '@prisma/client';
// import { updateUserProfile } from '@/lib/auth/actions';
import { useToast } from '@/app/_components/ui/use-toast';

interface PersonalParticularFormProps {
  user: User;
}

const PersonalParticularForm: React.FC<PersonalParticularFormProps> = ({ user }) => {
    const [fullName, setFullName] = useState(user?.name);
    const [userID, setUserID] = useState(user?.id);
    const [email, setEmail] = useState(user?.email);
    const [mobileNumber, setMobileNumber] = useState(user?.mobile);
    const [course, setCourse] = useState(user?.courseId);
    const { toast } = useToast();

  const handleSave = async () => {
    try {
      // Perform save action for personal particulars
      // Assuming you have an API route for updating user data
      const response = await fetch('/api/updateUser', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          userID,
          email,
          mobileNumber,
          course,
        }),
      });

      if (response.ok) {
        console.log('Personal particulars updated successfully');
      } else {
        console.error('Failed to update personal particulars');
      }
    } catch (error) {
      console.error('Error updating personal particulars:', error);
    }
    // try {
    //     const result = await updateUserProfile(fullName, mobileNumber , course);
  
    //     if (result?.title) {
    //       toast({
    //         title: result.title,
    //         description: result.description,
    //         variant: result.variant ? 'destructive' : 'default',
    //       });
    //     } else {
    //       toast({
    //         title: 'Profile updated successfully',
    //         description: 'Your personal particulars have been updated.',
    //         variant: 'default',
    //       });
    //     }
    //   } catch (error) {
    //     console.error('Error updating personal particulars:', error);
    //     toast({
    //       title: 'Error updating personal particulars',
    //       description: 'An error occurred while updating your personal particulars.',
    //       variant: 'destructive',
    //     });
    //   }
  };

  const handleCancel = () => {
    // Reset form fields for personal particulars
    setFullName(user.name);
    setUserID(user.id);
    setEmail(user.email);
    setMobileNumber(user.mobile);
    setCourse(user.courseId);
  };

  return (
    <div>
      {/* Full Name Input */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-bold" htmlFor="fullName">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          disabled
        />
      </div>

      {/* User ID Input */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-bold" htmlFor="userID">
          User ID
        </label>
        <input
          type="text"
          id="userID"
          placeholder="Enter your user ID"
          value={userID}
          onChange={(e) => setUserID(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          disabled
        />
      </div>

      {/* Email Input */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-bold" htmlFor="email">
          Email
        </label>
        <input
          type="text"
          id="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          disabled
        />
      </div>

      {/* Mobile Number Input */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-bold" htmlFor="mobileNumber">
          Mobile Number
        </label>
        <input
          type="text"
          id="mobileNumber"
          placeholder="Enter your mobile number"
          value={mobileNumber ?? ''}
          onChange={(e) => setMobileNumber(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      {/* Course Dropdown */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-bold" htmlFor="course">
          Course
        </label>
        <select
            id="course"
            value={course ?? ''}
            onChange={(e)=>setCourse(e.target.value)}>

            <option value="" disabled>Select your course</option>
            <option value="DIT">Diploma in Information Technology</option>
            <option value="DAAA">Diploma in Applied AI & Analytics</option>
            <option value="DISM">Diploma in Infocomm Security Management</option>
            <option value="DCITP">Common ICT Programme</option>
        </select>        
      </div>

      {/* Buttons */}
      <div className="mt-4">
        <button
          onClick={handleSave}
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          className="ml-2 rounded bg-gray-300 px-4 py-2 font-bold text-gray-800 hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PersonalParticularForm;