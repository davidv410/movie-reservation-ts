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
    movieTitle: string
    startsAt: Date | string
    seat: string
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

export const sendEmailSeatCancellation = async (info: emailDataCancel) => {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: `${info.userEmail}`,
      subject: `Seat booking cancellation for ${info.movieTitle}`,
      html: `<p>You have cancelled a seat (${info.seat}) for ${info.movieTitle}</p><br/>`,
    });
  
    if (error) {
      return console.error({ error });
    }

  console.log('Mail sent');
}