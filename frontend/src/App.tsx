import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip} from 'chart.js';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Login from './pages/Login';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
        h1: {
            fontWeight: 500,
        },
        h2: {
            fontWeight: 500,
        },
        h3: {
            fontWeight: 500,
        },
        h4: {
            fontWeight: 500,
        },
        h5: {
            fontWeight: 500,
        },
        h6: {
            fontWeight: 500,
        },
        body1: {
            fontWeight: 400,
        },
        body2: {
            fontWeight: 400,
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    fontFamily: 'Roboto, sans-serif',
                },
            },
        },
    },
});

interface Employee {
    _id: string;
    name: string;
    first_name: string;
    last_name: string;
    department: string;
    position: string;
    risk_level: string;
    turnover_probability: number;
    email: string;
    hire_date: string;
    salary: number;
    performance_score: number;
    last_evaluation_date: string;
    projects: string[];
    skills: string[];
}

interface ChartData {
    name: string;
    value: number;
}

interface PieData {
    name: string;
    value: number;
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeesLoading, setEmployeesLoading] = useState(false);
    const [employeesError, setEmployeesError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        const fetchEmployees = async () => {
            if (!isAuthenticated) return;
            
            try {
                setEmployeesLoading(true);
                const response = await fetch('http://localhost:5000/api/employees', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch employees');
                }
                
                const data = await response.json();
                setEmployees(data);
                setEmployeesError(null);
            } catch (error) {
                console.error('Error fetching employees:', error);
                setEmployeesError(error instanceof Error ? error.message : 'Failed to fetch employees');
            } finally {
                setEmployeesLoading(false);
            }
        };

        fetchEmployees();
    }, [isAuthenticated]);

    const handleLogin = async (username: string, password: string): Promise<void> => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, password}),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    const handleExport = async (format: 'pdf' | 'excel') => {
        setExportLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/export?format=${format}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = format === 'excel' ? `employees.xlsx` : `employees.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExportLoading(false);
        }
    };

    const handleExportWithRecommendations = async (format: 'pdf' | 'excel') => {
        setExportLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/export-with-recommendations?format=${format}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = format === 'excel' ? `employee_recommendations.xlsx` : `employee_recommendations.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export with recommendations failed:', error);
        } finally {
            setExportLoading(false);
        }
    };

    const handleDeleteEmployee = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to delete employee');

            setEmployees(employees.filter(emp => emp._id !== id));
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Router>
                <Layout isAuthenticated={isAuthenticated} onLogout={handleLogout}>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                isAuthenticated ? (
                                    <Navigate to="/dashboard" replace/>
                                ) : (
                                    <Navigate to="/login" replace/>
                                )
                            }
                        />
                        <Route
                            path="/login"
                            element={
                                isAuthenticated ? (
                                    <Navigate to="/dashboard" replace/>
                                ) : (
                                    <Login onLogin={handleLogin}/>
                                )
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                isAuthenticated ? (
                                    <Dashboard/>
                                ) : (
                                    <Navigate to="/login" replace/>
                                )
                            }
                        />
                        <Route
                            path="/employees"
                            element={
                                isAuthenticated ? (
                                    <Employees
                                        onExport={handleExport}
                                        onExportWithRecommendations={handleExportWithRecommendations}
                                        exportLoading={exportLoading}
                                        employees={employees}
                                        onDelete={handleDeleteEmployee}
                                    />
                                ) : (
                                    <Navigate to="/login" replace/>
                                )
                            }
                        />
                    </Routes>
                </Layout>
            </Router>
        </ThemeProvider>
    );
}

export default App;
