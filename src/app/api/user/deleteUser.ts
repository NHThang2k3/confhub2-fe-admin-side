import { appConfig } from "@/src/middleware";

const deleteUser = async (id: string): Promise<any> => {
    // Use the correct API endpoint and method (DELETE)
    const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/user/${id}`, {
    method: 'DELETE',
    // No body needed for a DELETE request
    });

    if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete user.');
    }
};

export default deleteUser;