import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { useIsAdmin } from "@/ui/hooks";
import LoadingIcon from "../shared/icons/LoadingIcon";

export default function AdminRoute({ children }) {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  if (!authLoaded || adminLoading) {
    return <LoadingIcon />;
  }

  if (!isSignedIn) {
    return <Navigate to="/accedi" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
