import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { TimeLog } from "@/types/timeLogging";
import { timeLoggingApi } from "@/Api/timeLoggingApi";
import { Check, X, Clock, Search, Filter } from "lucide-react";
import { toast } from "sonner";

export const TimeLoggingPage = () => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [searchTerm, setSearchTerm] = useState("");

  // Rejection dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedLogForRejection, setSelectedLogForRejection] =
    useState<TimeLog | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch pending time logs
  const fetchTimeLogs = async () => {
    try {
      setLoading(true);
      const logs = await timeLoggingApi.getPendingTimeLogs();
      setTimeLogs(logs);
      setFilteredLogs(logs);
    } catch (error) {
      console.error("Error fetching time logs:", error);
      toast.error("Failed to fetch time logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeLogs();
  }, []);

  // Filter logs based on status and search term
  useEffect(() => {
    let filtered = timeLogs;

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((log) => log.approvalStatus === statusFilter);
    }

    // Filter by search term (employee name, project, task)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.employeeName?.toLowerCase().includes(search) ||
          log.projectTitle?.toLowerCase().includes(search) ||
          log.taskName?.toLowerCase().includes(search)
      );
    }

    setFilteredLogs(filtered);
  }, [statusFilter, searchTerm, timeLogs]);

  const handleApprove = async (logId: string) => {
    try {
      await timeLoggingApi.approveTimeLog(logId);
      toast.success("Time log approved successfully");
      fetchTimeLogs(); // Refresh the list
    } catch (error) {
      console.error("Error approving time log:", error);
      toast.error("Failed to approve time log");
    }
  };

  const openRejectDialog = (log: TimeLog) => {
    setSelectedLogForRejection(log);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedLogForRejection) return;

    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await timeLoggingApi.rejectTimeLog(
        selectedLogForRejection.id,
        rejectionReason
      );
      toast.success("Time log rejected");
      setRejectDialogOpen(false);
      setSelectedLogForRejection(null);
      setRejectionReason("");
      fetchTimeLogs(); // Refresh the list
    } catch (error) {
      console.error("Error rejecting time log:", error);
      toast.error("Failed to reject time log");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: "PENDING" | "APPROVED" | "REJECTED") => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            Rejected
          </Badge>
        );
      case "PENDING":
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Pending
          </Badge>
        );
    }
  };

  const totalHours = filteredLogs.reduce((sum, log) => sum + log.hours, 0);
  const pendingCount = timeLogs.filter(
    (log) => log.approvalStatus === "PENDING"
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Time Log Management
          </h1>
          <p className="text-gray-600 mt-1">
            Review and approve employee time logs
          </p>
        </div>
        <div className="flex gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Pending Approval</div>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingCount}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Hours (Filtered)</div>
            <div className="text-2xl font-bold text-blue-600">
              {totalHours.toFixed(2)}
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by employee, project, or task..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Time Logs Table */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Time Logs</h2>
          <Badge className="ml-2">{filteredLogs.length} entries</Badge>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading time logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No time logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {log.employeeName || "Unknown"}
                    </TableCell>
                    <TableCell>{formatDate(log.loggedAt)}</TableCell>
                    <TableCell>{log.projectTitle}</TableCell>
                    <TableCell>{log.taskName}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {log.hours.toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.approvalStatus)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.note || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {log.approvalStatus === "PENDING" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(log.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openRejectDialog(log)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Time Log</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this time log. This will be
              added to the log's notes.
            </DialogDescription>
          </DialogHeader>
          {selectedLogForRejection && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Employee:</span>
                  <span className="text-sm font-medium">
                    {selectedLogForRejection.employeeName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Project:</span>
                  <span className="text-sm font-medium">
                    {selectedLogForRejection.projectTitle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Task:</span>
                  <span className="text-sm font-medium">
                    {selectedLogForRejection.taskName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hours:</span>
                  <span className="text-sm font-medium">
                    {selectedLogForRejection.hours.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Explain why this time log is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Reject Time Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
