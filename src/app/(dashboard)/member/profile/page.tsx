import { PageTitle } from "@/components/dashboard/shell";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <>
      <PageTitle title="Profile" description={`Member since ${formatDate(user.createdAt, "MMMM yyyy")}`} />
      <div className="max-w-xl rounded-xl border bg-card p-6"><ProfileForm name={user.name} email={user.email} /></div>
    </>
  );
}
