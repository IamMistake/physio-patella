"use client";

import * as React from "react";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
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

const bookingSteps = [
  "Choose therapist",
  "Pick a date",
  "Select time",
  "Your details",
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
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to confirm booking.";
        setErrorMessage(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState, selectedEmployee, selectedSlot, supabase],
  );

  return (
    <Box id="booking" component="section" sx={{ py: { xs: 15, md: 18 } }}>
      <Box sx={{ maxWidth: 1440, mx: "auto", px: { xs: 2.5, md: 4 } }}>
        <Stack spacing={5}>
          <Stack spacing={1.3}>
            <Typography
              sx={{
                textTransform: "uppercase",
                letterSpacing: 2,
                color: "primary.main",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              Schedule a visit
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: "2.2rem", md: "3.4rem" } }}>
              Book your appointment
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.36fr 0.64fr" },
              gap: { xs: 4, md: 5 },
            }}
          >
            <Paper
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: { xs: 2.5, md: 3 },
                height: "fit-content",
              }}
            >
              <Stack spacing={1.8}>
                {bookingSteps.map((step, stepIndex) => {
                  const isCompleted = stepIndex < activeStep || (isConfirmed && stepIndex <= 3);
                  const isCurrent = stepIndex === activeStep && !isConfirmed;

                  return (
                    <Box key={step} sx={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 1.4 }}>
                      <Stack alignItems="center" spacing={0.8}>
                        <Box
                          sx={(theme) => ({
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 700,
                            border: "1px solid",
                            borderColor: isCompleted || isCurrent ? "primary.main" : "divider",
                            bgcolor:
                              isCompleted || isCurrent
                                ? alpha(theme.palette.primary.main, 0.95)
                                : "transparent",
                            color: isCompleted || isCurrent ? "primary.contrastText" : "text.secondary",
                            transition: "all 0.25s ease",
                          })}
                        >
                          {isCompleted ? <CheckRoundedIcon sx={{ fontSize: 14 }} /> : stepIndex + 1}
                        </Box>

                        {stepIndex < bookingSteps.length - 1 ? (
                          <Box sx={{ width: 1, height: 22, bgcolor: "divider" }} />
                        ) : null}
                      </Stack>

                      <Typography
                        sx={{
                          pt: 0.1,
                          color: isCurrent ? "primary.main" : "text.secondary",
                          fontWeight: isCurrent ? 700 : 500,
                        }}
                      >
                        {step}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Paper>

            <Paper
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: { xs: 2.5, md: 4 },
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
                <Stack spacing={2.2} alignItems="flex-start" sx={{ maxWidth: 560 }}>
                  <CheckCircleOutlineRoundedIcon sx={{ fontSize: 64, color: "success.main" }} />

                  <Typography variant="h5" sx={{ fontFamily: "var(--font-dm-serif), serif" }}>
                    You&apos;re booked in!
                  </Typography>

                  <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                    Your appointment with {selectedEmployee.name ?? "our specialist"} on{" "}
                    {formatDateLabel(toDateKey(bookedSlot.starts_at))} at{" "}
                    {formatTimeLabel(bookedSlot.starts_at)} is confirmed. We&apos;ll send a
                    reminder to {formState.email}.
                  </Typography>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      href={googleCalendarLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Add to Google Calendar
                    </Button>
                    <Button variant="text" onClick={resetBookingFlow}>
                      Book another appointment
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Box key={activeStep} sx={{ animation: "bookingPanelIn 0.25s ease" }}>
                  {activeStep === 0 ? (
                    <Stack spacing={2.1}>
                      <Typography variant="h5" sx={{ fontFamily: "var(--font-dm-serif), serif" }}>
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
                              sx={(theme) => ({
                                borderRadius: 1.5,
                                p: 2,
                                border: "1px solid",
                                borderColor: isSelected ? "primary.main" : "divider",
                                bgcolor: isSelected
                                  ? alpha(theme.palette.primary.main, 0.06)
                                  : "background.paper",
                                cursor: "pointer",
                                transition: "all 0.25s ease",
                                "&:hover": {
                                  borderColor: "primary.main",
                                  transform: "translateY(-2px)",
                                },
                              })}
                            >
                              <Stack direction="row" spacing={1.4} alignItems="center">
                                <Avatar sx={{ width: 48, height: 48, bgcolor: "primary.main" }}>
                                  {getInitials(employee.name)}
                                </Avatar>
                                <Stack spacing={0.4}>
                                  <Typography sx={{ fontWeight: 700 }}>
                                    {employee.name ?? "Specialist"}
                                  </Typography>
                                  <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                                    {employee.specialization ?? "Physio therapy"}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Paper>
                          );
                        })}
                      </Box>

                      {selectedEmployeeId ? (
                        <Stack direction="row" justifyContent="flex-end" sx={{ pt: 1 }}>
                          <Button variant="contained" onClick={goNext}>
                            Next
                          </Button>
                        </Stack>
                      ) : null}
                    </Stack>
                  ) : null}

                  {activeStep === 1 ? (
                    <Stack spacing={2.1}>
                      <Typography variant="h5" sx={{ fontFamily: "var(--font-dm-serif), serif" }}>
                        Pick a date
                      </Typography>

                      {availableDates.length === 0 ? (
                        <Typography sx={{ color: "text.secondary" }}>
                          No available dates - check back soon.
                        </Typography>
                      ) : (
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" },
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
                                sx={(theme) => ({
                                  borderRadius: 999,
                                  borderColor: "divider",
                                  textTransform: "none",
                                  color: "text.secondary",
                                  "&.Mui-selected": {
                                    bgcolor: "primary.main",
                                    color: "primary.contrastText",
                                    borderColor: "primary.main",
                                  },
                                  "&.Mui-selected:hover": {
                                    bgcolor: theme.palette.primary.dark,
                                  },
                                })}
                              >
                                {formatDateLabel(dateKey)}
                              </ToggleButton>
                            );
                          })}
                        </Box>
                      )}

                      <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                        <Button variant="text" onClick={goBack}>
                          Back
                        </Button>
                        <Button variant="contained" disabled={!selectedDate} onClick={goNext}>
                          Next
                        </Button>
                      </Stack>
                    </Stack>
                  ) : null}

                  {activeStep === 2 ? (
                    <Stack spacing={2.1}>
                      <Typography variant="h5" sx={{ fontFamily: "var(--font-dm-serif), serif" }}>
                        Select a time
                      </Typography>

                      {availableTimes.length === 0 ? (
                        <Typography sx={{ color: "text.secondary" }}>
                          No available times on this date.
                        </Typography>
                      ) : (
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                            gap: 1.2,
                          }}
                        >
                          {availableTimes.map((slot) => (
                            <ToggleButton
                              key={slot.id}
                              value={slot.id}
                              selected={selectedSlotId === slot.id}
                              onChange={() => setSelectedSlotId(slot.id)}
                              sx={(theme) => ({
                                borderRadius: 999,
                                borderColor: "divider",
                                color: "text.secondary",
                                "&.Mui-selected": {
                                  bgcolor: "primary.main",
                                  color: "primary.contrastText",
                                  borderColor: "primary.main",
                                },
                                "&.Mui-selected:hover": {
                                  bgcolor: theme.palette.primary.dark,
                                },
                              })}
                            >
                              {formatTimeLabel(slot.starts_at)}
                            </ToggleButton>
                          ))}
                        </Box>
                      )}

                      <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                        <Button variant="text" onClick={goBack}>
                          Back
                        </Button>
                        <Button variant="contained" disabled={!selectedSlotId} onClick={goNext}>
                          Next
                        </Button>
                      </Stack>
                    </Stack>
                  ) : null}

                  {activeStep === 3 ? (
                    <Stack component="form" spacing={1.8} onSubmit={handleSubmit}>
                      <Typography variant="h5" sx={{ fontFamily: "var(--font-dm-serif), serif" }}>
                        Your details
                      </Typography>

                      <TextField
                        label="Full name"
                        value={formState.fullName}
                        onChange={updateFormField("fullName")}
                        required
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
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                          },
                        }}
                      />

                      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

                      <Stack spacing={1} sx={{ pt: 0.8 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isSubmitting}
                          fullWidth
                        >
                          {isSubmitting ? "Confirming..." : "Confirm appointment"}
                        </Button>

                        <Button variant="text" onClick={goBack} disabled={isSubmitting} sx={{ alignSelf: "flex-start" }}>
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
      </Box>
    </Box>
  );
}
