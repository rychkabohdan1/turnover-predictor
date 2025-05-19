import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Card,
  CardHeader,
  CardContent,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  ErrorOutline as ErrorOutlineIcon,
} from '@mui/icons-material';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';

const RISK_LEVELS = ['High', 'Medium', 'Low'] as const;
type RiskLevel = typeof RISK_LEVELS[number];

const COLORS = {
  departments: ['#2196F3', '#4CAF50', '#FFC107', '#E91E63', '#9C27B0', '#FF5722'],
  status: {
    'High': '#f44336',
    'Medium': '#FFC107',
    'Low': '#4CAF50',
  } as const
} as const;

const RISK_LEVEL_MAPPING: Record<string, RiskLevel> = {
  'High Risk': 'High',
  'Medium Risk': 'Medium',
  'Low Risk': 'Low',
  'high': 'High',
  'medium': 'Medium',
  'low': 'Low'
};

const formatRiskLevel = (risk: string): RiskLevel => {
  const cleanRisk = risk.trim();
  return RISK_LEVEL_MAPPING[cleanRisk] || 'Medium';
};

const getBackendRiskLevel = (risk: string): string => {
  const cleanRisk = formatRiskLevel(risk);
  return `${cleanRisk} Risk`;
};

const getRiskColor = (risk: string): keyof typeof COLORS.status => {
  return formatRiskLevel(risk);
};

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, trend }) => (
  <Paper 
    elevation={2}
    sx={{ 
      p: 3, 
      height: '100%',
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
      borderRadius: 2,
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
      }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ 
        p: 1, 
        borderRadius: 1, 
        backgroundColor: 'primary.light',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </Box>
      <Typography 
        variant="h6" 
        color="text.secondary" 
        sx={{ 
          ml: 2,
          fontSize: '1rem',
          fontWeight: 500,
          fontFamily: 'Roboto, sans-serif'
        }}
      >
        {title}
      </Typography>
    </Box>
    <Typography 
      variant="h4" 
      sx={{ 
        fontWeight: 600,
        color: 'text.primary',
        fontSize: '2rem',
        fontFamily: 'Roboto, sans-serif'
      }}
    >
      {value}
    </Typography>
    {trend !== undefined && (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Typography 
          variant="body2" 
          color={trend >= 0 ? 'success.main' : 'error.main'}
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 500
          }}
        >
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            ml: 1,
            fontFamily: 'Roboto, sans-serif'
          }}
        >
          vs last month
        </Typography>
      </Box>
    )}
  </Paper>
);

interface ChartData {
  name?: string;
  value?: number;
  department?: string;
  status?: string;
  count: number;
}

interface DepartmentChartProps {
  data: ChartData[];
}

const DepartmentChart: React.FC<DepartmentChartProps> = ({ data }) => (
  <Box sx={{ width: '100%', height: 400 }}>
    <ResponsiveBar
      data={data.map(item => ({
        department: item.department || 'Unknown',
        count: item.count
      }))}
      keys={['count']}
      indexBy="department"
      margin={{ top: 50, right: 50, bottom: 70, left: 60 }}
      padding={0.3}
      valueScale={{ type: 'linear' }}
      colors={{ scheme: 'nivo' }}
      borderRadius={4}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -45,
        legend: 'Department',
        legendPosition: 'middle',
        legendOffset: 60
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Count',
        legendPosition: 'middle',
        legendOffset: -40
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: 'color',
        modifiers: [['darker', 1.6]]
      }}
      role="application"
      ariaLabel="Department distribution"
      theme={{
        axis: {
          ticks: {
            text: {
              fontSize: 12,
              fill: '#666666'
            }
          },
          legend: {
            text: {
              fontSize: 12,
              fill: '#666666'
            }
          }
        }
      }}
    />
  </Box>
);

interface StatusChartProps {
  data: ChartData[];
}

