import {BASE_URL} from "../config"

// Fetch all work shifts
export const fetchWorkShifts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/work-time-view/`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching work shifts:', error);
    throw error;
  }
};

// Create a new work shift
export const createWorkShift = async (shiftData) => {
  try {
    const response = await fetch(`${BASE_URL}/work-time-policies/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shiftData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating work shift:', error);
    throw error;
  }
};

// Update an existing work shift
export const updateWorkShift = async (shiftData) => {
  try {
    const response = await fetch(`${BASE_URL}/work-time-view/${shiftData.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shiftData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating work shift:', error);
    throw error;
  }
};

// Delete a work shift
export const deleteWorkShift = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/work-time-view/${id}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    return id;
  } catch (error) {
    console.error('Error deleting work shift:', error);
    throw error;
  }
};
