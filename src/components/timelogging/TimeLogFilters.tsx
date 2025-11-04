import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X, Calendar } from "lucide-react";
import { Project, FilterOptions } from "@/types/timeLogging";

interface TimeLogFiltersProps {
  projects: Project[];
  onFilterChange: (filters: FilterOptions) => void;
}

export const TimeLogFilters = ({
  projects,
  onFilterChange,
}: TimeLogFiltersProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: "",
    endDate: "",
    projectId: "",
    taskId: "",
    status: "",
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    const emptyFilters: FilterOptions = {
      startDate: "",
      endDate: "",
      projectId: "",
      taskId: "",
      status: "",
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const handlePresetFilter = (preset: "today" | "week" | "month") => {
    const today = new Date();
    const startDate = new Date();

    switch (preset) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(today.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        break;
    }

    const newFilters: FilterOptions = {
      ...filters,
      startDate: startDate.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const selectedProject = projects.find((p) => p.id === filters.projectId);

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Advanced Filters
          </h3>
        </div>

        {/* Quick Preset Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetFilter("today")}
            className="text-xs"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetFilter("week")}
            className="text-xs"
          >
            This Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetFilter("month")}
            className="text-xs"
          >
            This Month
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Start Date */}
        <div>
          <Label htmlFor="startDate" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Start Date
          </Label>
          <Input
            id="startDate"
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            className="mt-1"
          />
        </div>

        {/* End Date */}
        <div>
          <Label htmlFor="endDate" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            End Date
          </Label>
          <Input
            id="endDate"
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Project Filter */}
        <div>
          <Label htmlFor="projectFilter">Project</Label>
          <Select
            value={filters.projectId}
            onValueChange={(value) => handleFilterChange("projectId", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Task Filter (filtered by selected project) */}
        <div>
          <Label htmlFor="taskFilter">Task</Label>
          <Select
            value={filters.taskId}
            onValueChange={(value) => handleFilterChange("taskId", value)}
            disabled={!filters.projectId}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Tasks</SelectItem>
              {selectedProject?.tasks?.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.taskName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div>
          <Label htmlFor="statusFilter">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="TODO">To Do</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mt-4">
        <Button
          variant="outline"
          onClick={handleClearFilters}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Clear All
        </Button>
        <Button onClick={handleApplyFilters} className="gap-2 bg-blue-600">
          <Filter className="w-4 h-4" />
          Apply Filters
        </Button>
      </div>

      {/* Active Filters Display */}
      {(filters.startDate ||
        filters.endDate ||
        filters.projectId ||
        filters.taskId ||
        filters.status) && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.startDate && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                From: {filters.startDate}
              </span>
            )}
            {filters.endDate && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                To: {filters.endDate}
              </span>
            )}
            {filters.projectId && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Project:{" "}
                {projects.find((p) => p.id === filters.projectId)?.title}
              </span>
            )}
            {filters.taskId && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                Task:{" "}
                {
                  selectedProject?.tasks?.find((t) => t.id === filters.taskId)
                    ?.taskName
                }
              </span>
            )}
            {filters.status && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                Status: {filters.status}
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
