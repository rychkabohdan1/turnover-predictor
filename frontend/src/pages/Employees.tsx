import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  TablePagination,
  TableSortLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
} from '@mui/material';
import { 
  Download as DownloadIcon, 
  Search as SearchIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Add as AddIcon
} from '@mui/icons-material';
import EditEmployeeDialog from '../components/EditEmployeeDialog';

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

interface EmployeesProps {
  onExport: (format: 'pdf' | 'excel') => void;
  onExportWithRecommendations: (format: 'pdf' | 'excel') => void;
  exportLoading: boolean;
  employees: Employee[];
  onDelete: (id: string) => void;
}

type SortField = 'name' | 'department' | 'position' | 'risk_level' | 'salary';
type SortOrder = 'asc' | 'desc';

const Employees: React.FC<EmployeesProps> = ({ onExport, onExportWithRecommendations, exportLoading, employees, onDelete }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [excelMenuAnchor, setExcelMenuAnchor] = useState<null | HTMLElement>(null);
  const [pdfMenuAnchor, setPdfMenuAnchor] = useState<null | HTMLElement>(null);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedEmployee) {
      try {
        setLoading(true);
        await onDelete(selectedEmployee._id);
        setDeleteDialogOpen(false);
        setSelectedEmployee(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete employee');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleEditSave = async (updatedEmployee: Employee) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/employees/${updatedEmployee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedEmployee)
      });

      if (!response.ok) {
        throw new Error('Failed to update employee');
      }


      const fetchResponse = await fetch('http://localhost:5000/api/employees', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!fetchResponse.ok) {
        throw new Error('Failed to fetch updated employees');
      }
      


      window.location.reload();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setAddDialogOpen(true);
  };

  const handleAddClose = () => {
    setAddDialogOpen(false);
  };

  const handleAddSave = async (newEmployee: Employee) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newEmployee)
      });

      if (!response.ok) {
        throw new Error('Failed to create employee');
      }

      // Reload the page to show the new employee
      window.location.reload();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees
    .filter((employee) => {
      const searchLower = search.toLowerCase();
      return (
        (employee.name.toLowerCase().includes(searchLower) ||
          employee.first_name.toLowerCase().includes(searchLower) ||
          employee.last_name.toLowerCase().includes(searchLower) ||
          employee.department.toLowerCase().includes(searchLower) ||
          employee.position.toLowerCase().includes(searchLower) ||
          employee.email.toLowerCase().includes(searchLower)) &&
        (riskLevel === 'all' || employee.risk_level === riskLevel)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'department':
          comparison = a.department.localeCompare(b.department);
          break;
        case 'position':
          comparison = a.position.localeCompare(b.position);
          break;
        case 'risk_level':
          const riskOrder: Record<string, number> = {
            'High Risk': 3,
            'Medium Risk': 2,
            'Low Risk': 1
          };
          const riskA = riskOrder[a.risk_level] || 0;
          const riskB = riskOrder[b.risk_level] || 0;
          comparison = riskB - riskA;
          break;
        case 'salary':
          comparison = a.salary - b.salary;
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getRiskColor = (risk: string) => {
    const cleanRisk = risk?.toLowerCase().replace(' risk', '');
    switch (cleanRisk) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatRiskLevel = (risk: string) => {
    const cleanRisk = risk?.replace(' Risk', '');
    return cleanRisk || 'Unknown';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Employees</Typography>
        <Box>
          {/* Add Employee Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{ mr: 1 }}
          >
            Add Employee
          </Button>

          {/* Excel Export Button with Menu */}
          <React.Fragment>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              endIcon={<ArrowDropDownIcon />}
              onClick={(event) => setExcelMenuAnchor(event.currentTarget)}
              disabled={exportLoading}
              sx={{ mr: 1 }}
            >
              Export Excel
            </Button>
            <Menu
              anchorEl={excelMenuAnchor}
              open={Boolean(excelMenuAnchor)}
              onClose={() => setExcelMenuAnchor(null)}
            >
              <MenuItem onClick={() => {
                onExport('excel');
                setExcelMenuAnchor(null);
              }}>
                Basic Export
              </MenuItem>
              <MenuItem onClick={() => {
                onExportWithRecommendations('excel');
                setExcelMenuAnchor(null);
              }}>
                With Recommendations
              </MenuItem>
            </Menu>
          </React.Fragment>

          {/* PDF Export Button with Menu */}
          <React.Fragment>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              endIcon={<ArrowDropDownIcon />}
              onClick={(event) => setPdfMenuAnchor(event.currentTarget)}
              disabled={exportLoading}
              sx={{ mr: 1 }}
            >
              Export PDF
            </Button>
            <Menu
              anchorEl={pdfMenuAnchor}
              open={Boolean(pdfMenuAnchor)}
              onClose={() => setPdfMenuAnchor(null)}
            >
              <MenuItem onClick={() => {
                onExport('pdf');
                setPdfMenuAnchor(null);
              }}>
                Basic Export
              </MenuItem>
              <MenuItem onClick={() => {
                onExportWithRecommendations('pdf');
                setPdfMenuAnchor(null);
              }}>
                With Recommendations
              </MenuItem>
            </Menu>
          </React.Fragment>
        </Box>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Search employees"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Risk Level</InputLabel>
          <Select
            value={riskLevel}
            label="Risk Level"
            onChange={(e) => setRiskLevel(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'department'}
                  direction={sortField === 'department' ? sortOrder : 'asc'}
                  onClick={() => handleSort('department')}
                >
                  Department
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'position'}
                  direction={sortField === 'position' ? sortOrder : 'asc'}
                  onClick={() => handleSort('position')}
                >
                  Position
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'risk_level'}
                  direction={sortField === 'risk_level' ? sortOrder : 'asc'}
                  onClick={() => handleSort('risk_level')}
                >
                  Risk Level
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'salary'}
                  direction={sortField === 'salary' ? sortOrder : 'asc'}
                  onClick={() => handleSort('salary')}
                >
                  Salary
                </TableSortLabel>
              </TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEmployees.map((employee) => (
              <TableRow key={employee._id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>
                  <Chip
                    label={formatRiskLevel(employee.risk_level)}
                    color={getRiskColor(employee.risk_level)}
                    size="small"
                  />
                </TableCell>
                <TableCell>${employee.salary.toLocaleString()}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleEditClick(employee)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(employee)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredEmployees.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Employee</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedEmployee?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <EditEmployeeDialog 
        open={editDialogOpen}
        employee={selectedEmployee}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />

      <EditEmployeeDialog 
        open={addDialogOpen}
        employee={null}
        onClose={handleAddClose}
        onSave={handleAddSave}
        isNewEmployee={true}
      />
    </Box>
  );
};

export default Employees; 