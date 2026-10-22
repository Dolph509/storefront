import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getProductCollaborators } from "@/lib/data/collaborators";

export async function MadeTogether({
  productId,
  basePath,
}: {
  productId: string;
  basePath: string;
}) {
  const t = await getTranslations("products");
  const { data } = await getProductCollaborators(productId);
  if (data.length === 0) return null;

  return (
    <section
      data-made-together
      className="border-t border-[#e1e3df] py-8"
      aria-labelledby="made-together-heading"
    >
      <h2
        id="made-together-heading"
        className="mb-4 text-[16px] font-semibold text-[#222]"
      >
        {t("madeTogether")}
      </h2>
      <p className="mb-6 max-w-2xl text-sm text-[#595959]">
        {t("madeTogetherLead")}
      </p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {data.map((credit) => (
          <li
            key={credit.id}
            className="rounded-2xl border border-[#e8e4df] bg-white p-4"
          >
            <p className="font-medium text-[#222]">{credit.display_name}</p>
            {credit.craft_contribution ? (
              <p className="mt-1 text-sm text-[#595959]">
                {credit.craft_contribution}
              </p>
            ) : null}
            {credit.seller_slug ? (
              <Link
                href={`${basePath}/sellers/${credit.seller_slug}`}
                className="mt-3 inline-block text-sm font-semibold text-[#222] underline-offset-4 hover:underline"
              >
                {t("visitStore")}
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
