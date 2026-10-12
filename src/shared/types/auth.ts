export interface WorkerAccount {
  id: string; // Unique Worker ID e.g. "WRK-1001" or worker username
  workerName: string;
  workerEmail: string;
  workerPasskey: string;
  role: 'Worker';
  allowedModules: ('products' | 'blogs')[];
  status: 'active' | 'suspended';
  createdAt: string;
  assignedBy?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'User' | 'Admin' | 'Worker';
  workerPermissions?: ('products' | 'blogs')[];
  workerId?: string;
  phone?: string;
  emailVerified?: boolean;
  addresses?: Array<{
    id: string;
    title: string;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    zipCode: string;
  }>;
}
