import React from "react";
import { useUser } from "@auth0/nextjs-auth0/client"

function index() {

  // useUser returns user, error, isLoading
  const {user, error, isLoading} = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  // If we have an active user in the session
  if(user) {
    console.log(user);
    return (
      <div>
        Welcome {user.name}! <a href="/api/auth/logout">Logout</a><br/>
        Your nickname is {user.name}.
      </div>
    )
  }
 
  
  return <a href="/api/auth/login">Login</a>;
}

export default index;