const StatusChart: React.FC<StatusChartProps> = ({ data }) => {
  const riskOrder = {
    'High Risk': 3,
    'Medium Risk': 2,
    'Low Risk': 1
  };

  const sortedData = [...data].sort((a, b) => {
    const aRisk = (a.status || '');
    const bRisk = (b.status || '');
    return (riskOrder[bRisk as keyof typeof riskOrder] || 0) - (riskOrder[aRisk as keyof typeof riskOrder] || 0);
  });

  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <ResponsivePie
        data={sortedData.map(item => ({
          id: formatRiskLevel(item.status || ''),
          label: formatRiskLevel(item.status || ''),
          value: item.count,
          color: COLORS.status[formatRiskLevel(item.status || '')]
        }))}
        sortByValue={false}
        enableArcLinkLabels={true}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ datum: 'data.color' }}
        borderWidth={1}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 0.2]]
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#333333"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsRadiusOffset={0.6}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: 'color',
          modifiers: [['darker', 2]]
        }}
        arcLabel={(d: { value: number; }) => {
          const total = sortedData.reduce((sum, item) => sum + item.count, 0);
          return `${d.value} (${((d.value / total) * 100).toFixed(0)}%)`;
        }}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: '#999',
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: '#000'
                }
              }
            ]
          }
        ]}
      />
    </Box>
  );
};

interface TopRiskEmployeeProps {
  data: any[];
}

