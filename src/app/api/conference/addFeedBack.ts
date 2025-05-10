// api/feedback/addFeedback.ts
import { appConfig } from "@/src/middleware";
import { Feedback } from "../../../models/send/feedback.send"; // Create this model

export const addFeedback = async (feedbackData: {
    conferenceId: string; // Change to conferenceId
    description: string;
    star: number;
}): Promise<Feedback> => {
    // const userJSON = localStorage.getItem('user');
    // if (!userJSON) {
    //     throw new Error("User not logged in"); // Or handle differently
    // }
    // const user = JSON.parse(userJSON);
    // const creatorId = user.id;
    // if (!creatorId) {
    //     throw new Error("User ID not found in local storage");
    // }

    const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/feedback`, { // Use conferenceId in URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`, // Add userId to the headers
        },
        body: JSON.stringify({ conferenceId: feedbackData.conferenceId, description: feedbackData.description, star: feedbackData.star }), // Send description, star, and creatorId
    });

    if (!response.ok) {
        if (response.status === 401)
            throw new Error("Unauthorized"); // Or handle differently
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add feedback');
    }

    const newFeedback: Feedback = await response.json();
    return newFeedback;
};