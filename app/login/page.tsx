import LoginForm from "@/components/LoginForm";
import {Suspense} from "react";

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-md mx-auto">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}