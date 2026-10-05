import fs from "node:fs";
import path from "node:path";

const dir = path.resolve("messages");
const updates = {
  en: {
    estimatedTax: "Estimated tax",
    taxCalculatedAtCheckout: "Calculated at checkout",
    relatedItemsTitle: "Related items you may like",
    recommendedForYouTitle: "Recommended for you",
    savedForLaterTitle:
      "{count, plural, one {# item saved for later} other {# items saved for later}}",
    savedItem: "Saved item",
    moveToCart: "Move to cart",
    movedToCart: "Moved to cart",
    moveToCartFailed: "Could not move this item to your cart.",
    keepInFavorites: "Keep in favorites",
    removeSaved: "Remove",
    removeSavedFailed: "Could not remove this saved item.",
    viewFavorites: "View your favorites",
    cartAddOnsTitle: "Add items under $30",
  },
  de: {
    estimatedTax: "Geschätzte Steuer",
    taxCalculatedAtCheckout: "Wird im Checkout berechnet",
    relatedItemsTitle: "Ähnliche Artikel, die Ihnen gefallen könnten",
    recommendedForYouTitle: "Für Sie empfohlen",
    savedForLaterTitle:
      "{count, plural, one {# Artikel für später gespeichert} other {# Artikel für später gespeichert}}",
    savedItem: "Gespeicherter Artikel",
    moveToCart: "In den Warenkorb",
    movedToCart: "In den Warenkorb verschoben",
    moveToCartFailed: "Artikel konnte nicht in den Warenkorb gelegt werden.",
    keepInFavorites: "In Favoriten behalten",
    removeSaved: "Entfernen",
    removeSavedFailed: "Gespeicherter Artikel konnte nicht entfernt werden.",
    viewFavorites: "Favoriten anzeigen",
    cartAddOnsTitle: "Artikel unter 30 $ hinzufügen",
  },
  es: {
    estimatedTax: "Impuesto estimado",
    taxCalculatedAtCheckout: "Se calcula al pagar",
    relatedItemsTitle: "Artículos relacionados que te pueden gustar",
    recommendedForYouTitle: "Recomendado para ti",
    savedForLaterTitle:
      "{count, plural, one {# artículo guardado para después} other {# artículos guardados para después}}",
    savedItem: "Artículo guardado",
    moveToCart: "Mover al carrito",
    movedToCart: "Movido al carrito",
    moveToCartFailed: "No se pudo mover este artículo al carrito.",
    keepInFavorites: "Mantener en favoritos",
    removeSaved: "Eliminar",
    removeSavedFailed: "No se pudo eliminar este artículo guardado.",
    viewFavorites: "Ver tus favoritos",
    cartAddOnsTitle: "Añade artículos de menos de 30 $",
  },
  fr: {
    estimatedTax: "Taxe estimée",
    taxCalculatedAtCheckout: "Calculée au paiement",
    relatedItemsTitle: "Articles connexes qui pourraient vous plaire",
    recommendedForYouTitle: "Recommandé pour vous",
    savedForLaterTitle:
      "{count, plural, one {# article enregistré pour plus tard} other {# articles enregistrés pour plus tard}}",
    savedItem: "Article enregistré",
    moveToCart: "Ajouter au panier",
    movedToCart: "Ajouté au panier",
    moveToCartFailed: "Impossible d’ajouter cet article au panier.",
    keepInFavorites: "Garder dans les favoris",
    removeSaved: "Retirer",
    removeSavedFailed: "Impossible de retirer cet article enregistré.",
    viewFavorites: "Voir vos favoris",
    cartAddOnsTitle: "Ajoutez des articles à moins de 30 $",
  },
  pl: {
    estimatedTax: "Szacowany podatek",
    taxCalculatedAtCheckout: "Obliczany przy kasie",
    relatedItemsTitle: "Powiązane produkty, które mogą Ci się spodobać",
    recommendedForYouTitle: "Polecane dla Ciebie",
    savedForLaterTitle:
      "{count, plural, one {# produkt zapisany na później} few {# produkty zapisane na później} many {# produktów zapisanych na później} other {# produktu zapisanego na później}}",
    savedItem: "Zapisany produkt",
    moveToCart: "Przenieś do koszyka",
    movedToCart: "Przeniesiono do koszyka",
    moveToCartFailed: "Nie udało się przenieść produktu do koszyka.",
    keepInFavorites: "Zostaw w ulubionych",
    removeSaved: "Usuń",
    removeSavedFailed: "Nie udało się usunąć zapisanego produktu.",
    viewFavorites: "Zobacz ulubione",
    cartAddOnsTitle: "Dodaj produkty poniżej 30 $",
  },
};

for (const [locale, patch] of Object.entries(updates)) {
  const file = path.join(dir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  data.cart = { ...data.cart, ...patch };
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log("updated", locale);
}
