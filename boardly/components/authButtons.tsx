'use client';

import { Button } from "@/components/ui/button";
import { LoginLink, RegisterLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

export const AuthButtons = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
    
    // const { getUser, isLoading } = useKindeBrowserClient();

    // function logUserData() {
    //     if (!isLoading && getUser) {
    //         const user = getUser();
    //         if (user) {
    //             console.log("User Data:", user);
    //         } else {
    //             console.log("No user is authenticated.");
    //         }
    //     }
    // }

    // logUserData();

    return (
        <div className="space-x-4 md:block md:w-auto flex items-center justify-between w-full">
            {isAuthenticated ? (
                <Button size="sm" variant="outline" asChild>
                    <LogoutLink>Logout</LogoutLink>
                </Button>
            ) : (
                <>
                    <Button size="sm" variant="outline" asChild>
                        <LoginLink>Login</LoginLink>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                        <RegisterLink>Sign up</RegisterLink>
                    </Button>
                </>
            )}
        </div>
    );
};
