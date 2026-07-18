"use client";

import { FormEvent, useState } from "react";

export function BookingForm() {
  const [sent, setSent] = useState(false);
  function sendRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Booking inquiry — ${data.get("artist") || "ØDIN Management"}`);
    const body = encodeURIComponent(`Name: ${data.get("name")}\nOrganization: ${data.get("organization")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`);
    window.location.href = `mailto:booking@odin.management?subject=${subject}&body=${body}`;
    setSent(true);
  }
  return <form className="booking-form" onSubmit={sendRequest}><div className="field-grid"><label>Name<input name="name" required autoComplete="name" /></label><label>Organization<input name="organization" required /></label></div><div className="field-grid"><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Artist<select name="artist" defaultValue=""><option value="" disabled>Select an artist</option><option>Sandābādo</option><option>Father Atlas</option><option>Palo Xanto</option><option>General roster inquiry</option></select></label></div><label>What are you building?<textarea name="message" required rows={4} placeholder="Date, city, room, and anything useful for us to know." /></label><label className="consent"><input type="checkbox" required /><span>I&apos;m contacting ØDIN about a legitimate booking or management inquiry.</span></label><button className="button button-primary" type="submit">Start the conversation <span aria-hidden="true">→</span></button>{sent ? <p className="form-note">Your mail client is opening with the request details. You can also write directly to booking@odin.management.</p> : <p className="form-note">A human reads every serious inquiry. No automated contracts. No spam.</p>}</form>;
}
