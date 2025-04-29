export interface User {
  _id: string;
  name: string;
  email: string;
  user_type: string;
  banned: boolean;
}

export interface GetUsersResponse {
  data: {
    users: User[];
  };
}
