import React, { useState, FormEvent } from 'react';
import { profileRouter } from '@/server/api/routers/profile/profile.procedure';
// import { changePassword } from '@/lib/auth/actions';
import { useToast } from '@/app/_components/ui/use-toast';

const PasswordForm = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Make API call to update password
    const res = await fetch('/api/updatePassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    // Handle response
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
// import React, { useState, FormEvent } from 'react';
// import { useToast } from '@/app/_components/ui/use-toast';
// import { changePassword } from '@/lib/auth/actions'; // Assuming you have a similar function for updating the password

// const PasswordForm = () => {
//   const [oldPassword, setOldPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const { toast } = useToast();

//   const handleSubmit = async (e: FormEvent<HTMLButtonElement>) => {
//     e.preventDefault();

//     if (newPassword !== confirmPassword) {
//       toast({
//         title: 'Passwords do not match',
//         description: 'Please ensure that the new password and confirm password match.',
//         variant: 'destructive',
//       });
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const result = await changePassword(oldPassword, newPassword);

//       if (result?.title) {
//         toast({
//           title: result.title,
//           description: result.description,
//           variant: result.variant ? 'destructive' : 'default',
//         });
//       } else {
//         toast({
//           title: 'Password updated successfully',
//           description: 'Your password has been updated.',
//           variant: 'default',
//         });
//       }
//     } catch (error) {
//       console.error('Error updating password:', error);
//       toast({
//         title: 'Error updating password',
//         description: 'An error occurred while updating your password.',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsLoading(false);
//       setOldPassword('');
//       setNewPassword('');
//       setConfirmPassword('');
//     }
//   };

//   const handleCancel = () => {
//     setOldPassword('');
//     setNewPassword('');
//     setConfirmPassword('');
//   };

//   return (
//     <div>
//       {/* Old Password Input */}
//       <div className="mb-4">
//         <label className="mb-1 block text-sm font-bold" htmlFor="oldPassword">
//           Old Password
//         </label>
//         <input
//           type="password"
//           id="oldPassword"
//           placeholder="Enter your old password"
//           value={oldPassword}
//           onChange={(e) => setOldPassword(e.target.value)}
//           className="w-full rounded-md border border-gray-300 px-3 py-2"
//         />
//       </div>

//       {/* New Password Input */}
//       <div className="mb-4">
//         <label className="mb-1 block text-sm font-bold" htmlFor="newPassword">
//           New Password
//         </label>
//         <input
//           type="password"
//           id="newPassword"
//           placeholder="Enter your new password"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           className="w-full rounded-md border border-gray-300 px-3 py-2"
//         />
//       </div>

//       {/* Confirm New Password Input */}
//       <div className="mb-4">
//         <label className="mb-1 block text-sm font-bold" htmlFor="confirmPassword">
//           Confirm New Password
//         </label>
//         <input
//           type="password"
//           id="confirmPassword"
//           placeholder="Confirm your new password"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           className="w-full rounded-md border border-gray-300 px-3 py-2"
//         />
//       </div>

//       {/* Buttons */}
//       <div className="mt-4">
//         <button
//           onClick={handleSubmit}
//           disabled={isLoading}
//           className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600 disabled:bg-blue-300"
//         >
//           {isLoading ? 'Updating...' : 'Save'}
//         </button>
//         <button
//           onClick={handleCancel}
//           disabled={isLoading}
//           className="ml-2 rounded bg-gray-300 px-4 py-2 font-bold text-gray-800 hover:bg-gray-400 disabled:bg-gray-200"
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PasswordForm;