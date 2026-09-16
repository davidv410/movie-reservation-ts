import { Resend } from 'resend';

if(!process.env.RESEND_API_KEY){
    console.log("resend api key empty")
}

export const resend = new Resend(process.env.RESEND_API_KEY);