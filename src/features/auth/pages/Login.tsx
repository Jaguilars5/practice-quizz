import { logInfo } from "@app/services/errorLogger";
import { useAuthRedirect } from "@auth/hooks/useAuthRedirect.hook";
import { loginWithGoogle } from "@auth/services";
import { useAuthStore } from "@auth/store";
import { Button } from "@shared/components/ui/Button";
import { Card } from "@shared/components/ui/Card";
import { LogIn } from "lucide-react";

export const Login = () => {
  const {  loading } = useAuthStore();
  useAuthRedirect();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      logInfo(`Login error: ${err}`, "auth");
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm text-center space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            <span className="text-primary-400">Quiz</span>zY
          </h1>
          <p className="text-gray-400 mt-2">Juega y aprende con amigos</p>
        </div>
        <Button onClick={handleLogin} size="lg" className="w-full">
          <LogIn size={20} />
          Ingresar con Google
        </Button>
      </Card>
    </div>
  );
};
