export interface User {
  _id: string;
  name: string;
  email: string;
  user_type: string;
}

export interface GetUsersResponse {
  data: {
    users: User[];
  };
}
