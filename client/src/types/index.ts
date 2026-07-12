export interface Asset {
  id: string;
  name: string;
  category: string;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Retired';
  assignedTo?: string;
  purchaseDate: string;
  location: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}
