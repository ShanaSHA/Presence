

// dashboardAPI.js
export const fetchEmployeeData = async () => {
try {
const response = await fetch('https://api.example.com/employee/dashboard');
return await response.json();
} catch (error) {
throw new Error('Failed to fetch employee data');
}
};

export const checkIn = async () => {
try {
const response = await fetch('https://api.example.com/employee/checkin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ timestamp: new Date().toISOString() }),
});
return await response.json();
} catch (error) {
throw new Error('Failed to check in');
}
};

export const checkOut = async () => {
try {
const response = await fetch('https://api.example.com/employee/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ timestamp: new Date().toISOString() }),
});
return await response.json();
} catch (error) {
throw new Error('Failed to check out');
}
};