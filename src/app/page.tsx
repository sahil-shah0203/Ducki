"use client";
import { useUser } from '@clerk/nextjs';
import Landing from './landing';
import Home from './home';

import { api } from "~/trpc/react";

export default function MainPage() {
  const { user, isSignedIn } = useUser();

  if (!isSignedIn) {
    return <Landing />;
  } else {
    const user_email = user?.emailAddresses[0]?.emailAddress;

    if (!user_email) {
      return <div>Error: Unable to fetch user email</div>;
    }

    const { data: id, error, isLoading } = api.user.getUserByEmail.useQuery({ email: user_email });

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
