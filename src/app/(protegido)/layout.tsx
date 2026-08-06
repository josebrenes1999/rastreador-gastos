import { redirect } from "next/navigation";
import { auth } from "../../auth";
import ShellProtegido from "../../components/layout/ShellProtegido";

export default async function LayoutProtegido({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <ShellProtegido nombre={session.user.name ?? ""} email={session.user.email ?? ""}>
      {children}
    </ShellProtegido>
  );
}
