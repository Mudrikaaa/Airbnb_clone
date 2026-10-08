"use client";

import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/auth-context";

/** Mock login: pick one of the seeded users. Opened from the profile menu or any action that needs a user. */
export function LoginModal() {
  const { users, loginModalOpen, closeLogin, loginAs } = useAuth();

  return (
    <Modal open={loginModalOpen} onClose={closeLogin} title="Log in or sign up">
      <h3 className="text-[22px] font-semibold">Welcome to Airbnb</h3>
      <p className="mt-1 text-sm text-muted">
        This is a demo — authentication is mocked. Choose a seeded account to continue.
      </p>
      <ul className="mt-6 divide-y divide-line-light rounded-xl border border-line">
        {users.map((u) => (
          <li key={u.id}>
            <button
              type="button"
              onClick={() => {
                loginAs(u.id);
                toast.success(`Welcome back, ${u.name.split(" ")[0]}`);
              }}
              className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-subtle"
            >
              <Avatar user={u} size={40} />
              <span className="flex-1">
                <span className="block text-sm font-medium">{u.name}</span>
                <span className="block text-sm text-muted">
                  {u.is_host ? (u.is_superhost ? "Superhost" : "Host") : "Guest"}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
