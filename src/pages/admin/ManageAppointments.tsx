import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCcw, Calendar, ShieldCheck } from "lucide-react";
import { listAdminAppointments, updateAdminAppointmentStatus } from "@/services/projectService";
import type { AdminAppointment } from "@/types/appointment";

const formatDateTime = (value?: string) => (value ? new Date(value).toLocaleString() : "—");

const normalizeStatus = (value: string) => value.split("_").map((part) => part.charAt(0) + part.slice(1).toLowerCase()).join(" ");

const statusOptions = ["ALL", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("PENDING");
  const [fromDate, setFromDate] = useState("");
  const [search, setSearch] = useState("");
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const isoDate = fromDate ? new Date(fromDate).toISOString() : undefined;
        const data = await listAdminAppointments(status === "ALL" ? undefined : status, isoDate, undefined);
        if (!active) return;
        setAppointments(data);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load appointments");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [status, fromDate]);

  const filtered = useMemo(() => {
    if (!search) return appointments;
    const term = search.toLowerCase();
    return appointments.filter((appt) =>
      [appt.serviceType, appt.customerId, appt.vehicleId].some((field) => field?.toLowerCase().includes(term)),
    );
  }, [appointments, search]);

  const handleUpdateStatus = async (id: string, nextStatus: string) => {
    try {
      setSubmittingId(id);
      await updateAdminAppointmentStatus(id, nextStatus, `Updated via admin console (${nextStatus})`);
      const updated = await listAdminAppointments(status === "ALL" ? undefined : status, fromDate ? new Date(fromDate).toISOString() : undefined, undefined);
      setAppointments(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to update appointment status");
    } finally {
      setSubmittingId(null);
    }
  };

  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((a) => a.status === "PENDING").length;
    const confirmed = appointments.filter((a) => a.status === "CONFIRMED").length;
    const converted = appointments.filter((a) => a.status === "IN_PROGRESS").length;
    return { total, pending, confirmed, converted };
  }, [appointments]);

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Appointment Intake</h1>
            <p className="text-muted-foreground">Review customer bookings before converting them into projects.</p>
          </div>
          <Button variant="outline" onClick={() => setFromDate("")}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Reset filters
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total reviewed</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{stats.total}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-yellow-600">{stats.pending}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Confirmed</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-blue-600">{stats.confirmed}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Converted (In progress)</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-emerald-600">{stats.converted}</CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {normalizeStatus(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <div className="md:col-span-2">
              <Input placeholder="Search by vehicle, customer ID or service" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center text-destructive font-medium">{error}</CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Appointments ({filtered.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No appointments match the selected filters.</p>
              ) : (
                filtered.map((appt) => (
                  <div key={appt.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{appt.serviceType}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDateTime(appt.startTime)} – {formatDateTime(appt.endTime)}
                        </p>
                      </div>
                      <Badge variant="outline">{normalizeStatus(appt.status)}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground grid gap-1 md:grid-cols-2">
                      <span>Customer: {appt.customerId}</span>
                      <span>Vehicle: {appt.vehicleId}</span>
                      <span>Created: {formatDateTime(appt.createdAt)}</span>
                      <span>Notes: {appt.notes || "—"}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={submittingId === appt.id}
                        onClick={() => handleUpdateStatus(appt.id, "CONFIRMED")}
                      >
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Mark confirmed
                      </Button>
                      <Button
                        size="sm"
                        disabled={submittingId === appt.id}
                        onClick={() => handleUpdateStatus(appt.id, "IN_PROGRESS")}
                      >
                        Move to in-progress
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={submittingId === appt.id}
                        onClick={() => handleUpdateStatus(appt.id, "CANCELLED")}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
