import React, { useState, FormEvent } from 'react';
import { profileRouter } from '@/server/api/routers/profile/profile.procedure';
import { useToast } from '@/app/_components/ui/use-toast';

const PasswordForm = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState("");
  const {toast}=useToast();
//   const [isLoading, setIsLoading] = useState(false);
//   const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
        toast({
          title: 'Passwords do not match',
          description: 'Please ensure that the new password and confirm password match.',
          variant: 'destructive',
        });
        return;
    }

    try{
        // Make API call to update password
        const res =await fetch('/server/api/routers/profile.changePassword', {
            method: 'POST',
            headers:{
                'Content-Type':'application/json',
            },
            body: JSON.stringify({oldPassword, newPassword, confirmPassword}),
        });

        if(res.ok){
            const result = await res.json();
            toast({
                title:'Password updated successfully',
                description: 'Your password has been updated.',
                variant: 'default',
            });
        }else{
            const error = await res.json();
            toast({
                title: 'Error updating password',
                description: error.message,
                variant: 'destructive',
            });
        }
    }catch(error){
        toast({
            title:'Error updating password',
            description: ' An error occurred while updating your password.',
            variant: 'destructive',
        });
    }
  };
  const handleCancel = () => {
    // Reset form fields for password
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div>
      {/* Old Password Input */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-bold" htmlFor="oldPassword">
          Old Password
        </label>
        <input
          type="password"
          id="oldPassword"
          placeholder="Enter your old password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      {/* New Password Input */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-bold" htmlFor="newPassword">
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          placeholder="Enter your new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      {/* Confirm New Password Input */}
      <div className="mb-4">
        <label
          className="mb-1 block text-sm font-bold"
          htmlFor="confirmPassword"
        >
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      {/* Buttons */}
      <div className="mt-4">
        <button
          onClick={handleSubmit}
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

export default PasswordForm;