const TopRiskEmployees: React.FC<TopRiskEmployeeProps> = ({ data }) => {
  const formatRiskLevel = (risk: string) => {
    const cleanRisk = risk.toLowerCase();
    return cleanRisk.charAt(0).toUpperCase() + cleanRisk.slice(1);
  };

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', fontFamily: 'Roboto, sans-serif' }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', fontFamily: 'Roboto, sans-serif' }}>Department</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', fontFamily: 'Roboto, sans-serif' }}>Risk Level</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem', fontFamily: 'Roboto, sans-serif' }}>Risk Score</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((employee) => (
            <TableRow 
              key={employee._id}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                }
              }}
            >
              <TableCell sx={{ fontSize: '0.875rem', fontFamily: 'Roboto, sans-serif' }}>{employee.name}</TableCell>
              <TableCell sx={{ fontSize: '0.875rem', fontFamily: 'Roboto, sans-serif' }}>{employee.department}</TableCell>
              <TableCell>
                <Chip
                  label={formatRiskLevel(employee.risk_level)}
                  color={
                    employee.risk_level.toLowerCase().includes('high') ? 'error' :
                    employee.risk_level.toLowerCase().includes('medium') ? 'warning' : 'success'
                  }
                  size="small"
                  sx={{ 
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    fontFamily: 'Roboto, sans-serif'
                  }}
                />
              </TableCell>
              <TableCell 
                align="right" 
                sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  fontFamily: 'Roboto, sans-serif',
                  color: employee.turnover_probability >= 0.7 ? 'error.main' : 
                         employee.turnover_probability >= 0.3 ? 'warning.main' : 'success.main'
                }}
              >
                {(employee.turnover_probability * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface DepartmentRiskChartProps {
  data: {
    _id: string;
    risk_distribution: Array<{
      risk_level: string;
      count: number;
    }>;
  }[];
}

const DepartmentRiskChart: React.FC<DepartmentRiskChartProps> = ({ data }) => {
  const riskLevels = ['High', 'Medium', 'Low'] as const;
  
  type RiskLevel = typeof riskLevels[number];
  
  interface DepartmentRisk {
    department: string;
    High: number;
    Medium: number;
    Low: number;
    [key: string]: string | number;
  }

  const riskLevelsMapping: { [key: string]: RiskLevel } = {
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low'
  };

  const formattedData = data.map(dept => {
    const formattedRisks: Record<RiskLevel, number> = {
      'High': 0,
      'Medium': 0,
      'Low': 0
    };

    dept.risk_distribution.forEach((risk) => {
      const normalizedRiskLevel = risk.risk_level.toLowerCase().trim().replace(' risk', '');
      const displayRiskLevel = riskLevelsMapping[normalizedRiskLevel];
      if (displayRiskLevel) {
        formattedRisks[displayRiskLevel] = risk.count;
      }
    });

    return {
      department: dept._id,
      ...formattedRisks
    } as DepartmentRisk;
  });

  const sortedData = [...formattedData].sort((a, b) => {
    const getScore = (dept: DepartmentRisk) => {
      return (dept['High'] * 3) + (dept['Medium'] * 2) + dept['Low'];
    };
    return getScore(b) - getScore(a);
  });

  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <ResponsiveBar
        data={sortedData}
        keys={riskLevels}
        indexBy="department"
        margin={{ top: 50, right: 130, bottom: 70, left: 60 }}
        padding={0.3}
        groupMode="grouped"
        valueScale={{ type: 'linear' }}
        colors={({ id }) => {
          if (id === 'High') return COLORS.status['High'];
          if (id === 'Medium') return COLORS.status['Medium'];
          return COLORS.status['Low'];
        }}
        borderRadius={4}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: 'Department',
          legendPosition: 'middle',
          legendOffset: 50
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Number of Employees',
          legendPosition: 'middle',
          legendOffset: -40
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: 'color',
          modifiers: [['darker', 1.6]]
        }}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1
                }
              }
            ]
          }
        ]}
        animate
        motionConfig="stiff"
      />
    </Box>
  );
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [topRiskEmployees, setTopRiskEmployees] = useState<any[]>([]);
  const [departmentRisks, setDepartmentRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [statsResponse, topRiskResponse, deptRisksResponse] = await Promise.all([
          fetch('http://localhost:5000/api/employees/stats', { headers }),
          fetch('http://localhost:5000/api/employees/top-risk', { headers }),
          fetch('http://localhost:5000/api/employees/department-risks', { headers })
        ]);

        if (!statsResponse.ok || !topRiskResponse.ok || !deptRisksResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const [statsData, topRiskData, deptRisksData] = await Promise.all([
          statsResponse.json(),
          topRiskResponse.json(),
          deptRisksResponse.json()
        ]);

        console.log('API Response - Stats:', statsData);
        console.log('API Response - Top Risk:', topRiskData);
        console.log('API Response - Department Risks:', deptRisksData);

        setStats(statsData);
        setTopRiskEmployees(topRiskData);
        setDepartmentRisks(deptRisksData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getRiskDistributionData = () => {
    if (!stats) return [];

    return [
      { 
        status: 'High Risk',
        count: stats.high_risk_count || 0
      },
      { 
        status: 'Medium Risk',
        count: stats.medium_risk_count || 0
      },
      { 
        status: 'Low Risk',
        count: stats.low_risk_count || 0
      }
    ];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  const riskData = getRiskDistributionData();
  console.log('Final risk data being passed to StatusChart:', riskData);

  return (
    <Box sx={{ p: 3 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 600,
          color: 'text.primary',
          mb: 4,
          fontFamily: 'Roboto, sans-serif'
        }}
      >
        Dashboard Overview
      </Typography>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)'
        },
        gap: 3,
        mb: 4
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <SummaryCard
            title="Total Employees"
            value={stats?.total_employees || 0}
            icon={<PeopleIcon sx={{ color: '#fff' }} />}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <SummaryCard
            title="High Risk Employees"
            value={stats?.high_risk_count || 0}
            icon={<WarningIcon sx={{ color: '#fff' }} />}
            trend={stats?.risk_trends?.high || 0}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <SummaryCard
            title="Average Risk Score"
            value={`${((stats?.average_risk || 0) * 100).toFixed(1)}%`}
            icon={<TrendingUpIcon sx={{ color: '#fff' }} />}
            trend={stats?.risk_trends?.average || 0}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <SummaryCard
            title="Total Departments"
            value={stats?.department_count || 0}
            icon={<AttachMoneyIcon sx={{ color: '#fff' }} />}
          />
        </Box>
      </Box>

      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, 1fr)'
        },
        gap: 3
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Card 
            elevation={2}
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
            }}
          >
            <CardHeader 
              title="Top 5 Risk Employees"
              titleTypography={{ variant: 'h6', fontWeight: 600 }}
              avatar={
                <Box sx={{ 
                  backgroundColor: 'error.light',
                  borderRadius: 1,
                  p: 1,
                  display: 'flex'
                }}>
                  <ErrorOutlineIcon sx={{ color: 'error.main' }} />
                </Box>
              }
            />
            <CardContent>
              <TopRiskEmployees data={topRiskEmployees} />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Card 
            elevation={2}
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
            }}
          >
            <CardHeader 
              title="Department Risk Distribution"
              titleTypography={{ variant: 'h6', fontWeight: 600 }}
            />
            <CardContent>
              <DepartmentRiskChart data={departmentRisks} />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Card 
            elevation={2}
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
            }}
          >
            <CardHeader 
              title="Risk Status Distribution"
              titleTypography={{ variant: 'h6', fontWeight: 600 }}
            />
            <CardContent>
              {riskData.length > 0 ? (
                <StatusChart data={riskData} />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <Typography color="text.secondary">No risk distribution data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Card 
            elevation={2}
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
            }}
          >
            <CardHeader 
              title="Employee Distribution by Department"
              titleTypography={{ variant: 'h6', fontWeight: 600 }}
            />
            <CardContent>
              <DepartmentChart data={stats?.department_distribution || []} />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;