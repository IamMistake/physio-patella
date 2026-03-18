import { NextResponse } from "next/server";
import { sendBookingNotificationEmail } from "@/lib/email/send-booking-notification";
import { createAdminClient } from "@/lib/supabase/admin";

type AppointmentRequestBody = {
  slotId?: unknown;
  employeeId?: unknown;
  clientName?: unknown;
  email?: unknown;
  phone?: unknown;
  notes?: unknown;
};

function asCleanString(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function asOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : null;
}

export async function POST(request: Request) {
  const body = (await request.json()) as AppointmentRequestBody;

  const slotId = asCleanString(body.slotId);
  const employeeId = asCleanString(body.employeeId);
  const clientName = asCleanString(body.clientName);
  const email = asCleanString(body.email);
  const phone = asOptionalString(body.phone);
  const notes = asOptionalString(body.notes);

  if (!slotId || !employeeId || !clientName || !email) {
    return NextResponse.json(
      { error: "Missing required booking fields." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: reservedSlot, error: reserveError } = await admin
    .from("appointment_slots")
    .update({ is_available: false })
    .eq("id", slotId)
    .eq("is_available", true)
    .select("id, employee_id, starts_at, ends_at")
    .maybeSingle();

  if (reserveError) {
    return NextResponse.json(
      { error: "Could not reserve this slot. Please try again." },
      { status: 500 },
    );
  }

  if (!reservedSlot) {
    return NextResponse.json(
      { error: "This slot was just taken. Please choose another time." },
      { status: 409 },
    );
  }

  if (reservedSlot.employee_id !== employeeId) {
    await admin
      .from("appointment_slots")
      .update({ is_available: true })
      .eq("id", reservedSlot.id);

    return NextResponse.json(
      { error: "Selected employee does not match this slot." },
      { status: 400 },
    );
  }

  const { error: appointmentError } = await admin.from("appointments").insert({
    slot_id: reservedSlot.id,
    employee_id: employeeId,
    client_name: clientName,
    email,
    phone,
    notes,
    status: "pending",
  });

  if (appointmentError) {
    await admin
      .from("appointment_slots")
      .update({ is_available: true })
      .eq("id", reservedSlot.id);

    if (appointmentError.code === "23505") {
      return NextResponse.json(
        { error: "This slot was just taken. Please choose another time." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Could not create appointment. Please try again." },
      { status: 500 },
    );
  }

  const { data: employeeRecord } = await admin
    .from("employees")
    .select("name")
    .eq("id", employeeId)
    .maybeSingle();

  const recipientEmail =
    process.env.BOOKING_NOTIFICATION_EMAIL ?? "jagurinoskini@gmail.com";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  try {
    await sendBookingNotificationEmail({
      recipientEmail,
      siteUrl,
      employeeName: employeeRecord?.name ?? "Physio Patella specialist",
      startsAt: reservedSlot.starts_at,
      endsAt: reservedSlot.ends_at,
      clientName,
      clientEmail: email,
      clientPhone: phone,
      notes,
    });
  } catch (emailError) {
    console.error("Booking email notification failed:", emailError);
  }

  return NextResponse.json({
    success: true,
    slot: {
      id: reservedSlot.id,
      employee_id: reservedSlot.employee_id,
      starts_at: reservedSlot.starts_at,
      ends_at: reservedSlot.ends_at,
    },
  });
}
