export type CompanyModule = { code: string; name: string; active: boolean }
export type Employee = { id: number; employee_no: string; first_name: string; last_name: string; email: string | null; status: string }
export type CompanyUser = { id: number; email: string; status: string; role_code: string | null }
export type Plan = { code: string; name: string; price_per_employee_monthly: number }
export type Department = { id: number; name: string; supervisor_user_id: number | null; supervisor_email: string | null }
