"use client";
import { useUser } from '@clerk/nextjs';
import Landing from './landing';
import Home from './home';

import { api } from "~/trpc/react";

interface HomeProps {
  userId: number | undefined;
}

export default function MainPage() {
  const { user, isSignedIn } = useUser();

  if (!isSignedIn) {
    return <Landing />;
  } else {
    const user_email = user?.emailAddresses[0]?.emailAddress;
    const first_name = user?.firstName;
    const last_name = user?.lastName;


    if (!user_email || !first_name || !last_name) {
      return <div>Error: Unable to fetch user details</div>;
    }

    const { data: id, error, isLoading } = api.user.getUserByEmail.useQuery({
      email: user_email,
      firstName: first_name,
      lastName: last_name,
    });

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>Error: {error.message}</div>;
    }

    const user_id = id?.user_id;

    return <Home userId={user_id} />;
  }
}
