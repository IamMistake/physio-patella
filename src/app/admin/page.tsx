import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import BlogPostsManager from "@/components/admin/blog-posts-manager";
import { hasAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  adminLogoutAction,
  createAppointmentAction,
  createCertificateAction,
  createDocumentAction,
  createEmployeeAction,
  createEmployeeSlotsAction,
  createTreatmentAction,
  deleteEmployeeSlotAction,
  deleteAppointmentAction,
  deleteCertificateAction,
  deleteDocumentAction,
  deleteEmployeeAction,
  deleteTreatmentAction,
  updateAppointmentAction,
  updateCertificateAction,
  updateDocumentAction,
  updateEmployeeAction,
  updateTreatmentAction,
} from "./actions";

type AdminPageProps = {
  searchParams?:
    | {
        notice?: string;
        error?: string;
        tab?: string;
        appointmentsPage?: string;
        staffDate?: string;
        staffEmployeeId?: string;
      }
    | Promise<{
        notice?: string;
        error?: string;
        tab?: string;
        appointmentsPage?: string;
        staffDate?: string;
        staffEmployeeId?: string;
      }>;
};

type EmployeeCertificateRow = {
  id: string;
  title: string | null;
  issuer: string | null;
  issued_on: string | null;
  file_path: string | null;
  sort_order: number | null;
};

type EmployeeRow = {
  id: string;
  name: string | null;
  description: string | null;
  image_path: string | null;
  specialization: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  is_active: boolean;
  employee_certificates: EmployeeCertificateRow[] | null;
  appointment_slots: EmployeeSlotRow[] | null;
};

type SlotAppointmentRelation =
  | {
      id: string;
    }
  | {
      id: string;
    }[]
  | null;

type EmployeeSlotRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  is_available: boolean;
  appointments: SlotAppointmentRelation;
};

type DocumentRow = {
  id: string;
  title: string | null;
  description: string | null;
  doc_type: string | null;
  file_path: string | null;
  sort_order: number;
  is_published: boolean;
};

type AppointmentSlotRelation =
  | {
      starts_at: string;
      ends_at: string;
    }
  | {
      starts_at: string;
      ends_at: string;
    }[]
  | null;

type EmployeeRelation =
  | {
      name: string | null;
    }
  | {
      name: string | null;
    }[]
  | null;

type AppointmentRow = {
  id: string;
  slot_id: string;
  employee_id: string;
  client_name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  employees: EmployeeRelation;
  appointment_slots: AppointmentSlotRelation;
};

type SlotRow = {
  id: string;
  employee_id: string;
  starts_at: string;
  ends_at: string;
};

type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  read_time_minutes: number | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string | null;
};

type TreatmentRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon_path: string | null;
  image_path: string | null;
  blog_post_slug: string;
  sort_order: number;
  is_published: boolean;
};

