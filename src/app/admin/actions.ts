"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSessionCookie,
  hasAdminSession,
  setAdminSessionCookie,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_APPOINTMENT_STATUSES = new Set(["pending", "confirmed", "cancelled"]);

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function getInt(formData: FormData, key: string, fallback = 0) {
  const value = Number.parseInt(getString(formData, key), 10);
  return Number.isFinite(value) ? value : fallback;
}

function getCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function getFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

function sanitizeFileName(fileName: string) {
  const normalized = fileName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return normalized || "file";
}

async function uploadPublicFile({
  formData,
  key,
  bucket,
  folder,
}: {
  formData: FormData;
  key: string;
  bucket: string;
  folder: string;
}) {
  const file = getFile(formData, key);

  if (!file) {
    return null;
  }

  const admin = createAdminClient();
  const filePath = `${folder}/${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
  const fileBuffer = await file.arrayBuffer();

  const { error } = await admin.storage.from(bucket).upload(filePath, fileBuffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = admin.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

function buildAdminRedirectPath({
  tab,
  notice,
  error,
}: {
  tab?: string;
  notice?: string;
  error?: string;
}) {
  const params = new URLSearchParams();

  if (tab) {
    params.set("tab", tab);
  }

  if (notice) {
    params.set("notice", notice);
  }

  if (error) {
    params.set("error", error);
  }

  const query = params.toString();
  return query.length > 0 ? `/admin?${query}` : "/admin";
}

function redirectWithError(message: string, tab?: string): never {
  redirect(
    buildAdminRedirectPath({
      tab,
      error: message,
    }),
  );
}

function redirectWithNotice(message: string, tab?: string): never {
  redirect(
    buildAdminRedirectPath({
      tab,
      notice: message,
    }),
  );
}

function revalidateAdminData() {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin");
}

async function requireAdminSession() {
  const loggedIn = await hasAdminSession();

  if (!loggedIn) {
    redirect("/admin/login");
  }
}

function normalizeStatus(input: string) {
  const value = input.toLowerCase();
  return VALID_APPOINTMENT_STATUSES.has(value) ? value : "pending";
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function toIsoDateTime(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function toIsoFromDateAndTime(dateValue: string, timeValue: string) {
  if (!dateValue || !timeValue) {
    return null;
  }

  const normalizedTime = timeValue.length === 5 ? `${timeValue}:00` : timeValue;
  const parsed = new Date(`${dateValue}T${normalizedTime}`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function addMinutesToIso(isoValue: string, minutes: number) {
  const date = new Date(isoValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

function timeValueToMinutes(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);

  if (!match) {
    return Number.NaN;
  }

  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return Number.NaN;
  }

  return hours * 60 + minutes;
}

export async function adminLoginAction(formData: FormData) {
  const password = getString(formData, "password");

  if (!verifyAdminPassword(password)) {
    redirect("/admin/login?error=invalid");
  }

  await setAdminSessionCookie();
  redirect("/admin");
}

export async function adminLogoutAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

export async function createEmployeeAction(formData: FormData) {
  await requireAdminSession();

  const name = getString(formData, "name");

  if (!name) {
    redirectWithError("Името на вработениот е задолжително.", "staff");
  }

  let uploadedImagePath: string | null = null;

  try {
    uploadedImagePath = await uploadPublicFile({
      formData,
      key: "imageFile",
      bucket: "employee-media",
      folder: "employees",
    });
  } catch (uploadError) {
    console.error("Failed to upload employee image:", uploadError);
    redirectWithError("Не успеавме да ја качиме сликата за вработениот.", "staff");
  }

  const admin = createAdminClient();

  const { error } = await admin.from("employees").insert({
    name,
    specialization: getOptionalString(formData, "specialization"),
    description: getOptionalString(formData, "description"),
    image_path: uploadedImagePath ?? getOptionalString(formData, "imagePath"),
    phone_primary: getOptionalString(formData, "phonePrimary"),
    phone_secondary: getOptionalString(formData, "phoneSecondary"),
    is_active: getCheckbox(formData, "isActive"),
  });

  if (error) {
    console.error("Failed to create employee:", error);
    redirectWithError("Не успеавме да додадеме вработен.", "staff");
  }

  revalidateAdminData();
  redirectWithNotice("Вработениот е додаден.", "staff");
}

export async function updateEmployeeAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");
  const name = getString(formData, "name");

  if (!id || !name) {
    redirectWithError("Недостасуваат податоци за ажурирање на вработен.", "staff");
  }

  let uploadedImagePath: string | null = null;

  try {
    uploadedImagePath = await uploadPublicFile({
      formData,
      key: "imageFile",
      bucket: "employee-media",
      folder: "employees",
    });
  } catch (uploadError) {
    console.error("Failed to upload employee image:", uploadError);
    redirectWithError("Не успеавме да ја качиме сликата за вработениот.", "staff");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("employees")
    .update({
      name,
      specialization: getOptionalString(formData, "specialization"),
      description: getOptionalString(formData, "description"),
      image_path: uploadedImagePath ?? getOptionalString(formData, "imagePath"),
      phone_primary: getOptionalString(formData, "phonePrimary"),
      phone_secondary: getOptionalString(formData, "phoneSecondary"),
      is_active: getCheckbox(formData, "isActive"),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update employee:", error);
    redirectWithError("Не успеавме да го ажурираме вработениот.", "staff");
  }

  revalidateAdminData();
  redirectWithNotice("Вработениот е ажуриран.", "staff");
}

export async function deleteEmployeeAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");

  if (!id) {
    redirectWithError("Недостасува ID за бришење на вработен.", "staff");
  }

  const admin = createAdminClient();
  const { data: deletedAppointments, error: deleteAppointmentsError } = await admin
    .from("appointments")
    .delete()
    .eq("employee_id", id)
    .select("id");

  if (deleteAppointmentsError) {
    console.error("Failed to delete related appointments:", deleteAppointmentsError);
    redirectWithError("Не успеавме да ги избришеме поврзаните термини.", "staff");
  }

  const { data: deletedSlots, error: deleteSlotsError } = await admin
    .from("appointment_slots")
    .delete()
    .eq("employee_id", id)
    .select("id");

  if (deleteSlotsError) {
    console.error("Failed to delete related slots:", deleteSlotsError);
    redirectWithError("Не успеавме да ги избришеме слотовите на вработениот.", "staff");
  }

  const { error: deleteEmployeeError } = await admin.from("employees").delete().eq("id", id);

  if (deleteEmployeeError) {
    console.error("Failed to delete employee:", deleteEmployeeError);
    redirectWithError("Не успеавме да го избришеме вработениот.", "staff");
  }

  revalidateAdminData();
  redirectWithNotice(
    `Вработениот е избришан (термини: ${(deletedAppointments ?? []).length}, слотови: ${(deletedSlots ?? []).length}).`,
    "staff",
  );
}

export async function createCertificateAction(formData: FormData) {
  await requireAdminSession();

  const employeeId = getString(formData, "employeeId");
  const title = getString(formData, "title");

  if (!employeeId || !title) {
    redirectWithError("Вработен и наслов на сертификат се задолжителни.", "staff");
  }

  let uploadedFilePath: string | null = null;

  try {
    uploadedFilePath = await uploadPublicFile({
      formData,
      key: "fileUpload",
      bucket: "documents",
      folder: "certificates",
    });
  } catch (uploadError) {
    console.error("Failed to upload certificate file:", uploadError);
    redirectWithError("Не успеавме да го качиме фајлот за сертификат.", "staff");
  }

  const admin = createAdminClient();

  const { error } = await admin.from("employee_certificates").insert({
    employee_id: employeeId,
    title,
    issuer: getOptionalString(formData, "issuer"),
    issued_on: getOptionalString(formData, "issuedOn"),
    file_path: uploadedFilePath ?? getOptionalString(formData, "filePath"),
    sort_order: getInt(formData, "sortOrder", 0),
  });

  if (error) {
    console.error("Failed to create certificate:", error);
    redirectWithError("Не успеавме да додадеме сертификат.", "staff");
  }

  revalidateAdminData();
  redirectWithNotice("Сертификатот е додаден.", "staff");
}

export async function updateCertificateAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");
  const title = getString(formData, "title");

  if (!id || !title) {
    redirectWithError("Недостасуваат податоци за ажурирање на сертификат.", "staff");
  }

  let uploadedFilePath: string | null = null;

  try {
    uploadedFilePath = await uploadPublicFile({
      formData,
      key: "fileUpload",
      bucket: "documents",
      folder: "certificates",
    });
  } catch (uploadError) {
    console.error("Failed to upload certificate file:", uploadError);
    redirectWithError("Не успеавме да го качиме фајлот за сертификат.", "staff");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("employee_certificates")
    .update({
      title,
      issuer: getOptionalString(formData, "issuer"),
      issued_on: getOptionalString(formData, "issuedOn"),
      file_path: uploadedFilePath ?? getOptionalString(formData, "filePath"),
      sort_order: getInt(formData, "sortOrder", 0),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update certificate:", error);
    redirectWithError("Не успеавме да го ажурираме сертификатот.", "staff");
  }

  revalidateAdminData();
  redirectWithNotice("Сертификатот е ажуриран.", "staff");
}

export async function deleteCertificateAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");

  if (!id) {
    redirectWithError("Недостасува ID за бришење на сертификат.", "staff");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("employee_certificates").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete certificate:", error);
    redirectWithError("Не успеавме да го избришеме сертификатот.", "staff");
  }

  revalidateAdminData();
  redirectWithNotice("Сертификатот е избришан.", "staff");
}

export async function createDocumentAction(formData: FormData) {
  await requireAdminSession();

  const title = getString(formData, "title");

  if (!title) {
    redirectWithError("Насловот на документот е задолжителен.", "documents");
  }

  let uploadedFilePath: string | null = null;

  try {
    uploadedFilePath = await uploadPublicFile({
      formData,
      key: "fileUpload",
      bucket: "documents",
      folder: "documents",
    });
  } catch (uploadError) {
    console.error("Failed to upload document file:", uploadError);
    redirectWithError("Не успеавме да го качиме документот.", "documents");
  }

  const admin = createAdminClient();

  const { error } = await admin.from("documents").insert({
    title,
    description: getOptionalString(formData, "description"),
    doc_type: getOptionalString(formData, "docType"),
    file_path: uploadedFilePath ?? getOptionalString(formData, "filePath"),
    sort_order: getInt(formData, "sortOrder", 0),
    is_published: getCheckbox(formData, "isPublished"),
  });

  if (error) {
    console.error("Failed to create document:", error);
    redirectWithError("Не успеавме да додадеме документ.", "documents");
  }

  revalidateAdminData();
  redirectWithNotice("Документот е додаден.", "documents");
}

export async function updateDocumentAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");
  const title = getString(formData, "title");

  if (!id || !title) {
    redirectWithError("Недостасуваат податоци за ажурирање на документ.", "documents");
  }

  let uploadedFilePath: string | null = null;

  try {
    uploadedFilePath = await uploadPublicFile({
      formData,
      key: "fileUpload",
      bucket: "documents",
      folder: "documents",
    });
  } catch (uploadError) {
    console.error("Failed to upload document file:", uploadError);
    redirectWithError("Не успеавме да го качиме документот.", "documents");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("documents")
    .update({
      title,
      description: getOptionalString(formData, "description"),
      doc_type: getOptionalString(formData, "docType"),
      file_path: uploadedFilePath ?? getOptionalString(formData, "filePath"),
      sort_order: getInt(formData, "sortOrder", 0),
      is_published: getCheckbox(formData, "isPublished"),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update document:", error);
    redirectWithError("Не успеавме да го ажурираме документот.", "documents");
  }

  revalidateAdminData();
  redirectWithNotice("Документот е ажуриран.", "documents");
}

export async function deleteDocumentAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");

  if (!id) {
    redirectWithError("Недостасува ID за бришење на документ.", "documents");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("documents").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete document:", error);
    redirectWithError("Не успеавме да го избришеме документот.", "documents");
  }

  revalidateAdminData();
  redirectWithNotice("Документот е избришан.", "documents");
}

export async function createTreatmentAction(formData: FormData) {
  await requireAdminSession();

  const title = getString(formData, "title");
  const providedSlug = getString(formData, "slug");
  const slug = providedSlug || slugify(title);
  const blogPostSlug = getString(formData, "blogPostSlug");

  if (!title || !slug || !blogPostSlug) {
    redirectWithError("Наслов, slug и blog slug се задолжителни.", "treatments");
  }

  let uploadedIconPath: string | null = null;
  let uploadedImagePath: string | null = null;

  try {
    uploadedIconPath = await uploadPublicFile({
      formData,
      key: "iconFile",
      bucket: "treatment-media",
      folder: "icons",
    });
    uploadedImagePath = await uploadPublicFile({
      formData,
      key: "imageFile",
      bucket: "treatment-media",
      folder: "images",
    });
  } catch (uploadError) {
    console.error("Failed to upload treatment files:", uploadError);
    redirectWithError("Не успеавме да ги качиме фајловите за терапијата.", "treatments");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("treatments").insert({
    title,
    slug,
    description: getOptionalString(formData, "description"),
    icon_path: uploadedIconPath ?? getOptionalString(formData, "iconPath"),
    image_path: uploadedImagePath ?? getOptionalString(formData, "imagePath"),
    blog_post_slug: blogPostSlug,
    sort_order: getInt(formData, "sortOrder", 0),
    is_published: getCheckbox(formData, "isPublished"),
  });

  if (error) {
    console.error("Failed to create treatment:", error);
    redirectWithError("Не успеавме да додадеме терапија.", "treatments");
  }

  revalidateAdminData();
  redirectWithNotice("Терапијата е додадена.", "treatments");
}

export async function updateTreatmentAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");
  const title = getString(formData, "title");
  const providedSlug = getString(formData, "slug");
  const slug = providedSlug || slugify(title);
  const blogPostSlug = getString(formData, "blogPostSlug");

  if (!id || !title || !slug || !blogPostSlug) {
    redirectWithError("Недостасуваат податоци за ажурирање терапија.", "treatments");
  }

  let uploadedIconPath: string | null = null;
  let uploadedImagePath: string | null = null;

  try {
    uploadedIconPath = await uploadPublicFile({
      formData,
      key: "iconFile",
      bucket: "treatment-media",
      folder: "icons",
    });
    uploadedImagePath = await uploadPublicFile({
      formData,
      key: "imageFile",
      bucket: "treatment-media",
      folder: "images",
    });
  } catch (uploadError) {
    console.error("Failed to upload treatment files:", uploadError);
    redirectWithError("Не успеавме да ги качиме фајловите за терапијата.", "treatments");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("treatments")
    .update({
      title,
      slug,
      description: getOptionalString(formData, "description"),
      icon_path: uploadedIconPath ?? getOptionalString(formData, "iconPath"),
      image_path: uploadedImagePath ?? getOptionalString(formData, "imagePath"),
      blog_post_slug: blogPostSlug,
      sort_order: getInt(formData, "sortOrder", 0),
      is_published: getCheckbox(formData, "isPublished"),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update treatment:", error);
    redirectWithError("Не успеавме да ја ажурираме терапијата.", "treatments");
  }

  revalidateAdminData();
  redirectWithNotice("Терапијата е ажурирана.", "treatments");
}

export async function deleteTreatmentAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");

  if (!id) {
    redirectWithError("Недостасува ID за бришење терапија.", "treatments");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("treatments").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete treatment:", error);
    redirectWithError("Не успеавме да ја избришеме терапијата.", "treatments");
  }

  revalidateAdminData();
  redirectWithNotice("Терапијата е избришана.", "treatments");
}

export async function createAppointmentAction(formData: FormData) {
  await requireAdminSession();

  const employeeId = getString(formData, "employeeId");
  const slotId = getString(formData, "slotId");
  const clientName = getString(formData, "clientName");
  const email = getString(formData, "email");
  const status = normalizeStatus(getString(formData, "status"));

  if (!employeeId || !slotId || !clientName || !email) {
    redirectWithError("За рачно креирање термин, сите задолжителни полиња мора да се пополнат.", "appointments");
  }

  const admin = createAdminClient();

  const { data: reservedSlot, error: reserveError } = await admin
    .from("appointment_slots")
    .update({ is_available: false })
    .eq("id", slotId)
    .eq("employee_id", employeeId)
    .eq("is_available", true)
    .select("id")
    .maybeSingle();

  if (reserveError) {
    console.error("Failed to reserve slot from admin:", reserveError);
    redirectWithError("Не успеавме да го резервираме терминот.", "appointments");
  }

  if (!reservedSlot) {
    redirectWithError("Избраниот термин повеќе не е слободен.", "appointments");
  }

  const { error: insertError } = await admin.from("appointments").insert({
    slot_id: slotId,
    employee_id: employeeId,
    client_name: clientName,
    email,
    phone: getOptionalString(formData, "phone"),
    notes: getOptionalString(formData, "notes"),
    status,
  });

  if (insertError) {
    await admin
      .from("appointment_slots")
      .update({ is_available: true })
      .eq("id", slotId);

    console.error("Failed to create appointment from admin:", insertError);
    redirectWithError("Не успеавме да креираме термин.", "appointments");
  }

  revalidateAdminData();
  redirectWithNotice("Терминот е додаден.", "appointments");
}

export async function updateAppointmentAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");
  const status = normalizeStatus(getString(formData, "status"));

  if (!id) {
    redirectWithError("Недостасува ID за ажурирање на термин.", "appointments");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("appointments")
    .update({
      client_name: getString(formData, "clientName"),
      email: getString(formData, "email"),
      phone: getOptionalString(formData, "phone"),
      notes: getOptionalString(formData, "notes"),
      status,
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update appointment:", error);
    redirectWithError("Не успеавме да го ажурираме терминот.", "appointments");
  }

  revalidateAdminData();
  redirectWithNotice("Терминот е ажуриран.", "appointments");
}

export async function deleteAppointmentAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");
  const slotId = getString(formData, "slotId");

  if (!id || !slotId) {
    redirectWithError("Недостасуваат податоци за бришење на термин.", "appointments");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("appointments").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete appointment:", error);
    redirectWithError("Не успеавме да го избришеме терминот.", "appointments");
  }

  const { error: slotError } = await admin
    .from("appointment_slots")
    .update({ is_available: true })
    .eq("id", slotId);

  if (slotError) {
    console.error("Failed to reopen slot after appointment delete:", slotError);
  }

  revalidateAdminData();
  redirectWithNotice("Терминот е избришан и слотот е ослободен.", "appointments");
}

export async function createEmployeeSlotsAction(formData: FormData) {
  await requireAdminSession();

  const employeeId = getString(formData, "employeeId");
  const date = getString(formData, "date");
  const startTime = getString(formData, "startTime");
  const endTime = getString(formData, "endTime");

  if (!employeeId || !date || !startTime || !endTime) {
    redirectWithError("Избери вработен, датум и временски опсег.", "staff");
  }

  const startIso = toIsoFromDateAndTime(date, startTime);
  const endIso = toIsoFromDateAndTime(date, endTime);

  const startMinutes = timeValueToMinutes(startTime);
  const endMinutes = timeValueToMinutes(endTime);

  if (
    !Number.isFinite(startMinutes) ||
    !Number.isFinite(endMinutes) ||
    startMinutes % 30 !== 0 ||
    endMinutes % 30 !== 0
  ) {
    redirectWithError("Почетното и крајното време мора да се на 30 минути (пример 10:00, 10:30). Секој слот е 90 минути.", "staff");
  }

  if (!startIso || !endIso) {
    redirectWithError("Невалиден датум или време.", "staff");
  }

  const startDate = new Date(startIso);
  const endDate = new Date(endIso);

  if (endDate.getTime() <= startDate.getTime()) {
    redirectWithError("Крајното време мора да е по почетното.", "staff");
  }

  const admin = createAdminClient();
  const { data: existingSlots, error: existingSlotsError } = await admin
    .from("appointment_slots")
    .select("starts_at")
    .eq("employee_id", employeeId)
    .gte("starts_at", startIso)
    .lt("starts_at", endIso);

  if (existingSlotsError) {
    console.error("Failed to query existing employee slots:", existingSlotsError);
    redirectWithError("Не успеавме да ги провериме постојните слотови.", "staff");
  }

  const existingStartTimes = new Set(
    ((existingSlots ?? []) as { starts_at: string }[]).map((slot) =>
      new Date(slot.starts_at).getTime(),
    ),
  );

  const slotRows: {
    employee_id: string;
    starts_at: string;
    ends_at: string;
    is_available: boolean;
  }[] = [];

  let cursorIso: string | null = startIso;

  while (cursorIso) {
    const cursorDate = new Date(cursorIso);

    if (cursorDate.getTime() >= endDate.getTime()) {
      break;
    }

    const nextIso = addMinutesToIso(cursorIso, 90);

    if (!nextIso) {
      break;
    }

    const nextDate = new Date(nextIso);

    if (nextDate.getTime() > endDate.getTime()) {
      break;
    }

    if (!existingStartTimes.has(cursorDate.getTime())) {
      slotRows.push({
        employee_id: employeeId,
        starts_at: cursorIso,
        ends_at: nextIso,
        is_available: true,
      });
    }

    cursorIso = nextIso;
  }

  if (slotRows.length === 0) {
    redirectWithNotice("Нема нови слотови за додавање (веќе постојат).", "staff");
  }

  const { error } = await admin.from("appointment_slots").insert(slotRows);

  if (error) {
    console.error("Failed to create employee slots:", error);
    redirectWithError("Не успеавме да додадеме слотови.", "staff");
  }

  revalidateAdminData();
  redirectWithNotice(`Додадени се ${slotRows.length} слободни термини.`, "staff");
}

export async function deleteEmployeeSlotAction(formData: FormData) {
  await requireAdminSession();

  const slotId = getString(formData, "slotId");

  if (!slotId) {
    redirectWithError("Недостасува слот за бришење.", "staff");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("appointment_slots").delete().eq("id", slotId);

  if (error) {
    console.error("Failed to delete employee slot:", error);

    if (error.code === "23503") {
      redirectWithError("Овој слот не може да се избрише затоа што има закажан термин.", "staff");
    }

    redirectWithError("Не успеавме да го избришеме слотот.", "staff");
  }

  revalidateAdminData();
  redirectWithNotice("Слотот е избришан.", "staff");
}

export async function createBlogPostAction(formData: FormData) {
  await requireAdminSession();

  const title = getString(formData, "title");
  const providedSlug = getString(formData, "slug");
  const slug = providedSlug || slugify(title);
  const isPublished = getCheckbox(formData, "isPublished");
  const publishedAtInput = getString(formData, "publishedAt");

  if (!title || !slug) {
    redirectWithError("Наслов и URL slug се задолжителни.", "blog");
  }

  const admin = createAdminClient();
  const publishedAt = isPublished
    ? toIsoDateTime(publishedAtInput) ?? new Date().toISOString()
    : null;

  const { error } = await admin.from("blog_posts").insert({
    title,
    slug,
    category: getString(formData, "category") || "general",
    excerpt: getOptionalString(formData, "excerpt"),
    content: getOptionalString(formData, "content"),
    cover_image: getOptionalString(formData, "coverImage"),
    read_time_minutes: getInt(formData, "readTime", 5),
    is_published: isPublished,
    published_at: publishedAt,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Failed to create blog post:", error);

    if (error.code === "23505") {
      redirectWithError("Веќе постои објава со овој slug.", "blog");
    }

    redirectWithError("Не успеавме да креираме блог објава.", "blog");
  }

  revalidateAdminData();
  revalidatePath(`/blog/${slug}`);
  redirectWithNotice("Блог објавата е зачувана.", "blog");
}

export async function updateBlogPostAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");
  const title = getString(formData, "title");
  const providedSlug = getString(formData, "slug");
  const slug = providedSlug || slugify(title);
  const isPublished = getCheckbox(formData, "isPublished");
  const publishedAtInput = getString(formData, "publishedAt");

  if (!id || !title || !slug) {
    redirectWithError("Недостасуваат податоци за ажурирање на блог објавата.", "blog");
  }

  const admin = createAdminClient();
  const { data: existingPost } = await admin
    .from("blog_posts")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const publishedAt = isPublished
    ? toIsoDateTime(publishedAtInput) ?? new Date().toISOString()
    : null;

  const { error } = await admin
    .from("blog_posts")
    .update({
      title,
      slug,
      category: getString(formData, "category") || "general",
      excerpt: getOptionalString(formData, "excerpt"),
      content: getOptionalString(formData, "content"),
      cover_image: getOptionalString(formData, "coverImage"),
      read_time_minutes: getInt(formData, "readTime", 5),
      is_published: isPublished,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update blog post:", error);

    if (error.code === "23505") {
      redirectWithError("Веќе постои објава со овој slug.", "blog");
    }

    redirectWithError("Не успеавме да ја ажурираме блог објавата.", "blog");
  }

  revalidateAdminData();

  if (existingPost?.slug) {
    revalidatePath(`/blog/${existingPost.slug}`);
  }

  revalidatePath(`/blog/${slug}`);
  redirectWithNotice("Блог објавата е ажурирана.", "blog");
}

export async function deleteBlogPostAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");

  if (!id) {
    redirectWithError("Недостасува ID за бришење на блог објава.", "blog");
  }

  const admin = createAdminClient();
  const { data: existingPost } = await admin
    .from("blog_posts")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await admin.from("blog_posts").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete blog post:", error);
    redirectWithError("Не успеавме да ја избришеме блог објавата.", "blog");
  }

  revalidateAdminData();

  if (existingPost?.slug) {
    revalidatePath(`/blog/${existingPost.slug}`);
  }

  redirectWithNotice("Блог објавата е избришана.", "blog");
}
