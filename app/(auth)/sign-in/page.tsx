import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CredentialsSignInForm from "./credentials-sign-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata ={
    title: 'Sign In'
}

const SignInPage = async (props: {
    searchParams: Promise<{callBackUrl: string}>
}) => {

    const {callBackUrl} = await props.searchParams;
    const session = await auth();

    if(session){
        return redirect(callBackUrl || '/');
    }

    return ( <div className="w-full max-w-md mx-auto">
        <Card>
            <CardHeader className='space-y-4'>
                <Link href="/" className='flex-center'>
                <Image src='/images/logo.svg' width={100} height={100} alt={`${APP_NAME} logo`} priority={true} />
                </Link>
                <CardTitle className="text-center">Sign In</CardTitle>
                <CardDescription className="text-center">
                    Sign in to your account
                </CardDescription>
                <CardContent className="space-y-4">
                    <CredentialsSignInForm />
                </CardContent>
            </CardHeader>
        </Card>
    </div> );<>SignIn</>
}
 
export default SignInPage;