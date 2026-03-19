import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
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
  deleteAppointmentAction,
  deleteCertificateAction,
  deleteDocumentAction,
  deleteEmployeeAction,
  updateAppointmentAction,
  updateCertificateAction,
  updateDocumentAction,
  updateEmployeeAction,
} from "./actions";

type AdminPageProps = {
  searchParams?:
    | {
        notice?: string;
        error?: string;
        tab?: string;
      }
    | Promise<{
        notice?: string;
        error?: string;
        tab?: string;
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
  is_active: boolean;
  employee_certificates: EmployeeCertificateRow[] | null;
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

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const isLoggedIn = await hasAdminSession();

  if (!isLoggedIn) {
    redirect("/admin/login");
  }

  const resolvedSearchParams =
    searchParams &&
    typeof (searchParams as Promise<{ notice?: string; error?: string; tab?: string }>).then ===
      "function"
      ? await (searchParams as Promise<{ notice?: string; error?: string; tab?: string }>)
      : (searchParams as { notice?: string; error?: string; tab?: string } | undefined);

  const tabParam = resolvedSearchParams?.tab ?? "appointments";
  const activeTab = ["appointments", "staff", "documents", "blog"].includes(tabParam)
    ? tabParam
    : "appointments";

  const admin = createAdminClient();

  const [
    employeesResult,
    documentsResult,
    appointmentsResult,
    availableSlotsResult,
    blogPostsResult,
  ] =
    await Promise.all([
      admin
        .from("employees")
        .select(
          "id, name, description, image_path, specialization, is_active, employee_certificates(id, title, issuer, issued_on, file_path, sort_order)",
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
        .limit(100),
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
    ]);

  const employees = (employeesResult.data as EmployeeRow[] | null) ?? [];
  const documents = (documentsResult.data as DocumentRow[] | null) ?? [];
  const appointments = (appointmentsResult.data as AppointmentRow[] | null) ?? [];
  const availableSlots = (availableSlotsResult.data as SlotRow[] | null) ?? [];
  const blogPosts = (blogPostsResult.data as BlogPostRow[] | null) ?? [];

  const queryErrors = [
    employeesResult.error,
    documentsResult.error,
    appointmentsResult.error,
    availableSlotsResult.error,
    blogPostsResult.error,
  ].filter(Boolean);

  const employeeNameById = new Map<string, string>();

  for (const employee of employees) {
    employeeNameById.set(employee.id, employee.name ?? "Без име");
  }

  return (
    <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: "background.default" }}>
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
                {appointments.length === 0 ? (
                  <Typography sx={{ color: "text.secondary" }}>Нема креирани термини.</Typography>
                ) : (
                  appointments.map((appointment) => {
                    const employeeName = getEmployeeNameFromRelation(appointment.employees) ?? "Вработен";
                    const slot = getSlotFromRelation(appointment.appointment_slots);

                    return (
                      <Paper key={appointment.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Stack spacing={1.2}>
                          <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                            {employeeName}
                            {slot
                              ? ` - ${formatDateTime(slot.starts_at)} - ${formatDateTime(slot.ends_at)}`
                              : " - Нема податоци за слот"}
                          </Typography>

                          <Box component="form" action={updateAppointmentAction}>
                            <Stack spacing={1.2}>
                              <input type="hidden" name="id" value={appointment.id} />

                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                                  gap: 1.2,
                                }}
                              >
                                <TextField
                                  name="clientName"
                                  label="Име и презиме"
                                  defaultValue={appointment.client_name}
                                  required
                                  fullWidth
                                />
                                 <TextField name="email" label="Е-пошта" type="email" defaultValue={appointment.email} required fullWidth />
                                <TextField name="phone" label="Телефон" defaultValue={appointment.phone ?? ""} fullWidth />
                                <TextField
                                  select
                                  name="status"
                                  label="Статус"
                                  defaultValue={appointment.status}
                                  fullWidth
                                >
                                  <MenuItem value="pending">На чекање</MenuItem>
                                  <MenuItem value="confirmed">Потврден</MenuItem>
                                  <MenuItem value="cancelled">Откажан</MenuItem>
                                </TextField>
                                <TextField
                                  name="notes"
                                  label="Забелешки"
                                  multiline
                                  minRows={2}
                                  defaultValue={appointment.notes ?? ""}
                                  fullWidth
                                  sx={{ gridColumn: { xs: "1 / -1", md: "2 / -1" } }}
                                />
                              </Box>

                              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                <Button type="submit" variant="contained" sx={{ minHeight: 44 }}>
                                  Ажурирај термин
                                </Button>
                              </Stack>
                            </Stack>
                          </Box>

                          <Box component="form" action={deleteAppointmentAction}>
                            <input type="hidden" name="id" value={appointment.id} />
                            <input type="hidden" name="slotId" value={appointment.slot_id} />
                            <Button type="submit" variant="outlined" color="error" sx={{ minHeight: 44 }}>
                              Избриши термин
                            </Button>
                          </Box>
                        </Stack>
                      </Paper>
                    );
                  })
                )}
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

                        <Stack spacing={1}>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Сертификати</Typography>

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
                                        <TextField name="title" label="Наслов" defaultValue={certificate.title ?? ""} required size="small" fullWidth />
                                        <TextField name="issuer" label="Издавач" defaultValue={certificate.issuer ?? ""} size="small" fullWidth />
                                        <TextField
                                          name="issuedOn"
                                          label="Датум"
                                          type="date"
                                          defaultValue={toDateInputValue(certificate.issued_on)}
                                          size="small"
                                          InputLabelProps={{ shrink: true }}
                                          fullWidth
                                        />
                                        <TextField
                                          name="filePath"
                                          label="Патека до фајл"
                                          defaultValue={certificate.file_path ?? ""}
                                          size="small"
                                          fullWidth
                                          sx={{ gridColumn: { xs: "1 / -1", md: "1 / 3" } }}
                                        />
                                        <TextField
                                          name="sortOrder"
                                          label="Редослед"
                                          type="number"
                                          defaultValue={certificate.sort_order ?? 0}
                                          size="small"
                                          fullWidth
                                        />
                                      </Box>
                                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                        <Button type="submit" variant="contained" size="small" sx={{ minHeight: 40 }}>
                                          Ажурирај сертификат
                                        </Button>
                                      </Stack>
                                    </Stack>
                                  </Box>

                                  <Box component="form" action={deleteCertificateAction}>
                                    <input type="hidden" name="id" value={certificate.id} />
                                    <Button type="submit" variant="outlined" color="error" size="small" sx={{ minHeight: 40 }}>
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
                                <TextField name="title" label="Наслов" required size="small" fullWidth />
                                <TextField name="issuer" label="Издавач" size="small" fullWidth />
                                <TextField name="issuedOn" label="Датум" type="date" size="small" InputLabelProps={{ shrink: true }} fullWidth />
                                <TextField name="filePath" label="Патека до фајл" size="small" fullWidth sx={{ gridColumn: { xs: "1 / -1", md: "1 / 3" } }} />
                                <TextField name="sortOrder" label="Редослед" type="number" defaultValue={0} size="small" fullWidth />
                              </Box>
                              <Button type="submit" variant="outlined" size="small" sx={{ width: "fit-content", minHeight: 40 }}>
                                Додади сертификат
                              </Button>
                            </Stack>
                          </Box>
                        </Stack>
                      </Stack>
                    </Paper>
                  );
                })}
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
