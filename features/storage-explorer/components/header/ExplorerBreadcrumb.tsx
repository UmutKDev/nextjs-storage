"use client";

import React from "react";
import Breadcrumb from "@/components/Storage/Breadcrumb";
import { useExplorerQuery } from "../../contexts/ExplorerQueryContext";

export default function ExplorerBreadcrumb() {
  const { breadcrumbQuery } = useExplorerQuery();

  return <Breadcrumb items={breadcrumbQuery.data?.Items ?? []} />;
}
