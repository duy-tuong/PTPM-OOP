import { redirect } from "next/navigation";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";
import { getMyProfile } from "@/lib/api/customer";
import { ApiError } from "@/lib/api/http";
import { ProfileForm } from "@/components/account/ProfileForm";
import type { CustomerProfileDto } from "@/lib/types/customerAuth";

export const metadata = { title: "Hồ sơ của tôi" };

async function loadProfile(token: string): Promise<CustomerProfileDto> {
  try {
    return await getMyProfile(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }
    throw error;
  }
}

export default async function AccountProfilePage() {
  const token = await getCustomerAccessToken();
  if (!token) {
    redirect("/login");
  }

  const profile = await loadProfile(token);
  return <ProfileForm profile={profile} />;
}
