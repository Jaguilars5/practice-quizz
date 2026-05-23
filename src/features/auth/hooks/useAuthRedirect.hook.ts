import { ROUTES } from "@app/constants/routes";
import { useAuthStore } from "@auth/store";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAuthRedirect = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(ROUTES.HOME);
  }, [user, navigate]);
};
