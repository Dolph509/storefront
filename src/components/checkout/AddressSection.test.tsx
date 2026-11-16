import type { AddressParams, Cart, Country } from "@spree/sdk";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { User } from "@/contexts/AuthContext";
import { AddressSection } from "./AddressSection";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/hooks/useCountryStates", () => ({
  useCountryStates: () => [[], false],
}));

const cart = {
  id: "cart_test",
  email: "buyer@example.com",
  shipping_address: null,
} as unknown as Cart;

const countries = [{ iso: "US", name: "United States" }] as Country[];

type SaveAddress = (data: {
  email: string;
  shipping_address?: AddressParams;
  shipping_address_id?: string;
}) => Promise<boolean>;

function renderAddressSection(onAutoSave: SaveAddress) {
  return render(
    <AddressSection
      cart={cart}
      countries={countries}
      savedAddresses={[]}
      isAuthenticated={false}
      signInUrl="/account"
      fetchStates={async () => []}
      onEmailBlur={vi.fn()}
      onAutoSave={onAutoSave}
    />,
  );
}

async function enterAddressAndLeaveForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("firstName"), "Dev");
  await user.type(screen.getByLabelText("lastName"), "Buyer");
  await user.type(screen.getByLabelText("address"), "123 Market St");
  await user.type(screen.getByLabelText("city"), "San Francisco");
  await user.type(screen.getByLabelText("stateProvince"), "California");
  await user.type(screen.getByLabelText("zipCode"), "94105");
  fireEvent.blur(screen.getByLabelText("zipCode"), {
    relatedTarget: screen.getByPlaceholderText("emailAddress"),
  });
}

describe("AddressSection autosave", () => {
  it("uses the buyer email when authentication finishes loading", async () => {
    const onAutoSave = vi.fn<SaveAddress>().mockResolvedValue(true);
    const props = {
      countries,
      savedAddresses: [],
      isAuthenticated: true,
      signInUrl: "/account",
      fetchStates: async () => [],
      onEmailBlur: vi.fn(),
      onAutoSave,
    };
    const { rerender } = render(
      <AddressSection {...props} cart={{ ...cart, email: null }} user={null} />,
    );

    rerender(
      <AddressSection
        {...props}
        cart={{ ...cart, email: null }}
        user={{ email: "buyer@example.com" } as User}
      />,
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("emailAddress")).toHaveValue(
        "buyer@example.com",
      );
    });
  });

  it("sends the API country code and accepts a successful save", async () => {
    const onAutoSave = vi.fn<SaveAddress>().mockResolvedValue(true);
    renderAddressSection(onAutoSave);

    await enterAddressAndLeaveForm();

    await waitFor(() => expect(onAutoSave).toHaveBeenCalledOnce());
    expect(onAutoSave.mock.calls[0][0]).toMatchObject({
      email: "buyer@example.com",
      shipping_address: {
        country_code: "US",
        state_name: "California",
        postal_code: "94105",
      },
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it.each([
    ["a rejected save", () => Promise.resolve(false)],
    ["a network failure", () => Promise.reject(new Error("offline"))],
  ])("shows a save error after %s", async (_scenario, save) => {
    const onAutoSave = vi.fn<SaveAddress>(save as SaveAddress);
    renderAddressSection(onAutoSave);

    await enterAddressAndLeaveForm();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "failedToSaveAddress",
    );
  });
});
