import { createElement, type ComponentType } from "react";
import type { RouteObject } from "react-router-dom";

import { RequireAuth } from "@/components/auth/RequireAuth";

import ProjectsListPage from "./ProjectsListPage";
import ProjectCreatePage from "./ProjectCreatePage";
import ProjectDetailsPage from "./ProjectDetailsPage";
import ProjectProgressPage from './ProjectProgressPage';

const withAdminAuth = (Component: ComponentType): RouteObject["element"] =>
  createElement(RequireAuth, {
    roles: ["Admin"],
    children: createElement(Component),
  });

export const getAdminProjectRoutes = (): RouteObject[] => [
  {
    path: "/admin/projects",
    element: withAdminAuth(ProjectsListPage),
  },
  {
    path: "/admin/projects/new",
    element: withAdminAuth(ProjectCreatePage),
  },
  {
    path: "/admin/projects/:id",
    element: withAdminAuth(ProjectDetailsPage),
  },
  {
    path: "/admin/projects/:id/progress",
    element: withAdminAuth(ProjectProgressPage),
  },
];