function formatDateTime(dateTimeIso: string) {
  return new Intl.DateTimeFormat("mk-MK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(dateTimeIso));
}

function formatTimeLabel(dateTimeIso: string) {
  return new Intl.DateTimeFormat("mk-MK", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(dateTimeIso));
}

function toDateKey(dateTimeIso: string) {
  return new Date(dateTimeIso).toISOString().slice(0, 10);
}

function formatDayLabel(dateKey: string) {
  return new Intl.DateTimeFormat("mk-MK", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${dateKey}T00:00:00`));
}

function formatStatusLabel(status: string) {
  if (status === "confirmed") {
    return "Потврден";
  }

  if (status === "cancelled") {
    return "Откажан";
  }

  return "На чекање";
}

function getEmployeeNameFromRelation(relation: EmployeeRelation) {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0]?.name ?? null;
  }

  return relation.name;
}

function getSlotFromRelation(relation: AppointmentSlotRelation) {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

function toDateInputValue(value: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function hasLinkedAppointment(relation: SlotAppointmentRelation) {
  if (!relation) {
    return false;
  }

  if (Array.isArray(relation)) {
    return relation.length > 0;
  }

  return Boolean(relation.id);
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const isLoggedIn = await hasAdminSession();

  if (!isLoggedIn) {
    redirect("/admin/login");
  }

  const resolvedSearchParams =
    searchParams &&
    typeof (searchParams as Promise<{ notice?: string; error?: string; tab?: string; appointmentsPage?: string; staffDate?: string; staffEmployeeId?: string }>).then ===
      "function"
      ? await (searchParams as Promise<{ notice?: string; error?: string; tab?: string; appointmentsPage?: string; staffDate?: string; staffEmployeeId?: string }>)
      : (searchParams as { notice?: string; error?: string; tab?: string; appointmentsPage?: string; staffDate?: string; staffEmployeeId?: string } | undefined);

  const tabParam = resolvedSearchParams?.tab ?? "appointments";
  const activeTab = ["appointments", "staff", "documents", "blog", "treatments"].includes(tabParam)
    ? tabParam
    : "appointments";

  const admin = createAdminClient();

  const [
    employeesResult,
    documentsResult,
    appointmentsResult,
    availableSlotsResult,
    blogPostsResult,
    treatmentsResult,
  ] =
    await Promise.all([
      admin
        .from("employees")
        .select(
          "id, name, description, image_path, specialization, phone_primary, phone_secondary, is_active, employee_certificates(id, title, issuer, issued_on, file_path, sort_order), appointment_slots(id, starts_at, ends_at, is_available, appointments(id))",
        )
        .order("created_at", { ascending: true }),
      admin
        .from("documents")
        .select("id, title, description, doc_type, file_path, sort_order, is_published")
        .order("sort_order", { ascending: true }),
      admin
        .from("appointments")
        .select(
          "id, slot_id, employee_id, client_name, email, phone, notes, status, created_at, employees(name), appointment_slots(starts_at, ends_at)",
        )
        .order("created_at", { ascending: false })
        .limit(1000),
      admin
        .from("appointment_slots")
        .select("id, employee_id, starts_at, ends_at")
        .eq("is_available", true)
        .order("starts_at", { ascending: true })
        .limit(200),
      admin
        .from("blog_posts")
        .select(
          "id, title, slug, category, excerpt, content, cover_image, read_time_minutes, is_published, published_at, created_at",
        )
        .order("created_at", { ascending: false }),
      admin
        .from("treatments")
        .select("id, title, slug, description, icon_path, image_path, blog_post_slug, sort_order, is_published")
        .order("sort_order", { ascending: true }),
    ]);

  const employees = (employeesResult.data as EmployeeRow[] | null) ?? [];
  const documents = (documentsResult.data as DocumentRow[] | null) ?? [];
  const appointments = (appointmentsResult.data as AppointmentRow[] | null) ?? [];
  const availableSlots = (availableSlotsResult.data as SlotRow[] | null) ?? [];
  const blogPosts = (blogPostsResult.data as BlogPostRow[] | null) ?? [];
  const treatments = (treatmentsResult.data as TreatmentRow[] | null) ?? [];

  const queryErrors = [
    employeesResult.error,
    documentsResult.error,
    appointmentsResult.error,
    availableSlotsResult.error,
    blogPostsResult.error,
    treatmentsResult.error,
  ].filter(Boolean);

  const employeeNameById = new Map<string, string>();

  for (const employee of employees) {
    employeeNameById.set(employee.id, employee.name ?? "Без име");
  }

  const requestHeaders = await headers();
  const requestDateHeader = requestHeaders.get("date");
  const nowTimestamp = requestDateHeader ? Date.parse(requestDateHeader) : Number.NaN;
  const todayDateInputValue = Number.isFinite(nowTimestamp)
    ? new Date(nowTimestamp).toISOString().slice(0, 10)
    : "";
  const appointmentStatusFilter = resolvedSearchParams?.appointmentsPage?.startsWith("past:")
    ? "past"
    : resolvedSearchParams?.appointmentsPage?.startsWith("all:")
      ? "all"
      : "upcoming";
  const currentPageFromQuery = Number.parseInt(
    (resolvedSearchParams?.appointmentsPage ?? "upcoming:1").split(":")[1] ?? "1",
    10,
  );
  const currentAppointmentsPage = Number.isFinite(currentPageFromQuery) && currentPageFromQuery > 0
    ? currentPageFromQuery
    : 1;
  const appointmentsPageSize = 12;
  const upcomingAppointments: AppointmentRow[] = [];
  const pastAppointments: AppointmentRow[] = [];

  for (const appointment of appointments) {
    const slot = getSlotFromRelation(appointment.appointment_slots);
    const slotEndTimestamp = slot ? new Date(slot.ends_at).getTime() : Number.NaN;

    if (Number.isFinite(slotEndTimestamp) && slotEndTimestamp < nowTimestamp) {
      pastAppointments.push(appointment);
    } else {
      upcomingAppointments.push(appointment);
    }
  }

  const getSlotStartTimestamp = (appointment: AppointmentRow) => {
    const slot = getSlotFromRelation(appointment.appointment_slots);
    return slot ? new Date(slot.starts_at).getTime() : Number.NaN;
  };

  upcomingAppointments.sort((first, second) => {
    return getSlotStartTimestamp(first) - getSlotStartTimestamp(second);
  });

  pastAppointments.sort((first, second) => {
    return getSlotStartTimestamp(second) - getSlotStartTimestamp(first);
  });
  const filteredAppointments =
    appointmentStatusFilter === "past"
      ? pastAppointments
      : appointmentStatusFilter === "all"
        ? [...upcomingAppointments, ...pastAppointments]
        : upcomingAppointments;
  const appointmentsByEmployeeId = new Map<string, AppointmentRow[]>();

  for (const appointment of appointments) {
    const existing = appointmentsByEmployeeId.get(appointment.employee_id) ?? [];
    existing.push(appointment);
    appointmentsByEmployeeId.set(appointment.employee_id, existing);
  }

  const totalAppointmentsPages = Math.max(1, Math.ceil(filteredAppointments.length / appointmentsPageSize));
  const safeAppointmentsPage = Math.min(currentAppointmentsPage, totalAppointmentsPages);
  const appointmentsPageStart = (safeAppointmentsPage - 1) * appointmentsPageSize;
  const appointmentsPageItems = filteredAppointments.slice(
    appointmentsPageStart,
    appointmentsPageStart + appointmentsPageSize,
  );

  return (
    <Box
      sx={{
        py: { xs: 4, md: 6 },
        bgcolor: "background.default",
        "& .MuiTextField-root .MuiInputBase-root": {
          minHeight: 50,
          borderRadius: 2,
          alignItems: "center",
        },
        "& .MuiTextField-root .MuiInputBase-root.MuiInputBase-multiline": {
          minHeight: "unset",
          alignItems: "flex-start",
        },
        "& .MuiTextField-root .MuiInputBase-input": {
          fontSize: "0.98rem",
          lineHeight: 1.35,
        },
        "& .MuiTextField-root .MuiInputBase-inputMultiline": {
          lineHeight: 1.5,
        },
        "& .MuiTextField-root .MuiInputLabel-root": {
          fontSize: "0.92rem",
        },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Paper sx={{ p: { xs: 2.5, md: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Stack spacing={0.5}>
                <Typography sx={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "primary.main" }}>
                  Администрација
                </Typography>
                <Typography variant="h1" sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "1.8rem", md: "2.3rem" } }}>
                  Админ панел
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
                  Управување со термини, вработени, сертификати и документи.
                </Typography>
              </Stack>

              <Box component="form" action={adminLogoutAction}>
                <Button type="submit" variant="outlined" color="inherit" sx={{ minHeight: 44 }}>
                  Одјави се
                </Button>
              </Box>
            </Stack>
          </Paper>

          {resolvedSearchParams?.notice ? <Alert severity="success">{resolvedSearchParams.notice}</Alert> : null}
          {resolvedSearchParams?.error ? <Alert severity="error">{resolvedSearchParams.error}</Alert> : null}
          {queryErrors.length > 0 ? (
            <Alert severity="error">Има проблем при вчитување на дел од податоците. Провери Supabase конфигурација.</Alert>
          ) : null}

          <Paper sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2.5, p: 0.5 }}>
            <Tabs
              value={activeTab}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Админ табови"
            >
              <Tab component="a" href="/admin?tab=appointments" value="appointments" label="Термини" />
              <Tab component="a" href="/admin?tab=staff" value="staff" label="Вработени" />
              <Tab component="a" href="/admin?tab=treatments" value="treatments" label="Терапии" />
              <Tab component="a" href="/admin?tab=documents" value="documents" label="Документи" />
              <Tab component="a" href="/admin?tab=blog" value="blog" label="Blog posts" />
            </Tabs>
          </Paper>

          {activeTab === "appointments" ? (
            <Paper sx={{ p: { xs: 2.5, md: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
            <Stack spacing={2.2}>
              <Typography variant="h2" sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "1.4rem", md: "1.8rem" } }}>
                Термини
              </Typography>

              <Typography sx={{ fontSize: "0.9rem", color: "text.secondary" }}>
                Додади нов термин рачно преку слободен слот.
              </Typography>

              <Box component="form" action={createAppointmentAction}>
                <Stack spacing={1.5}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                      gap: 1.5,
                    }}
                  >
                    <TextField select name="employeeId" label="Вработен" required fullWidth defaultValue="">
                      <MenuItem value="" disabled>
                        Избери вработен
                      </MenuItem>
                      {employees.map((employee) => (
                        <MenuItem key={employee.id} value={employee.id}>
                          {employee.name ?? "Без име"}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField select name="slotId" label="Слободен термин" required fullWidth defaultValue="">
                      <MenuItem value="" disabled>
                        Избери слот
                      </MenuItem>
                      {availableSlots.map((slot) => (
                        <MenuItem key={slot.id} value={slot.id}>
                          {formatDateTime(slot.starts_at)} - {formatDateTime(slot.ends_at)} ({employeeNameById.get(slot.employee_id) ?? "Вработен"})
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField name="clientName" label="Име и презиме" required fullWidth />
                    <TextField name="email" label="Е-пошта" required type="email" fullWidth />
                    <TextField name="phone" label="Телефон" fullWidth />

                    <TextField select name="status" label="Статус" required fullWidth defaultValue="pending">
                      <MenuItem value="pending">На чекање</MenuItem>
                      <MenuItem value="confirmed">Потврден</MenuItem>
                      <MenuItem value="cancelled">Откажан</MenuItem>
                    </TextField>

                    <TextField
                      name="notes"
                      label="Забелешки"
                      multiline
                      minRows={2}
                      fullWidth
                      sx={{ gridColumn: { xs: "1 / -1", md: "1 / -1" } }}
                    />
                  </Box>

                  <Button type="submit" variant="contained" sx={{ width: "fit-content", minHeight: 44 }}>
                    Додади термин
                  </Button>
                </Stack>
              </Box>

              <Divider />

              <Stack spacing={1.5}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }}>
                  <Typography sx={{ fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "text.secondary" }}>
                    Табела со термини
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      component="a"
                      href="/admin?tab=appointments&appointmentsPage=upcoming:1"
                      variant={appointmentStatusFilter === "upcoming" ? "contained" : "outlined"}
                      size="small"
                    >
                      Претстојни
                    </Button>
                    <Button
                      component="a"
                      href="/admin?tab=appointments&appointmentsPage=past:1"
                      variant={appointmentStatusFilter === "past" ? "contained" : "outlined"}
                      size="small"
                    >
                      Поминати
                    </Button>
                    <Button
                      component="a"
                      href="/admin?tab=appointments&appointmentsPage=all:1"
                      variant={appointmentStatusFilter === "all" ? "contained" : "outlined"}
                      size="small"
                    >
                      Сите
                    </Button>
                  </Stack>
                </Stack>

                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Датум и време</TableCell>
                        <TableCell>Вработен</TableCell>
                        <TableCell>Клиент</TableCell>
                        <TableCell>Контакт</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell align="right">Акции</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {appointmentsPageItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <Typography sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
                              Нема термини за избраниот филтер.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        appointmentsPageItems.map((appointment) => {
                          const slot = getSlotFromRelation(appointment.appointment_slots);
                          const employeeName = getEmployeeNameFromRelation(appointment.employees) ?? "Вработен";

                          return (
                            <TableRow key={appointment.id} hover>
                              <TableCell sx={{ minWidth: 190 }}>
                                {slot
                                  ? `${formatDateTime(slot.starts_at)} - ${formatTimeLabel(slot.ends_at)}`
                                  : "Нема слот"}
                              </TableCell>
                              <TableCell sx={{ minWidth: 140 }}>{employeeName}</TableCell>
                              <TableCell sx={{ minWidth: 150 }}>{appointment.client_name}</TableCell>
                              <TableCell sx={{ minWidth: 190 }}>
                                <Stack spacing={0.2}>
                                  <Typography sx={{ fontSize: "0.8rem" }}>{appointment.email}</Typography>
                                  {appointment.phone ? (
                                    <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                                      {appointment.phone}
                                    </Typography>
                                  ) : null}
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Box component="form" action={updateAppointmentAction} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                  <input type="hidden" name="id" value={appointment.id} />
                                  <input type="hidden" name="clientName" value={appointment.client_name} />
                                  <input type="hidden" name="email" value={appointment.email} />
                                  <input type="hidden" name="phone" value={appointment.phone ?? ""} />
                                  <input type="hidden" name="notes" value={appointment.notes ?? ""} />
                                  <TextField select name="status" size="small" defaultValue={appointment.status} sx={{ minWidth: 130 }}>
                                    <MenuItem value="pending">На чекање</MenuItem>
                                    <MenuItem value="confirmed">Потврден</MenuItem>
                                    <MenuItem value="cancelled">Откажан</MenuItem>
                                  </TextField>
                                  <Button type="submit" variant="text" size="small">Сочувај</Button>
                                </Box>
                              </TableCell>
                              <TableCell align="right" sx={{ minWidth: 120 }}>
                                <Box component="form" action={deleteAppointmentAction} sx={{ display: "inline-flex" }}>
                                  <input type="hidden" name="id" value={appointment.id} />
                                  <input type="hidden" name="slotId" value={appointment.slot_id} />
                                  <Button type="submit" variant="outlined" color="error" size="small">
                                    Избриши
                                  </Button>
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
                  <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                    Прикажани {appointmentsPageItems.length} од {filteredAppointments.length} термини
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      component="a"
                      href={`/admin?tab=appointments&appointmentsPage=${appointmentStatusFilter}:${Math.max(1, safeAppointmentsPage - 1)}`}
                      variant="outlined"
                      size="small"
                      disabled={safeAppointmentsPage <= 1}
                    >
                      Претходна
                    </Button>
                    <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", alignSelf: "center" }}>
                      Страна {safeAppointmentsPage} / {totalAppointmentsPages}
                    </Typography>
                    <Button
                      component="a"
                      href={`/admin?tab=appointments&appointmentsPage=${appointmentStatusFilter}:${Math.min(totalAppointmentsPages, safeAppointmentsPage + 1)}`}
                      variant="outlined"
                      size="small"
                      disabled={safeAppointmentsPage >= totalAppointmentsPages}
                    >
                      Следна
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
            </Paper>
          ) : null}

          {activeTab === "staff" ? (
            <Paper sx={{ p: { xs: 2.5, md: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
            <Stack spacing={2.2}>
              <Typography variant="h2" sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "1.4rem", md: "1.8rem" } }}>
                Вработени и сертификати
              </Typography>

              <Box component="form" action={createEmployeeAction}>
                <Stack spacing={1.5}>
                  <Typography sx={{ fontWeight: 600 }}>Додади нов вработен</Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                      gap: 1.5,
                    }}
                  >
                    <TextField name="name" label="Име и презиме" required fullWidth />
                    <TextField name="specialization" label="Специјализација" fullWidth />
                    <TextField name="imagePath" label="Патека до слика (пр. employees/ime.jpg)" fullWidth />
                    <Button component="label" variant="outlined" sx={{ minHeight: 50, justifyContent: "flex-start" }}>
                      Upload image
                      <input hidden type="file" name="imageFile" accept="image/*" />
                    </Button>
                    <TextField name="phonePrimary" label="Телефон" fullWidth />
                    <TextField name="phoneSecondary" label="Бизнис телефон" fullWidth />
                    <FormControlLabel
                      control={<Checkbox name="isActive" defaultChecked />}
                      label="Активен вработен"
                    />
                    <TextField
                      name="description"
                      label="Опис"
                      multiline
                      minRows={2}
                      fullWidth
                      sx={{ gridColumn: { xs: "1 / -1", md: "1 / -1" } }}
                    />
                  </Box>
                  <Button type="submit" variant="contained" sx={{ width: "fit-content", minHeight: 44 }}>
                    Додади вработен
                  </Button>
                </Stack>
              </Box>

              <Divider />

              <Stack spacing={2}>
                {employees.map((employee) => {
                  const certificates = (employee.employee_certificates ?? []).slice().sort((first, second) => {
                    return (first.sort_order ?? 0) - (second.sort_order ?? 0);
                  });

                  const employeeSlots = (employee.appointment_slots ?? [])
                    .slice()
                    .sort((first, second) => {
                      return new Date(first.starts_at).getTime() - new Date(second.starts_at).getTime();
                    });

                  const upcomingEmployeeSlots = employeeSlots.filter((slot) => {
                    const endsAtTimestamp = new Date(slot.ends_at).getTime();
                    return Number.isFinite(nowTimestamp) ? endsAtTimestamp >= nowTimestamp : true;
                  });

                  const slotsByDate = upcomingEmployeeSlots.reduce<Record<string, EmployeeSlotRow[]>>((accumulator, slot) => {
                    const dateKey = toDateKey(slot.starts_at);

                    if (!accumulator[dateKey]) {
                      accumulator[dateKey] = [];
                    }

                    accumulator[dateKey].push(slot);
                    return accumulator;
                  }, {});

                  const availableDateKeys = Object.keys(slotsByDate).sort();
                  const selectedDateFromQuery =
                    resolvedSearchParams?.staffEmployeeId === employee.id ? resolvedSearchParams?.staffDate ?? "all" : "all";
                  const activeDateFilter =
                    selectedDateFromQuery !== "all" && availableDateKeys.includes(selectedDateFromQuery)
                      ? selectedDateFromQuery
                      : "all";
                  const filteredSlots =
                    activeDateFilter === "all" ? upcomingEmployeeSlots : (slotsByDate[activeDateFilter] ?? []);

                  const employeeAppointments = (appointmentsByEmployeeId.get(employee.id) ?? [])
                    .slice()
                    .sort((first, second) => {
                      return getSlotStartTimestamp(second) - getSlotStartTimestamp(first);
                    });

                  return (
                    <Paper key={employee.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Stack spacing={1.5}>
                        <Box component="form" action={updateEmployeeAction}>
                          <Stack spacing={1.2}>
                            <input type="hidden" name="id" value={employee.id} />
                            <Typography sx={{ fontWeight: 600 }}>{employee.name ?? "Без име"}</Typography>
                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                                gap: 1.2,
                              }}
                            >
                              <TextField name="name" label="Име и презиме" defaultValue={employee.name ?? ""} required fullWidth />
                              <TextField
                                name="specialization"
                                label="Специјализација"
                                defaultValue={employee.specialization ?? ""}
                                fullWidth
                              />
                              <TextField
                                name="imagePath"
                                label="Патека до слика"
                                defaultValue={employee.image_path ?? ""}
                                fullWidth
                              />
                              <Button component="label" variant="outlined" sx={{ minHeight: 50, justifyContent: "flex-start" }}>
                                Upload image
                                <input hidden type="file" name="imageFile" accept="image/*" />
                              </Button>
                              <TextField
                                name="phonePrimary"
                                label="Телефон"
                                defaultValue={employee.phone_primary ?? ""}
                                fullWidth
                              />
                              <TextField
                                name="phoneSecondary"
                                label="Бизнис телефон"
                                defaultValue={employee.phone_secondary ?? ""}
                                fullWidth
                              />
                              <FormControlLabel
                                control={<Checkbox name="isActive" defaultChecked={employee.is_active} />}
                                label="Активен вработен"
                              />
                              <TextField
                                name="description"
                                label="Опис"
                                defaultValue={employee.description ?? ""}
                                multiline
                                minRows={2}
                                fullWidth
                                sx={{ gridColumn: { xs: "1 / -1", md: "1 / -1" } }}
                              />
                            </Box>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                              <Button type="submit" variant="contained" sx={{ minHeight: 44 }}>
                                Ажурирај вработен
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>

                        <Box component="form" action={deleteEmployeeAction}>
                          <input type="hidden" name="id" value={employee.id} />
                          <Button type="submit" variant="outlined" color="error" sx={{ minHeight: 44 }}>
                            Избриши вработен
                          </Button>
                        </Box>

                        <Divider />

                        <Stack spacing={1.2}>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                            Слободни термини
                          </Typography>

                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              borderRadius: 1.5,
                              bgcolor:
                                "color-mix(in srgb, var(--mui-palette-primary-main) 5%, var(--mui-palette-background-paper))",
                            }}
                          >
                            <Box component="form" action={createEmployeeSlotsAction}>
                              <Stack spacing={1.2}>
                                <input type="hidden" name="employeeId" value={employee.id} />
                                <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                                  Додади повеќе 90-минутни слотови со еден клик.
                                </Typography>
                                <Box
                                  sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                                    gap: 1,
                                  }}
                                >
                                  <TextField
                                    name="date"
                                    label="Датум"
                                    type="date"
                                    defaultValue={todayDateInputValue}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    fullWidth
                                  />
                                  <TextField
                                    name="startTime"
                                    label="Од"
                                    type="time"
                                    defaultValue="08:00"
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ step: 1800 }}
                                    required
                                    fullWidth
                                  />
                                  <TextField
                                    name="endTime"
                                    label="До"
                                    type="time"
                                    defaultValue="16:00"
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ step: 1800 }}
                                    required
                                    fullWidth
                                  />
                                </Box>
                                <Button type="submit" variant="contained" sx={{ width: "fit-content", minHeight: 44 }}>
                                  Додади слотови
                                </Button>
                              </Stack>
                            </Box>
                          </Paper>

                          <Stack spacing={1}>
                            {upcomingEmployeeSlots.length === 0 ? (
                              <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                                Нема идни слотови.
                              </Typography>
                            ) : (
                              <Stack spacing={1.1}>
                                <Stack direction="row" spacing={0.7} sx={{ overflowX: "auto", pb: 0.3 }}>
                                  <Chip
                                    component="a"
                                    clickable
                                    href={`/admin?tab=staff&staffEmployeeId=${employee.id}&staffDate=all`}
                                    label={`Сите денови (${upcomingEmployeeSlots.length})`}
                                    color={activeDateFilter === "all" ? "primary" : "default"}
                                    variant={activeDateFilter === "all" ? "filled" : "outlined"}
                                    sx={{ borderRadius: 1.2 }}
                                  />
                                  {availableDateKeys.map((dateKey) => (
                                    <Chip
                                      key={dateKey}
                                      component="a"
                                      clickable
                                      href={`/admin?tab=staff&staffEmployeeId=${employee.id}&staffDate=${dateKey}`}
                                      label={`${formatDayLabel(dateKey)} (${slotsByDate[dateKey]?.length ?? 0})`}
                                      color={activeDateFilter === dateKey ? "primary" : "default"}
                                      variant={activeDateFilter === dateKey ? "filled" : "outlined"}
                                      sx={{ borderRadius: 1.2 }}
                                    />
                                  ))}
                                </Stack>

                                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Ден</TableCell>
                                        <TableCell>Од</TableCell>
                                        <TableCell>До</TableCell>
                                        <TableCell>Статус</TableCell>
                                        <TableCell align="right">Акции</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {filteredSlots.length === 0 ? (
                                        <TableRow>
                                          <TableCell colSpan={5}>
                                            <Typography sx={{ fontSize: "0.82rem", color: "text.secondary", textAlign: "center", py: 1.5 }}>
                                              Нема слотови за избраниот ден.
                                            </Typography>
                                          </TableCell>
                                        </TableRow>
                                      ) : (
                                        filteredSlots.map((slot) => {
                                          const isBooked = hasLinkedAppointment(slot.appointments) || !slot.is_available;

                                          return (
                                            <TableRow key={slot.id} hover>
                                              <TableCell sx={{ minWidth: 145 }}>{formatDayLabel(toDateKey(slot.starts_at))}</TableCell>
                                              <TableCell sx={{ minWidth: 80 }}>{formatTimeLabel(slot.starts_at)}</TableCell>
                                              <TableCell sx={{ minWidth: 80 }}>{formatTimeLabel(slot.ends_at)}</TableCell>
                                              <TableCell sx={{ minWidth: 150 }}>
                                                <Typography sx={{ fontSize: "0.78rem", color: isBooked ? "warning.main" : "success.main", fontWeight: 600 }}>
                                                  {isBooked ? "Резервиран термин" : "Слободен термин"}
                                                </Typography>
                                              </TableCell>
                                              <TableCell align="right" sx={{ minWidth: 130 }}>
                                                <Box component="form" action={deleteEmployeeSlotAction} sx={{ display: "inline-flex" }}>
                                                  <input type="hidden" name="slotId" value={slot.id} />
                                                  <Button
                                                    type="submit"
                                                    variant="outlined"
                                                    color="error"
                                                    disabled={isBooked}
                                                    size="small"
                                                    sx={{ minHeight: 36 }}
                                                  >
                                                    Избриши слот
                                                  </Button>
                                                </Box>
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })
                                      )}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Stack>
                            )}
                          </Stack>
                        </Stack>

                        <Stack spacing={1.1}>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                            Термини за {employee.name ?? "вработениот"}
                          </Typography>

                          {employeeAppointments.length === 0 ? (
                            <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                              Нема креирани термини за овој вработен.
                            </Typography>
                          ) : (
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Датум</TableCell>
                                    <TableCell>Клиент</TableCell>
                                    <TableCell>Контакт</TableCell>
                                    <TableCell>Статус</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {employeeAppointments.slice(0, 10).map((appointment) => {
                                    const slot = getSlotFromRelation(appointment.appointment_slots);

                                    return (
                                      <TableRow key={appointment.id} hover>
                                        <TableCell sx={{ minWidth: 180 }}>
                                          {slot ? `${formatDateTime(slot.starts_at)} - ${formatTimeLabel(slot.ends_at)}` : "Нема слот"}
                                        </TableCell>
                                        <TableCell sx={{ minWidth: 140 }}>{appointment.client_name}</TableCell>
                                        <TableCell sx={{ minWidth: 180 }}>
                                          <Stack spacing={0.2}>
                                            <Typography sx={{ fontSize: "0.8rem" }}>{appointment.email}</Typography>
                                            {appointment.phone ? (
                                              <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                                                {appointment.phone}
                                              </Typography>
                                            ) : null}
                                          </Stack>
                                        </TableCell>
                                        <TableCell sx={{ minWidth: 120 }}>{formatStatusLabel(appointment.status)}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          )}
                        </Stack>

                        <Accordion
                          disableGutters
                          elevation={0}
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1.5,
                            overflow: "hidden",
                            "&:before": { display: "none" },
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreRoundedIcon />}
                            sx={{
                              px: 1.5,
                              minHeight: 56,
                              bgcolor:
                                "color-mix(in srgb, var(--mui-palette-primary-main) 5%, var(--mui-palette-background-paper))",
                              "& .MuiAccordionSummary-content": {
                                my: 0.5,
                              },
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%", pr: 1 }}>
                              <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Сертификати</Typography>
                              <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                                {certificates.length} вкупно
                              </Typography>
                            </Stack>
                          </AccordionSummary>

                          <AccordionDetails sx={{ px: 1.5, pb: 1.5 }}>
                            <Stack spacing={1}>
                              {certificates.length === 0 ? (
                                <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                                  Нема додадени сертификати.
                                </Typography>
                              ) : (
                                certificates.map((certificate) => (
                                  <Paper key={certificate.id} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
                                    <Stack spacing={1}>
                                      <Box component="form" action={updateCertificateAction}>
                                        <Stack spacing={1}>
                                          <input type="hidden" name="id" value={certificate.id} />
                                          <Box
                                            sx={{
                                              display: "grid",
                                              gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                                              gap: 1,
                                            }}
                                          >
                                            <TextField
                                              name="title"
                                              label="Наслов"
                                              defaultValue={certificate.title ?? ""}
                                              required
                                              InputLabelProps={{ shrink: true }}
                                              fullWidth
                                            />
                                            <TextField
                                              name="issuer"
                                              label="Издавач"
                                              defaultValue={certificate.issuer ?? ""}
                                              InputLabelProps={{ shrink: true }}
                                              fullWidth
                                            />
                                            <TextField
                                              name="issuedOn"
                                              label="Датум"
                                              type="date"
                                              defaultValue={toDateInputValue(certificate.issued_on)}
                                              InputLabelProps={{ shrink: true }}
                                              fullWidth
                                            />
                                            <TextField
                                              name="filePath"
                                              label="Патека до фајл"
                                              defaultValue={certificate.file_path ?? ""}
                                              InputLabelProps={{ shrink: true }}
                                              fullWidth
                                              sx={{ gridColumn: { xs: "1 / -1", md: "1 / 3" } }}
                                            />
                                            <Button component="label" variant="outlined" sx={{ minHeight: 50, justifyContent: "flex-start" }}>
                                              Upload file
                                              <input hidden type="file" name="fileUpload" accept=".pdf,image/*" />
                                            </Button>
                                            <TextField
                                              name="sortOrder"
                                              label="Редослед"
                                              type="number"
                                              defaultValue={certificate.sort_order ?? 0}
                                              InputLabelProps={{ shrink: true }}
                                              fullWidth
                                            />
                                          </Box>
                                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                            <Button type="submit" variant="contained" sx={{ minHeight: 44 }}>
                                              Ажурирај сертификат
                                            </Button>
                                          </Stack>
                                        </Stack>
                                      </Box>

                                      <Box component="form" action={deleteCertificateAction}>
                                        <input type="hidden" name="id" value={certificate.id} />
                                        <Button type="submit" variant="outlined" color="error" sx={{ minHeight: 44 }}>
                                          Избриши сертификат
                                        </Button>
                                      </Box>
                                    </Stack>
                                  </Paper>
                                ))
                              )}

                              <Box component="form" action={createCertificateAction}>
                                <Stack spacing={1}>
                                  <input type="hidden" name="employeeId" value={employee.id} />
                                  <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                                    Додади нов сертификат за {employee.name ?? "овој вработен"}
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "grid",
                                      gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                                      gap: 1,
                                    }}
                                  >
                                    <TextField name="title" label="Наслов" required fullWidth />
                                    <TextField name="issuer" label="Издавач" fullWidth />
                                    <TextField name="issuedOn" label="Датум" type="date" InputLabelProps={{ shrink: true }} fullWidth />
                                    <TextField name="filePath" label="Патека до фајл" fullWidth sx={{ gridColumn: { xs: "1 / -1", md: "1 / 3" } }} />
                                    <Button component="label" variant="outlined" sx={{ minHeight: 50, justifyContent: "flex-start" }}>
                                      Upload file
                                      <input hidden type="file" name="fileUpload" accept=".pdf,image/*" />
                                    </Button>
                                    <TextField name="sortOrder" label="Редослед" type="number" defaultValue={0} fullWidth />
                                  </Box>
                                  <Button type="submit" variant="outlined" sx={{ width: "fit-content", minHeight: 44 }}>
                                    Додади сертификат
                                  </Button>
                                </Stack>
                              </Box>
                            </Stack>
                          </AccordionDetails>
                        </Accordion>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </Stack>
            </Paper>
          ) : null}

          {activeTab === "treatments" ? (
            <Paper sx={{ p: { xs: 2.5, md: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
              <Stack spacing={2.2}>
                <Typography variant="h2" sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "1.4rem", md: "1.8rem" } }}>
                  Терапии
                </Typography>

                <Box component="form" action={createTreatmentAction}>
                  <Stack spacing={1.5}>
                    <Typography sx={{ fontWeight: 600 }}>Додади нова терапија</Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
                      <TextField name="title" label="Наслов" required fullWidth />
                      <TextField name="slug" label="Slug" required fullWidth />
                      <TextField name="blogPostSlug" label="Blog post slug" required fullWidth />
                      <TextField name="sortOrder" label="Редослед" type="number" defaultValue={0} fullWidth />
                      <TextField name="iconPath" label="Патека до икона" fullWidth />
                      <TextField name="imagePath" label="Патека до слика" fullWidth />
                      <Button component="label" variant="outlined" sx={{ minHeight: 50, justifyContent: "flex-start" }}>
                        Upload icon
                        <input hidden type="file" name="iconFile" accept="image/*" />
                      </Button>
                      <Button component="label" variant="outlined" sx={{ minHeight: 50, justifyContent: "flex-start" }}>
                        Upload image
                        <input hidden type="file" name="imageFile" accept="image/*" />
                      </Button>
                      <FormControlLabel control={<Checkbox name="isPublished" defaultChecked />} label="Објавена терапија" />
                      <TextField
                        name="description"
                        label="Опис"
                        multiline
                        minRows={2}
                        fullWidth
                        sx={{ gridColumn: { xs: "1 / -1", md: "1 / -1" } }}
                      />
                    </Box>
                    <Button type="submit" variant="contained" sx={{ width: "fit-content", minHeight: 44 }}>
                      Додади терапија
                    </Button>
                  </Stack>
                </Box>

                <Divider />

                <Stack spacing={1.5}>
                  {treatments.length === 0 ? (
                    <Typography sx={{ color: "text.secondary" }}>Нема терапии.</Typography>
                  ) : (
                    treatments.map((treatment) => (
                      <Paper key={treatment.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Stack spacing={1.2}>
                          <Box component="form" action={updateTreatmentAction}>
                            <Stack spacing={1.2}>
                              <input type="hidden" name="id" value={treatment.id} />
                              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 1.2 }}>
                                <TextField name="title" label="Наслов" defaultValue={treatment.title} required fullWidth />
                                <TextField name="slug" label="Slug" defaultValue={treatment.slug} required fullWidth />
                                <TextField name="blogPostSlug" label="Blog post slug" defaultValue={treatment.blog_post_slug} required fullWidth />
                                <TextField name="sortOrder" label="Редослед" type="number" defaultValue={treatment.sort_order} fullWidth />
                                <TextField name="iconPath" label="Патека до икона" defaultValue={treatment.icon_path ?? ""} fullWidth />
                                <TextField name="imagePath" label="Патека до слика" defaultValue={treatment.image_path ?? ""} fullWidth />
                                <Button component="label" variant="outlined" sx={{ minHeight: 50, justifyContent: "flex-start" }}>
                                  Upload icon
                                  <input hidden type="file" name="iconFile" accept="image/*" />
                                </Button>
                                <Button component="label" variant="outlined" sx={{ minHeight: 50, justifyContent: "flex-start" }}>
                                  Upload image
                                  <input hidden type="file" name="imageFile" accept="image/*" />
                                </Button>
                                <FormControlLabel control={<Checkbox name="isPublished" defaultChecked={treatment.is_published} />} label="Објавена терапија" />
                                <TextField
                                  name="description"
                                  label="Опис"
                                  defaultValue={treatment.description ?? ""}
                                  multiline
                                  minRows={2}
                                  fullWidth
                                  sx={{ gridColumn: { xs: "1 / -1", md: "1 / -1" } }}
                                />
                              </Box>
                              <Button type="submit" variant="contained" sx={{ width: "fit-content", minHeight: 44 }}>
                                Ажурирај терапија
                              </Button>
                            </Stack>
                          </Box>

                          <Box component="form" action={deleteTreatmentAction}>
                            <input type="hidden" name="id" value={treatment.id} />
                            <Button type="submit" variant="outlined" color="error" sx={{ minHeight: 44 }}>
                              Избриши терапија
                            </Button>
                          </Box>
                        </Stack>
                      </Paper>
                    ))
                  )}
                </Stack>
              </Stack>
            </Paper>
          ) : null}

          {activeTab === "documents" ? (
            <Paper sx={{ p: { xs: 2.5, md: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
            <Stack spacing={2.2}>
              <Typography variant="h2" sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "1.4rem", md: "1.8rem" } }}>
                Документи
              </Typography>

              <Box component="form" action={createDocumentAction}>
                <Stack spacing={1.5}>
                  <Typography sx={{ fontWeight: 600 }}>Додади нов документ</Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                      gap: 1.5,
                    }}
                  >
                    <TextField name="title" label="Наслов" required fullWidth />
                    <TextField name="docType" label="Тип (certificate, policy, license...)" fullWidth />
                    <TextField name="filePath" label="Патека до фајл или URL" fullWidth />
                    <Button component="label" variant="outlined" sx={{ minHeight: 50, justifyContent: "flex-start" }}>
                      Upload file
                      <input hidden type="file" name="fileUpload" accept=".pdf,image/*" />
                    </Button>
                    <TextField name="sortOrder" label="Редослед" type="number" defaultValue={0} fullWidth />
                    <FormControlLabel
                      control={<Checkbox name="isPublished" defaultChecked />}
                      label="Објавен документ"
                    />
                    <TextField
                      name="description"
                      label="Опис"
                      multiline
                      minRows={2}
                      fullWidth
                      sx={{ gridColumn: { xs: "1 / -1", md: "1 / -1" } }}
                    />
                  </Box>
                  <Button type="submit" variant="contained" sx={{ width: "fit-content", minHeight: 44 }}>
                    Додади документ
                  </Button>
                </Stack>
              </Box>

              <Divider />

              <Stack spacing={1.5}>
                {documents.length === 0 ? (
                  <Typography sx={{ color: "text.secondary" }}>Нема документи.</Typography>
                ) : (
                  documents.map((document) => (
                    <Paper key={document.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Stack spacing={1.2}>
                        <Box component="form" action={updateDocumentAction}>
                          <Stack spacing={1.2}>
                            <input type="hidden" name="id" value={document.id} />
                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                                gap: 1.2,
                              }}
                            >
                              <TextField name="title" label="Наслов" defaultValue={document.title ?? ""} required fullWidth />
                              <TextField name="docType" label="Тип" defaultValue={document.doc_type ?? ""} fullWidth />
                              <TextField name="filePath" label="Патека до фајл или URL" defaultValue={document.file_path ?? ""} fullWidth />
                              <Button component="label" variant="outlined" sx={{ minHeight: 50, justifyContent: "flex-start" }}>
                                Upload file
                                <input hidden type="file" name="fileUpload" accept=".pdf,image/*" />
                              </Button>
                              <TextField name="sortOrder" label="Редослед" type="number" defaultValue={document.sort_order} fullWidth />
                              <FormControlLabel
                                control={<Checkbox name="isPublished" defaultChecked={document.is_published} />}
                                label="Објавен документ"
                              />
                              <TextField
                                name="description"
                                label="Опис"
                                defaultValue={document.description ?? ""}
                                multiline
                                minRows={2}
                                fullWidth
                                sx={{ gridColumn: { xs: "1 / -1", md: "1 / -1" } }}
                              />
                            </Box>
                            <Button type="submit" variant="contained" sx={{ width: "fit-content", minHeight: 44 }}>
                              Ажурирај документ
                            </Button>
                          </Stack>
                        </Box>

                        <Box component="form" action={deleteDocumentAction}>
                          <input type="hidden" name="id" value={document.id} />
                          <Button type="submit" variant="outlined" color="error" sx={{ minHeight: 44 }}>
                            Избриши документ
                          </Button>
                        </Box>
                      </Stack>
                    </Paper>
                  ))
                )}
              </Stack>
            </Stack>
            </Paper>
          ) : null}

          {activeTab === "blog" ? (
            <Paper sx={{ p: { xs: 2.5, md: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
              <Stack spacing={2.2}>
                <Typography
                  variant="h2"
                  sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "1.4rem", md: "1.8rem" } }}
                >
                  Blog posts
                </Typography>
                <BlogPostsManager posts={blogPosts} />
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}
