import React from "react";
import { Metadata } from "next";
import { PartnerProfile } from "@/components/admin/partners/PartnerProfile";

export const metadata: Metadata = {
  title: "Partner Details | Rhino Air Admin",
  description:
    "Detailed view of a partner profile and their ServiceTitan customers",
};

export default async function PartnerDetailsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const resolvedParams = await params;

  return (
    <div className="page-wrapper" style={{ padding: "24px" }}>
      <PartnerProfile companyId={resolvedParams.companyId} />
    </div>
  );
}
