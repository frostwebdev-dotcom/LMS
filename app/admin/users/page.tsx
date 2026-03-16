import { requireAdminOrRedirect } from "@/lib/auth/get-session";
import { getAllProfilesWithRoles, getRoles } from "@/services/admin-users-service";
import { createUserAction } from "@/app/actions/admin-users";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import { UpdateRoleForm } from "@/components/admin/UpdateRoleForm";
import { UserManagementForm } from "@/components/admin/UserManagementForm";

export default async function AdminUsersPage() {
  await requireAdminOrRedirect();
  const [profiles, roles] = await Promise.all([
    getAllProfilesWithRoles(),
    getRoles(),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          User management
        </h1>
        <p className="mt-1 text-slate-600 sm:mt-2">
          Add staff or admins, change roles, and remove users.
        </p>
      </header>

      <section aria-labelledby="add-user-heading">
        <h2 id="add-user-heading" className="text-lg font-semibold text-slate-900 mb-4">
          Add user
        </h2>
        <UserManagementForm
          action={createUserAction}
          roles={roles}
          successMessage="User added. They can sign in with the email and password you set."
        />
      </section>

      <section aria-labelledby="users-list-heading">
        <h2 id="users-list-heading" className="text-lg font-semibold text-slate-900 mb-4">
          All users
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Role
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No users yet. Add one above.
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">{profile.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {profile.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <UpdateRoleForm
                        profileId={profile.id}
                        currentRoleId={profile.role_id}
                        roles={roles}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteUserButton userId={profile.id} userEmail={profile.email} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
