import { redirect } from "next/navigation";
import { auth } from "../../auth";
import Sidebar from "../../components/Sidebar";
import styles from "./layout.module.css";

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
    <div className={styles.app}>
      <Sidebar nombre={session.user.name ?? ""} email={session.user.email ?? ""} />
      <div className={styles.contenido}>{children}</div>
    </div>
  );
}
