import {DefaultSession} from 'next-auth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NexAuth from 'next-auth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {JWT} from 'next-auth/jwt';

declare module "next-auth/jwt" {
    interface JWT{
        sub: string;
        role:string;
        name:string;
    }
}

declare module "next-auth"{
    interface Session{
        user: {
            role:string;
        } & DefaultSession["user"];
    }


interface User{
    role: string
}
}