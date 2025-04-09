export interface ApiResponse {
  status: string;
  message: string;
  data: {
    users: User[];
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
}
