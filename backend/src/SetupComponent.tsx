import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

export default function SetupComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const setupInitialData = useMutation(api.setup.setupInitialData);
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const handleSetup = async () => {
    if (!loggedInUser?.email) {
      toast.error("Please sign in first");
      return;
    }

    setIsLoading(true);
    try {
      const result = await setupInitialData({ userEmail: loggedInUser.email });
      toast.success(result.message);
      // Refresh the page to show admin interface
      window.location.reload();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold text-primary mb-4">Welcome to DearKC</h1>
      <p className="text-xl text-secondary mb-8">
        Hello, {loggedInUser?.email ?? "friend"}!
      </p>
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Setup Required</h2>
        <p className="text-gray-600 mb-6">
          This appears to be your first time accessing DearKC. Click the button below to set up your admin account and initialize the platform with sample data.
        </p>
        <button
          onClick={handleSetup}
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Setting up..." : "Initialize DearKC"}
        </button>
        <div className="mt-6 text-sm text-gray-500">
          <p>This will:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Grant you super admin access</li>
            <li>Create sample categories (News, Events, Business, Food)</li>
            <li>Add sample content to get you started</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
