export interface EmployeeData {
    name: string;
    age: number;
    years_of_experience: number;
    salary: number;
    department: string;
    performance_rating: number;
    work_hours: number;
    projects_completed: number;
    training_hours: number;
}

export interface Employee {
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
  age?: number;
  years_of_experience?: number;
  work_hours?: number;
  training_hours?: number;
}

export interface PredictionResponse {
    turnover_probability: number;
    risk_level: string;
    risk_factors: string[];
} 