"use client";

import { Button } from "@/components/ui/button";
import { LoginLink, RegisterLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

export const AuthButtons = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
    return (
        <div className="flex items-center space-x-2">
            {isAuthenticated ? (
                <Button size="sm" variant="ghost" asChild className="bg-gray-100 text-black hover:bg-gray-200">
                    <LogoutLink>Logout</LogoutLink>
                </Button>
            ) : (
                <>
                    <Button size="sm" variant="ghost" asChild className="bg-gray-100 text-black hover:bg-gray-200">
                        <LoginLink>Login</LoginLink>
                    </Button>
                    <Button size="sm" variant="ghost" asChild className="bg-gray-100 text-black hover:bg-gray-200">
                        <RegisterLink>Sign up</RegisterLink>
                    </Button>
                </>
            )}
        </div>
    );
};
