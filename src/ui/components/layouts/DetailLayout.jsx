import LayoutShell from "@/ui/components/layouts/LayoutShell";

/**
 * Detail pages intentionally use the shared shell without importing Navbar.
 */
export default function DetailLayout() {
  return <LayoutShell />;
}
