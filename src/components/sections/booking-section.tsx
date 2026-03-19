"use client";

import * as React from "react";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SectionOverline from "@/components/ui/section-overline";
import type { AppointmentSlot, Employee } from "@/types/physio";

type BookingSectionProps = {
  employees: Employee[];
  slots: AppointmentSlot[];
};

type BookingFormState = {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
};

const bookingSteps = ["Избери терапевт", "Избери датум", "Избери време", "Твои податоци"];

const bookingStepDescriptions = [
  "Избери го специјалистот",
  "Прикажани се достапни датуми",
  "Сесии од 30 минути",
  "Име, е-пошта и телефон",
];

const STUDIO_MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2966.1230029006797!2d21.445350800000003!3d41.976168799999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xafa5a060219f9369%3A0x82c6d7745c5b8d0c!2sPhysio%20Patella!5e0!3m2!1sen!2smk!4v1773875321288!5m2!1sen!2smk";

function formatDateLabel(dateKey: string) {
  return new Intl.DateTimeFormat("mk-MK", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${dateKey}T00:00:00`));
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

function toGoogleCalendarDate(dateTimeIso: string) {
  return new Date(dateTimeIso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function getInitials(name: string | null) {
  if (!name) {
    return "PP";
  }

  const words = name.split(" ").filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export default function BookingSection({ employees, slots }: BookingSectionProps) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [bookedSlot, setBookedSlot] = React.useState<AppointmentSlot | null>(null);
  const [availableSlots, setAvailableSlots] = React.useState<AppointmentSlot[]>(slots);
  const [formState, setFormState] = React.useState<BookingFormState>({
    fullName: "",
    email: "",
    phone: "",
    notes: "",
  });

  const selectedEmployee = React.useMemo(
    () => employees.find((employee) => employee.id === selectedEmployeeId) ?? null,
    [employees, selectedEmployeeId],
  );

  const selectedSlot = React.useMemo(
    () => availableSlots.find((slot) => slot.id === selectedSlotId) ?? null,
    [availableSlots, selectedSlotId],
  );

  const employeeSlots = React.useMemo(
    () =>
      availableSlots
        .filter((slot) => slot.employee_id === selectedEmployeeId)
        .sort(
          (firstSlot, secondSlot) =>
            new Date(firstSlot.starts_at).getTime() - new Date(secondSlot.starts_at).getTime(),
        ),
    [availableSlots, selectedEmployeeId],
  );

  const availableDates = React.useMemo(() => {
    const uniqueDates = new Set(employeeSlots.map((slot) => toDateKey(slot.starts_at)));
    return Array.from(uniqueDates).sort();
  }, [employeeSlots]);

  const availableTimes = React.useMemo(
    () =>
      employeeSlots.filter((slot) => {
        if (!selectedDate) {
          return false;
        }

        return toDateKey(slot.starts_at) === selectedDate;
      }),
    [employeeSlots, selectedDate],
  );

  const googleCalendarLink = React.useMemo(() => {
    if (!bookedSlot || !selectedEmployee) {
      return "";
    }

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: "Термин во Physio Patella",
      dates: `${toGoogleCalendarDate(bookedSlot.starts_at)}/${toGoogleCalendarDate(bookedSlot.ends_at)}`,
      details: `Термин со ${selectedEmployee.name ?? "специјалист на Physio Patella"}`,
      location: "Physio Patella Studio, Skopje",
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }, [bookedSlot, selectedEmployee]);

  const progressValue = ((activeStep + 1) / bookingSteps.length) * 100;

  const updateFormField = React.useCallback(
    (field: keyof BookingFormState) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState((previousState) => ({
          ...previousState,
          [field]: event.target.value,
        }));
      },
    [],
  );

  const resetBookingFlow = React.useCallback(() => {
    setActiveStep(0);
    setSelectedEmployeeId(null);
    setSelectedDate(null);
    setSelectedSlotId(null);
    setErrorMessage(null);
    setIsSubmitting(false);
    setIsConfirmed(false);
    setBookedSlot(null);
    setFormState({
      fullName: "",
      email: "",
      phone: "",
      notes: "",
    });
  }, []);

  const goNext = React.useCallback(() => {
    setActiveStep((previousStep) => Math.min(previousStep + 1, bookingSteps.length - 1));
    setErrorMessage(null);
  }, []);

  const goBack = React.useCallback(() => {
    setActiveStep((previousStep) => Math.max(previousStep - 1, 0));
    setErrorMessage(null);
  }, []);

  const handleEmployeeSelect = React.useCallback((employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setSelectedDate(null);
    setSelectedSlotId(null);
  }, []);

  const handleDateSelect = React.useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
    setSelectedSlotId(null);
  }, []);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!selectedEmployee || !selectedSlot) {
        setErrorMessage("Изберете терапевт, датум и време пред потврда.");
        return;
      }

      if (!formState.fullName.trim() || !formState.email.trim()) {
        setErrorMessage("Името и е-пошта адресата се задолжителни.");
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        const response = await fetch("/api/appointments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            slotId: selectedSlot.id,
            employeeId: selectedEmployee.id,
            clientName: formState.fullName.trim(),
            email: formState.email.trim(),
            phone: formState.phone.trim() || null,
            notes: formState.notes.trim() || null,
          }),
        });

        const data = (await response.json()) as {
          error?: string;
          slot?: AppointmentSlot;
        };

        if (!response.ok) {
          setErrorMessage(
            data.error ?? "Овој термин е веќе резервиран. Изберете друго време.",
          );
          return;
        }

        setAvailableSlots((previousSlots) =>
          previousSlots.filter((slot) => slot.id !== selectedSlot.id),
        );
        setBookedSlot(data.slot ?? selectedSlot);
        setIsConfirmed(true);
      } catch {
        setErrorMessage("Овој термин е веќе резервиран. Изберете друго време.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState, selectedEmployee, selectedSlot],
  );

  const bookingFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 1.5,
      minHeight: 50,
      alignItems: "center",
    },
    "& .MuiOutlinedInput-root.MuiInputBase-multiline": {
      minHeight: "unset",
      alignItems: "flex-start",
    },
    "& .MuiInputBase-input": {
      fontSize: "0.98rem",
      lineHeight: 1.35,
    },
    "& .MuiInputBase-inputMultiline": {
      lineHeight: 1.5,
    },
    "& .MuiInputLabel-root": {
      fontSize: "0.92rem",
    },
  };

  return (
    <Box
      id="booking"
      component="section"
      aria-labelledby="booking-heading"
      sx={{
        scrollMarginTop: { xs: "56px", md: "64px" },
        py: { xs: 6, md: 10 },
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Stack spacing={4}>
          <Stack spacing={1.3}>
            <SectionOverline>
              Закажи посета
            </SectionOverline>
            <Typography
              id="booking-heading"
              variant="h2"
              sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "2rem", md: "2.8rem" } }}
            >
              Закажи го твојот термин
            </Typography>
          </Stack>

          <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" } }}>
            <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
              Чекор {activeStep + 1} од {bookingSteps.length} - {bookingSteps[activeStep]}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={isConfirmed ? 100 : progressValue}
              sx={{ borderRadius: 99, height: 8 }}
            />
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.28fr 0.72fr", lg: "0.34fr 0.66fr" },
              gap: { xs: 3, md: 4 },
            }}
          >
            <Paper
              role="list"
              sx={{
                display: { xs: "none", md: "block" },
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: { md: 2.5, lg: 3 },
                height: "fit-content",
              }}
            >
              <Stack spacing={1.8}>
                {bookingSteps.map((step, stepIndex) => {
                  const isCompleted = stepIndex < activeStep || (isConfirmed && stepIndex <= 3);
                  const isCurrent = stepIndex === activeStep && !isConfirmed;

                  return (
                    <Box
                      key={step}
                      role="listitem"
                      aria-current={isCurrent ? "step" : undefined}
                      sx={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 1.5 }}
                    >
                      <Stack alignItems="center" spacing={0.8}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            fontFamily: "var(--font-dm-serif), serif",
                            border: "2px solid",
                            borderColor: isCurrent || isCompleted ? "primary.main" : "divider",
                            bgcolor: isCurrent
                              ? "primary.main"
                              : isCompleted
                                ? "color-mix(in srgb, var(--mui-palette-primary-main) 15%, transparent)"
                                : "transparent",
                            color: isCurrent
                              ? "#ffffff"
                              : isCompleted
                                ? "primary.main"
                                : "text.disabled",
                            boxShadow: isCurrent
                              ? "0 0 0 4px color-mix(in srgb, var(--mui-palette-primary-main) 20%, transparent)"
                              : "none",
                          }}
                        >
                          {isCompleted ? <CheckRoundedIcon sx={{ fontSize: 16 }} /> : stepIndex + 1}
                        </Box>
                        {stepIndex < bookingSteps.length - 1 ? (
                          <Box
                            sx={{
                              width: 2,
                              height: 24,
                              bgcolor: stepIndex < activeStep ? "primary.main" : "divider",
                              transition: "background-color 0.4s ease",
                            }}
                          />
                        ) : null}
                      </Stack>

                      <Stack spacing={0.4}>
                        <Typography
                          sx={{
                            pt: 0.1,
                            color: isCurrent
                              ? "text.primary"
                              : isCompleted
                                ? "text.secondary"
                                : "text.disabled",
                            fontWeight: isCurrent ? 600 : 500,
                            fontSize: isCurrent ? "0.875rem" : "0.8rem",
                          }}
                        >
                          {step}
                        </Typography>
                        <Typography sx={{ fontSize: "0.625rem", color: "text.disabled" }}>
                          {bookingStepDescriptions[stepIndex]}
                        </Typography>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Paper>

            <Paper
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2.5,
                p: { xs: 3, md: 4 },
                bgcolor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.background.paper, 0.7)
                    : theme.palette.background.paper,
                backdropFilter: "blur(12px)",
                minHeight: 520,
                "@keyframes bookingPanelIn": {
                  from: {
                    opacity: 0,
                    transform: "translateX(14px)",
                  },
                  to: {
                    opacity: 1,
                    transform: "translateX(0)",
                  },
                },
              }}
            >
              {isConfirmed && bookedSlot && selectedEmployee ? (
                <Stack spacing={2.2} alignItems={{ xs: "stretch", md: "flex-start" }} sx={{ maxWidth: 560 }}>
                  <CheckCircleOutlineRoundedIcon sx={{ fontSize: 64, color: "success.main" }} />

                  <Typography
                    variant="h3"
                    sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "1.6rem", md: "2rem" } }}
                  >
                    Терминот е успешно закажан!
                  </Typography>

                  <Typography sx={{ color: "text.secondary", lineHeight: 1.7, fontSize: { xs: "1rem", md: "1.125rem" } }}>
                    Твојот термин со {selectedEmployee.name ?? "нашиот специјалист"} на{" "}
                    {formatDateLabel(toDateKey(bookedSlot.starts_at))} во {formatTimeLabel(bookedSlot.starts_at)} е
                    потврден. Ќе испратиме потсетник на {formState.email}.
                  </Typography>

                  <Stack spacing={1} sx={{ width: "100%" }}>
                    <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                      Локација на студиото
                    </Typography>
                    <Box
                      sx={{
                        borderRadius: 1.5,
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "divider",
                        width: "100%",
                      }}
                    >
                      <Box
                        component="iframe"
                        src={STUDIO_MAP_EMBED_URL}
                        width="100%"
                        height="220"
                        sx={{ border: 0, display: "block" }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                        title="Мапа до Physio Patella"
                      />
                    </Box>
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      href={googleCalendarLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ width: { xs: "100%", sm: "auto" }, minHeight: 44 }}
                    >
                      Додади во Google Calendar
                    </Button>
                    <Button variant="text" onClick={resetBookingFlow} sx={{ minHeight: 44 }}>
                      Закажи друг термин
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Box
                  key={activeStep}
                  sx={{
                    "@media (prefers-reduced-motion: no-preference)": {
                      animation: "bookingPanelIn 0.25s ease",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      mb: 2,
                      textAlign: "right",
                      color: "text.disabled",
                      fontSize: "0.75rem",
                    }}
                  >
                    Чекор {activeStep + 1} од {bookingSteps.length}
                  </Typography>

                  {activeStep === 0 ? (
                    <Stack spacing={2.1}>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                          gap: 1.5,
                        }}
                      >
                        {employees.map((employee) => {
                          const isSelected = employee.id === selectedEmployeeId;

                          return (
                            <Paper
                              key={employee.id}
                              onClick={() => handleEmployeeSelect(employee.id)}
                              sx={{
                                position: "relative",
                                borderRadius: 1.5,
                                p: 2.5,
                                border: "1px solid",
                                borderColor: isSelected ? "primary.main" : "divider",
                                bgcolor: isSelected ? "action.hover" : "background.paper",
                                cursor: "pointer",
                                transition: "all 0.25s ease",
                                "&:hover": {
                                  borderColor: "primary.main",
                                  transform: { md: "translateY(-2px)" },
                                },
                              }}
                            >
                              <Stack direction="row" spacing={1.4} alignItems="center">
                                <Avatar sx={{ width: 48, height: 48, bgcolor: "primary.main" }}>
                                  {getInitials(employee.name)}
                                </Avatar>
                                <Stack spacing={0.4}>
                                  <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
                                    {employee.name ?? "Специјалист"}
                                  </Typography>
                                  <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                                    {employee.specialization ?? "Физиотерапија"}
                                  </Typography>
                                </Stack>
                              </Stack>

                              {isSelected ? (
                                <CheckRoundedIcon
                                  sx={{
                                    position: "absolute",
                                    top: 10,
                                    right: 10,
                                    fontSize: 18,
                                    color: "primary.main",
                                  }}
                                />
                              ) : null}
                            </Paper>
                          );
                        })}
                      </Box>

                      {selectedEmployeeId ? (
                        <Stack direction="row" justifyContent="flex-end" sx={{ pt: 1 }}>
                          <Button variant="contained" onClick={goNext} sx={{ minHeight: 44 }}>
                            Следно
                          </Button>
                        </Stack>
                      ) : null}
                    </Stack>
                  ) : null}

                  {activeStep === 1 ? (
                    <Stack spacing={2.1}>
                      <Typography
                        variant="h3"
                        sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "1.3rem", md: "1.6rem" } }}
                      >
                        Избери датум
                      </Typography>

                      {availableDates.length === 0 ? (
                        <Typography sx={{ color: "text.secondary", fontSize: "1rem" }}>
                          Нема слободни датуми во моментов.
                        </Typography>
                      ) : (
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "repeat(2, minmax(0, 1fr))",
                              sm: "repeat(3, minmax(0, 1fr))",
                              md: "repeat(4, minmax(0, 1fr))",
                            },
                            gap: 1.2,
                          }}
                        >
                          {availableDates.map((dateKey) => {
                            const isSelected = selectedDate === dateKey;

                            return (
                              <ToggleButton
                                key={dateKey}
                                value={dateKey}
                                selected={isSelected}
                                onChange={() => handleDateSelect(dateKey)}
                                sx={{
                                  borderRadius: 999,
                                  borderColor: "divider",
                                  textTransform: "none",
                                  color: "text.secondary",
                                  minHeight: 44,
                                  "&.Mui-selected": {
                                    bgcolor: "primary.main",
                                    color: "primary.contrastText",
                                    borderColor: "primary.main",
                                  },
                                  "&.Mui-selected:hover": {
                                    bgcolor: "primary.dark",
                                  },
                                }}
                              >
                                {formatDateLabel(dateKey)}
                              </ToggleButton>
                            );
                          })}
                        </Box>
                      )}

                      <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                        <Button variant="text" onClick={goBack} sx={{ minHeight: 44 }}>
                          Назад
                        </Button>
                        <Button variant="contained" disabled={!selectedDate} onClick={goNext} sx={{ minHeight: 44 }}>
                          Следно
                        </Button>
                      </Stack>
                    </Stack>
                  ) : null}

                  {activeStep === 2 ? (
                    <Stack spacing={2.1}>
                      <Typography
                        variant="h3"
                        sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "1.3rem", md: "1.6rem" } }}
                      >
                        Избери време
                      </Typography>

                      {availableTimes.length === 0 ? (
                        <Typography sx={{ color: "text.secondary", fontSize: "1rem" }}>
                          Нема слободни термини за овој датум.
                        </Typography>
                      ) : (
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "repeat(3, minmax(0, 1fr))", sm: "repeat(4, minmax(0, 1fr))" },
                            gap: 1.2,
                          }}
                        >
                          {availableTimes.map((slot) => {
                            const isPast = new Date(slot.starts_at).getTime() < Date.now();

                            return (
                              <ToggleButton
                                key={slot.id}
                                value={slot.id}
                                selected={selectedSlotId === slot.id}
                                disabled={isPast}
                                onChange={() => setSelectedSlotId(slot.id)}
                                sx={{
                                  borderRadius: 1,
                                  borderColor: "divider",
                                  bgcolor: "background.paper",
                                  color: "text.secondary",
                                  minHeight: 44,
                                  width: "100%",
                                  textTransform: "none",
                                  fontSize: "0.875rem",
                                  py: 1,
                                  "&.Mui-selected": {
                                    bgcolor: "primary.main",
                                    color: "primary.contrastText",
                                    borderColor: "primary.main",
                                  },
                                  "&:hover": {
                                    bgcolor:
                                      "color-mix(in srgb, var(--mui-palette-primary-main) 8%, var(--mui-palette-background-paper))",
                                    borderColor: "primary.main",
                                  },
                                  "&.Mui-selected:hover": {
                                    bgcolor: "primary.dark",
                                  },
                                }}
                              >
                                <Stack spacing={0.2} alignItems="center">
                                  <Typography component="span" sx={{ fontSize: "0.875rem" }}>
                                    {formatTimeLabel(slot.starts_at)}
                                  </Typography>
                                  <Typography component="span" sx={{ fontSize: "0.625rem", opacity: 0.9 }}>
                                    30 min
                                  </Typography>
                                </Stack>
                              </ToggleButton>
                            );
                          })}
                        </Box>
                      )}

                      <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                        <Button variant="text" onClick={goBack} sx={{ minHeight: 44 }}>
                          Назад
                        </Button>
                        <Button variant="contained" disabled={!selectedSlotId} onClick={goNext} sx={{ minHeight: 44 }}>
                          Следно
                        </Button>
                      </Stack>
                    </Stack>
                  ) : null}

                  {activeStep === 3 ? (
                    <Stack component="form" spacing={2} onSubmit={handleSubmit}>
                      <Typography
                        variant="h3"
                        sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "1.3rem", md: "1.6rem" } }}
                      >
                        Твои податоци
                      </Typography>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <TextField
                          label="Име и презиме"
                          value={formState.fullName}
                          onChange={updateFormField("fullName")}
                          required
                          aria-required="true"
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          sx={bookingFieldSx}
                        />

                        <TextField
                          label="Е-пошта"
                          type="email"
                          value={formState.email}
                          onChange={updateFormField("email")}
                          required
                          aria-required="true"
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          sx={bookingFieldSx}
                        />

                        <TextField
                          label="Телефон"
                          value={formState.phone}
                          onChange={updateFormField("phone")}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          sx={{
                            gridColumn: "1 / -1",
                            ...bookingFieldSx,
                          }}
                        />

                        <TextField
                          label="Забелешки"
                          value={formState.notes}
                          onChange={updateFormField("notes")}
                          multiline
                          minRows={3}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          sx={{
                            gridColumn: "1 / -1",
                            ...bookingFieldSx,
                          }}
                        />
                      </Box>

                      {errorMessage ? (
                        <Alert
                          severity="error"
                          action={
                            <Button color="inherit" size="small" onClick={() => setActiveStep(2)}>
                              Врати се назад
                            </Button>
                          }
                        >
                          {errorMessage}
                        </Alert>
                      ) : null}

                      <Stack spacing={1} sx={{ pt: 0.8 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isSubmitting}
                          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                          fullWidth
                          sx={{ minHeight: 44 }}
                        >
                          {isSubmitting ? "Потврдуваме..." : "Потврди термин"}
                        </Button>

                        <Button
                          variant="text"
                          onClick={goBack}
                          disabled={isSubmitting}
                          sx={{ alignSelf: "flex-start", minHeight: 44 }}
                        >
                          Назад
                        </Button>
                      </Stack>
                    </Stack>
                  ) : null}
                </Box>
              )}
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
