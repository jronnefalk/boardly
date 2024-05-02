import { useUser } from "@auth0/nextjs-auth0/client";
import Logout from "./Logout";
import Login from "./Login";

const UserProfile = () => {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  if (user) {
    return (
      <div>
        Welcome {user.name}! <Logout /><br/>
        Your nickname is {user.name}.
      </div>
    );
  }

  return <Login />;
};

export default UserProfile;
