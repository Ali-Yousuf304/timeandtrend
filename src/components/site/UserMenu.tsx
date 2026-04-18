import { Link, useNavigate } from "@tanstack/react-router";
import { User as UserIcon, Heart, Package, LogOut, Shield, LogIn, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Link
        to="/auth"
        aria-label="Sign in"
        className="rounded-md p-2 text-foreground transition-colors hover:text-[var(--gold)]"
      >
        <UserIcon className="h-6 w-6" />
      </Link>
    );
  }

  const name = user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="rounded-md p-2 text-foreground transition-colors hover:text-[var(--gold)]"
      >
        <UserIcon className="h-6 w-6" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="text-xs text-muted-foreground">Signed in as</div>
          <div className="truncate text-sm font-semibold">{name}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/account">
            <UserIcon className="h-4 w-4" /> My account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account">
            <Package className="h-4 w-4" /> Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/wishlist">
            <Heart className="h-4 w-4" /> Wishlist
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin">
                <Shield className="h-4 w-4" /> Admin panel
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            navigate({ to: "/" });
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SignInLink() {
  return (
    <Link
      to="/auth"
      className="inline-flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-[var(--gold)]"
    >
      <LogIn className="h-4 w-4" /> Sign in
    </Link>
  );
}
