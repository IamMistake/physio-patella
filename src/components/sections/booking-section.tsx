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
import SectionOverline from "@/components/ui/section-overline";
import { createClient } from "@/lib/supabase/client";
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

const bookingSteps = ["Choose therapist", "Pick a date", "Select time", "Your details"];

const bookingStepDescriptions = [
  "Pick your specialist",
  "Available dates shown",
  "30-minute sessions",
  "Name, email & phone",
];

function formatDateLabel(dateKey: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${dateKey}T00:00:00`));
}

function formatTimeLabel(dateTimeIso: string) {
  return new Intl.DateTimeFormat("en-GB", {
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
  const supabase = React.useMemo(() => createClient(), []);
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
      text: "Physio Patella Appointment",
      dates: `${toGoogleCalendarDate(bookedSlot.starts_at)}/${toGoogleCalendarDate(bookedSlot.ends_at)}`,
      details: `Appointment with ${selectedEmployee.name ?? "Physio Patella specialist"}`,
      location: "Physio Patella Studio",
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
        setErrorMessage("Please choose a therapist, date, and time before confirming.");
        return;
      }

      if (!formState.fullName.trim() || !formState.email.trim()) {
        setErrorMessage("Full name and email are required.");
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        const { error: insertError } = await supabase.from("appointments").insert({
          slot_id: selectedSlot.id,
          employee_id: selectedEmployee.id,
          client_name: formState.fullName.trim(),
          email: formState.email.trim(),
          phone: formState.phone.trim() || null,
          notes: formState.notes.trim() || null,
          status: "pending",
        });

        if (insertError) {
          throw insertError;
        }

        const { error: updateError } = await supabase
          .from("appointment_slots")
          .update({ is_available: false })
          .eq("id", selectedSlot.id);

        if (updateError) {
          console.warn("Could not mark slot unavailable immediately:", updateError.message);
        }

        setAvailableSlots((previousSlots) =>
          previousSlots.filter((slot) => slot.id !== selectedSlot.id),
        );
        setBookedSlot(selectedSlot);
        setIsConfirmed(true);
      } catch {
        setErrorMessage("This slot was just taken. Please go back and choose another time.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState, selectedEmployee, selectedSlot, supabase],
  );

  return (
    <Box
      id="booking"
      component="section"
      aria-labelledby="booking-heading"
      sx={{
        scrollMarginTop: { xs: "56px", md: "64px" },
        py: { xs: 6, md: 10, lg: 16 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Stack spacing={4}>
          <Stack spacing={1.3}>
            <SectionOverline>
              Schedule a visit
            </SectionOverline>
            <Typography
              id="booking-heading"
              variant="h2"
              sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "2rem", md: "2.8rem" } }}
            >
              Book your appointment
            </Typography>
          </Stack>

          <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" } }}>
            <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
              Step {activeStep + 1} of {bookingSteps.length} - {bookingSteps[activeStep]}
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
                      sx={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 1.5 }}
                    >
                      <Stack alignItems="center" spacing={0.8}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            border: "1.5px solid",
                            borderColor: isCompleted || isCurrent ? "primary.main" : "divider",
                            bgcolor: isCurrent
                              ? "primary.main"
                              : isCompleted
                                ? "color-mix(in srgb, var(--mui-palette-primary-main) 20%, transparent)"
                                : "transparent",
                            color: isCurrent
                              ? "primary.contrastText"
                              : isCompleted
                                ? "primary.main"
                                : "text.secondary",
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
                            fontSize: "0.9rem",
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
                bgcolor: "color-mix(in srgb, var(--mui-palette-background-paper) 60%, transparent)",
                backdropFilter: "blur(8px)",
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
                    You&apos;re booked in!
                  </Typography>

                  <Typography sx={{ color: "text.secondary", lineHeight: 1.7, fontSize: { xs: "1rem", md: "1.125rem" } }}>
                    Your appointment with {selectedEmployee.name ?? "our specialist"} on{" "}
                    {formatDateLabel(toDateKey(bookedSlot.starts_at))} at {formatTimeLabel(bookedSlot.starts_at)} is
                    confirmed. We&apos;ll send a reminder to {formState.email}.
                  </Typography>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      href={googleCalendarLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ width: { xs: "100%", sm: "auto" }, minHeight: 44 }}
                    >
                      Add to Google Calendar
                    </Button>
                    <Button variant="text" onClick={resetBookingFlow} sx={{ minHeight: 44 }}>
                      Book another appointment
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
                  {activeStep === 0 ? (
                    <Stack spacing={2.1}>
                      <Typography
                        variant="h3"
                        sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "1.3rem", md: "1.6rem" } }}
                      >
                        Choose your therapist
                      </Typography>

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
                                    {employee.name ?? "Specialist"}
                                  </Typography>
                                  <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                                    {employee.specialization ?? "Physio therapy"}
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
                            Next
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
                        Pick a date
                      </Typography>

                      {availableDates.length === 0 ? (
                        <Typography sx={{ color: "text.secondary", fontSize: "1rem" }}>
                          No available dates - check back soon.
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
                          Back
                        </Button>
                        <Button variant="contained" disabled={!selectedDate} onClick={goNext} sx={{ minHeight: 44 }}>
                          Next
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
                        Select a time
                      </Typography>

                      {availableTimes.length === 0 ? (
                        <Typography sx={{ color: "text.secondary", fontSize: "1rem" }}>
                          No available times on this date.
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
                          Back
                        </Button>
                        <Button variant="contained" disabled={!selectedSlotId} onClick={goNext} sx={{ minHeight: 44 }}>
                          Next
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
                        Your details
                      </Typography>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <TextField
                          label="Full name"
                          value={formState.fullName}
                          onChange={updateFormField("fullName")}
                          required
                          aria-required="true"
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1.5,
                            },
                          }}
                        />

                        <TextField
                          label="Email"
                          type="email"
                          value={formState.email}
                          onChange={updateFormField("email")}
                          required
                          aria-required="true"
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1.5,
                            },
                          }}
                        />

                        <TextField
                          label="Phone"
                          value={formState.phone}
                          onChange={updateFormField("phone")}
                          fullWidth
                          sx={{
                            gridColumn: "1 / -1",
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1.5,
                            },
                          }}
                        />

                        <TextField
                          label="Notes"
                          value={formState.notes}
                          onChange={updateFormField("notes")}
                          multiline
                          minRows={3}
                          fullWidth
                          sx={{
                            gridColumn: "1 / -1",
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1.5,
                            },
                          }}
                        />
                      </Box>

                      {errorMessage ? (
                        <Alert
                          severity="error"
                          action={
                            <Button color="inherit" size="small" onClick={() => setActiveStep(2)}>
                              Go back
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
                          {isSubmitting ? "Confirming..." : "Confirm appointment"}
                        </Button>

                        <Button
                          variant="text"
                          onClick={goBack}
                          disabled={isSubmitting}
                          sx={{ alignSelf: "flex-start", minHeight: 44 }}
                        >
                          Back
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
