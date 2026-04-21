import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user) {
      const rememberMe = localStorage.getItem("motordrive_remember") === "true";
      if (rememberMe) {
        navigate("/dashboard-home", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } else {
      const hasAccount = localStorage.getItem("motordrive_has_account") === "true";
      if (hasAccount) {
        navigate("/login", { replace: true });
      } else {
        window.location.href = "/landing.html";
      }
    }
  }, [user, loading]);

  return null;
}
