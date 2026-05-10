import { lazy, Suspense } from "react";
import LayoutShell from "@/ui/components/layouts/LayoutShell";

const Navbar = lazy(
  () => import("@/ui/components/common/navigation/Navbar/Navbar"),
);

export default function MainLayout() {
  return (
    <LayoutShell>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
    </LayoutShell>
  );
}
