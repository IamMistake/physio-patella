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

function redirectWithError(message: string, tab?: string) {
  redirect(
    buildAdminRedirectPath({
      tab,
      error: message,
    }),
  );
}

function redirectWithNotice(message: string, tab?: string) {
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
    redirectWithError("Името на вработениот е задолжително.");
  }

  const admin = createAdminClient();

  const { error } = await admin.from("employees").insert({
    name,
    specialization: getOptionalString(formData, "specialization"),
    description: getOptionalString(formData, "description"),
    image_path: getOptionalString(formData, "imagePath"),
    is_active: getCheckbox(formData, "isActive"),
  });

  if (error) {
    console.error("Failed to create employee:", error);
    redirectWithError("Не успеавме да додадеме вработен.");
  }

  revalidateAdminData();
  redirectWithNotice("Вработениот е додаден.");
}

export async function updateEmployeeAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");
  const name = getString(formData, "name");

  if (!id || !name) {
    redirectWithError("Недостасуваат податоци за ажурирање на вработен.");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("employees")
    .update({
      name,
      specialization: getOptionalString(formData, "specialization"),
      description: getOptionalString(formData, "description"),
      image_path: getOptionalString(formData, "imagePath"),
      is_active: getCheckbox(formData, "isActive"),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update employee:", error);
    redirectWithError("Не успеавме да го ажурираме вработениот.");
  }

  revalidateAdminData();
  redirectWithNotice("Вработениот е ажуриран.");
}

export async function deleteEmployeeAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");

  if (!id) {
    redirectWithError("Недостасува ID за бришење на вработен.");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("employees").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete employee:", error);

    if (error.code === "23503") {
      redirectWithError("Не може да се избрише вработениот бидејќи има поврзани термини.");
    }

    redirectWithError("Не успеавме да го избришеме вработениот.");
  }

  revalidateAdminData();
  redirectWithNotice("Вработениот е избришан.");
}

export async function createCertificateAction(formData: FormData) {
  await requireAdminSession();

  const employeeId = getString(formData, "employeeId");
  const title = getString(formData, "title");

  if (!employeeId || !title) {
    redirectWithError("Вработен и наслов на сертификат се задолжителни.");
  }

  const admin = createAdminClient();

  const { error } = await admin.from("employee_certificates").insert({
    employee_id: employeeId,
    title,
    issuer: getOptionalString(formData, "issuer"),
    issued_on: getOptionalString(formData, "issuedOn"),
    file_path: getOptionalString(formData, "filePath"),
    sort_order: getInt(formData, "sortOrder", 0),
  });

  if (error) {
    console.error("Failed to create certificate:", error);
    redirectWithError("Не успеавме да додадеме сертификат.");
  }

  revalidateAdminData();
  redirectWithNotice("Сертификатот е додаден.");
}

export async function updateCertificateAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");
  const title = getString(formData, "title");

  if (!id || !title) {
    redirectWithError("Недостасуваат податоци за ажурирање на сертификат.");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("employee_certificates")
    .update({
      title,
      issuer: getOptionalString(formData, "issuer"),
      issued_on: getOptionalString(formData, "issuedOn"),
      file_path: getOptionalString(formData, "filePath"),
      sort_order: getInt(formData, "sortOrder", 0),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update certificate:", error);
    redirectWithError("Не успеавме да го ажурираме сертификатот.");
  }

  revalidateAdminData();
  redirectWithNotice("Сертификатот е ажуриран.");
}

export async function deleteCertificateAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");

  if (!id) {
    redirectWithError("Недостасува ID за бришење на сертификат.");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("employee_certificates").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete certificate:", error);
    redirectWithError("Не успеавме да го избришеме сертификатот.");
  }

  revalidateAdminData();
  redirectWithNotice("Сертификатот е избришан.");
}

export async function createDocumentAction(formData: FormData) {
  await requireAdminSession();

  const title = getString(formData, "title");

  if (!title) {
    redirectWithError("Насловот на документот е задолжителен.");
  }

  const admin = createAdminClient();

  const { error } = await admin.from("documents").insert({
    title,
    description: getOptionalString(formData, "description"),
    doc_type: getOptionalString(formData, "docType"),
    file_path: getOptionalString(formData, "filePath"),
    sort_order: getInt(formData, "sortOrder", 0),
    is_published: getCheckbox(formData, "isPublished"),
  });

  if (error) {
    console.error("Failed to create document:", error);
    redirectWithError("Не успеавме да додадеме документ.");
  }

  revalidateAdminData();
  redirectWithNotice("Документот е додаден.");
}

export async function updateDocumentAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");
  const title = getString(formData, "title");

  if (!id || !title) {
    redirectWithError("Недостасуваат податоци за ажурирање на документ.");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("documents")
    .update({
      title,
      description: getOptionalString(formData, "description"),
      doc_type: getOptionalString(formData, "docType"),
      file_path: getOptionalString(formData, "filePath"),
      sort_order: getInt(formData, "sortOrder", 0),
      is_published: getCheckbox(formData, "isPublished"),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update document:", error);
    redirectWithError("Не успеавме да го ажурираме документот.");
  }

  revalidateAdminData();
  redirectWithNotice("Документот е ажуриран.");
}

export async function deleteDocumentAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");

  if (!id) {
    redirectWithError("Недостасува ID за бришење на документ.");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("documents").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete document:", error);
    redirectWithError("Не успеавме да го избришеме документот.");
  }

  revalidateAdminData();
  redirectWithNotice("Документот е избришан.");
}

export async function createAppointmentAction(formData: FormData) {
  await requireAdminSession();

  const employeeId = getString(formData, "employeeId");
  const slotId = getString(formData, "slotId");
  const clientName = getString(formData, "clientName");
  const email = getString(formData, "email");
  const status = normalizeStatus(getString(formData, "status"));

  if (!employeeId || !slotId || !clientName || !email) {
    redirectWithError("За рачно креирање термин, сите задолжителни полиња мора да се пополнат.");
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
    redirectWithError("Не успеавме да го резервираме терминот.");
  }

  if (!reservedSlot) {
    redirectWithError("Избраниот термин повеќе не е слободен.");
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
    redirectWithError("Не успеавме да креираме термин.");
  }

  revalidateAdminData();
  redirectWithNotice("Терминот е додаден.");
}

export async function updateAppointmentAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");
  const status = normalizeStatus(getString(formData, "status"));

  if (!id) {
    redirectWithError("Недостасува ID за ажурирање на термин.");
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
    redirectWithError("Не успеавме да го ажурираме терминот.");
  }

  revalidateAdminData();
  redirectWithNotice("Терминот е ажуриран.");
}

export async function deleteAppointmentAction(formData: FormData) {
  await requireAdminSession();

  const id = getString(formData, "id");
  const slotId = getString(formData, "slotId");

  if (!id || !slotId) {
    redirectWithError("Недостасуваат податоци за бришење на термин.");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("appointments").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete appointment:", error);
    redirectWithError("Не успеавме да го избришеме терминот.");
  }

  const { error: slotError } = await admin
    .from("appointment_slots")
    .update({ is_available: true })
    .eq("id", slotId);

  if (slotError) {
    console.error("Failed to reopen slot after appointment delete:", slotError);
  }

  revalidateAdminData();
  redirectWithNotice("Терминот е избришан и слотот е ослободен.");
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
