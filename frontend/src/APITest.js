import React, { useState } from 'react';

const APITest = () => {
    const [result, setResult] = useState('');

    const registerUser = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'user'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResult('Success: ' + JSON.stringify(data));
        } catch (error) {
            setResult('Error: ' + error.message);
        }
    };

    const testConnection = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/health');
            const data = await response.json();
            setResult('Server health: ' + JSON.stringify(data));
        } catch (error) {
            setResult('Cannot connect to server: ' + error.message);
        }
    };

    return (
        <div>
            <h2>API Test</h2>
            <button onClick={registerUser}>Test Register</button>
            <button onClick={testConnection}>Test Server Health</button>
            <div>{result}</div>
        </div>
    );
};

export default APITest;