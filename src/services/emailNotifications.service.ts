import { resend } from "../lib/resend.js";
import { formatDateTime } from "../utils/formatDate.js";

export type emailDataConfirm = {
    userEmail: string
    movieTitle: string
    startsAt: Date | string
    seats: string[]
}

export type emailDataCancel = {
    userEmail: string
    totalAmount: number
}

export type EmailJob = emailDataCancel | emailDataConfirm

export const sendEmailSeatConfirmation = async (info: emailDataConfirm) => {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: `${info.userEmail}`,
      subject: `Seat booking confirmation for ${info.movieTitle}`,
      html: `
      <p>You have successfully booked seats (${info.seats}) for ${info.movieTitle}</p><br/>
      <p>The showtime starts at ${formatDateTime(info.startsAt)}. See you there!</p>
      `,
    });
  
    if (error) {
      return console.error({ error });
    }

  console.log('Mail sent');
}

export const sendEmailSeatCancelation = async (info: emailDataCancel) => {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: `${info.userEmail}`,
      subject: `Seat booking cancelation - refund`,
      html: `<p>You have successfully canceled/refunded. Total amount ${info.totalAmount} eur</p><br/>`,
    });
  
    if (error) {
      return console.error({ error });
    }

  console.log('Mail sent');
}