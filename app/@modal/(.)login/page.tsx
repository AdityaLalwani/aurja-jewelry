import { LoginDialog } from "@/components/LoginDialog";
import { LoginExperience } from "@/app/components/auth/LoginExperience";

export default function LoginModalPage() {
  return (
    <LoginDialog>
      <LoginExperience compact />
    </LoginDialog>
  );
}
