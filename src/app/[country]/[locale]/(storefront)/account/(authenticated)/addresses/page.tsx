import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { AccountEmptyState } from "@/components/account/AccountEmptyState";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { AddressManagement } from "@/components/addresses/AddressManagement";
import type { User } from "@/contexts/AuthContext";
import { getAddresses } from "@/lib/data/addresses";
import { getCustomer } from "@/lib/data/customer";
import { getMarketCountries, resolveMarket } from "@/lib/data/markets";

interface AddressesPageProps {
  params: Promise<{ country: string; locale: string }>;
}

export default async function AddressesPage({ params }: AddressesPageProps) {
  await connection();
  const { country: urlCountry, locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "account",
  });
  const [addressResponse, market, customer] = await Promise.all([
    getAddresses(),
    resolveMarket(urlCountry).catch(() => null),
    getCustomer().catch(() => null),
  ]);

  const countriesResponse = market
    ? await getMarketCountries(market.id).catch(() => ({ data: [] }))
    : { data: [] };

  const addresses = addressResponse.data;
  const countries = countriesResponse.data;
  const user: User | undefined = customer
    ? {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
      }
    : undefined;

  return (
    <div>
      <AccountPageHeader title={t("addresses")} />

      {addresses.length === 0 ? (
        <AccountEmptyState
          illustration="no-addresses"
          title={t("noAddresses")}
          description={t("noAddressesDescription")}
          action={
            <AddressManagement
              initialAddresses={addresses}
              countries={countries}
              showAddButton={true}
              emptyState={true}
              user={user}
            />
          }
        />
      ) : (
        <AddressManagement
          initialAddresses={addresses}
          countries={countries}
          showAddButton={true}
          emptyState={false}
          user={user}
        />
      )}
    </div>
  );
}
