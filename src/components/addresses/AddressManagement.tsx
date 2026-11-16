"use client";

import type { Address, AddressParams, Country } from "@spree/sdk";
import { MapPin, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import {
  SettingsEmpty,
  SettingsList,
  SettingsListItem,
  SettingsSection,
  SettingsStack,
} from "@/components/account/SettingsSection";
import { AddressEditModal } from "@/components/checkout/AddressEditModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { User } from "@/contexts/AuthContext";
import {
  createAddress,
  deleteAddress,
  updateAddress,
} from "@/lib/data/addresses";
import { getCountry } from "@/lib/data/countries";

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
}

function AddressCard({ address, onEdit, onDelete }: AddressCardProps) {
  const t = useTranslations("address");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  const lines = [
    address.company,
    address.address1,
    address.address2,
    [address.city, address.state_text, address.postal_code]
      .filter(Boolean)
      .join(", "),
    address.country_name,
    address.phone,
  ].filter(Boolean);

  return (
    <SettingsListItem
      icon={<MapPin className="size-4" aria-hidden="true" />}
      title={address.full_name}
      description={lines.join(" · ")}
      action={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            {t("edit")}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={deleting}>
                {deleting ? t("deleting") : t("delete")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("deleteAddressTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("deleteAddressConfirmation")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => void handleDelete()}
                >
                  {t("delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      }
    />
  );
}

interface AddressManagementProps {
  initialAddresses: Address[];
  countries: Country[];
  showAddButton: boolean;
  emptyState: boolean;
  user?: User | null;
  title?: string;
  description?: string;
}

export function AddressManagement({
  initialAddresses,
  countries,
  showAddButton,
  emptyState,
  user,
  title,
  description,
}: AddressManagementProps) {
  const t = useTranslations("address");
  const ta = useTranslations("account");
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const sectionTitle = title || ta("addresses");
  const sectionDescription =
    description ??
    (addresses.length === 0
      ? ta("noAddressesDescription")
      : ta("addressesDescription"));

  const fetchStates = useCallback(async (countryIso: string) => {
    try {
      const country = await getCountry(countryIso);
      return country?.states ?? [];
    } catch {
      return [];
    }
  }, []);

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleSave = async (data: AddressParams, id?: string) => {
    if (id) {
      const result = await updateAddress(id, data);
      if (!result.success) {
        throw new Error(result.error);
      }
      if (result.address) {
        setAddresses((prev) =>
          prev.map((addr) => (addr.id === id ? result.address! : addr)),
        );
      }
    } else {
      const result = await createAddress(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      if (result.address) {
        setAddresses((prev) => [...prev, result.address!]);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteAddress(id);
    if (result.success) {
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    } else {
      alert(t("failedToDeleteAddress"));
    }
  };

  return (
    <SettingsStack>
      <SettingsSection
        title={sectionTitle}
        description={sectionDescription}
        footer={
          showAddButton ? (
            <div className="flex justify-end">
              <Button type="button" onClick={handleAdd}>
                <Plus className="size-4" aria-hidden="true" />
                {emptyState && addresses.length === 0
                  ? t("addFirstAddress")
                  : t("addAddress")}
              </Button>
            </div>
          ) : null
        }
      >
        {addresses.length === 0 ? (
          <SettingsEmpty>{ta("noAddresses")}</SettingsEmpty>
        ) : (
          <SettingsList>
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={() => handleEdit(address)}
                onDelete={() => void handleDelete(address.id)}
              />
            ))}
          </SettingsList>
        )}
      </SettingsSection>

      {modalOpen ? (
        <AddressEditModal
          address={editingAddress}
          countries={countries}
          fetchStates={fetchStates}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
          user={!editingAddress ? user : undefined}
        />
      ) : null}
    </SettingsStack>
  );
}
