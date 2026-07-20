import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/certificados")({
  head: () => ({
    meta: [
      { title: "Meus Certificados — FCIA Academy" },
      { name: "description", content: "Certificados conquistados na FCIA Academy." },
    ],
  }),
  component: CertificatesLayout,
});

function CertificatesLayout() {
  return <Outlet />;
}
