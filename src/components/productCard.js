(function (global) {
  'use strict';

  const Luvra = (global.Luvra = global.Luvra || {});

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  Luvra.escapeHtml = escapeHtml;

  Luvra.renderProductCard = function renderProductCard(product, options = {}) {
    const {
      variant = 'collection',
      badgeOverride = null,
      showVariants = variant !== 'featured',
      showFavorite = true,
    } = options;

    const badge = badgeOverride || product.badge;
    const isWaitlist = product.availability === 'waitlist';
    const isFav = Luvra.store.isFavorite(product.id);
    const activeVariant = Luvra.store.getSelectedVariant(product.id);
    const variantsList = Array.isArray(product.variants) ? product.variants : [];
    const detailHref = `product.html?id=${encodeURIComponent(product.id)}`;

    const variantsMarkup =
      showVariants && variantsList.length > 0
        ? `<div class="product-card__variants" role="group" aria-label="Options for ${escapeHtml(product.name)}">
            ${variantsList
              .map((v) => {
                const isSelected = v.label === activeVariant;
                if (v.swatch) {
                  return `<button
                    type="button"
                    class="variant-swatch ${isSelected ? 'is-selected' : ''}"
                    data-select-variant="${escapeHtml(product.id)}"
                    data-variant-label="${escapeHtml(v.label)}"
                    title="${escapeHtml(v.label)}"
                    aria-label="Select ${escapeHtml(v.label)}"
                    aria-pressed="${isSelected}"
                  ><span style="background-color: ${escapeHtml(v.swatch)}"></span></button>`;
                }
                return `<button
                  type="button"
                  class="variant-pill ${isSelected ? 'is-selected' : ''}"
                  data-select-variant="${escapeHtml(product.id)}"
                  data-variant-label="${escapeHtml(v.label)}"
                  aria-pressed="${isSelected}"
                >${escapeHtml(v.label)}</button>`;
              })
              .join('')}
          </div>`
        : '';

    return `
      <article class="product-card ${isWaitlist ? 'is-waitlist' : ''}" data-product-id="${escapeHtml(product.id)}">
        <div class="product-card__media-wrap">
          <a href="${detailHref}" class="product-card__media" aria-label="View ${escapeHtml(product.name)} details">
            <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" />
            ${badge ? `<span class="product-card__badge">${escapeHtml(badge)}</span>` : ''}
          </a>
          ${
            showFavorite
              ? `<button
                  type="button"
                  class="product-card__fav ${isFav ? 'is-favorited' : ''}"
                  data-toggle-favorite="${escapeHtml(product.id)}"
                  aria-label="${isFav ? 'Remove from favorites' : 'Save to favorites'}"
                  aria-pressed="${isFav}"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                    <path d="M12 20.5s-7.5-4.7-9.4-9.2C1.2 7.9 3.5 4.5 7 4.5c2 0 3.7 1 5 2.6 1.3-1.6 3-2.6 5-2.6 3.5 0 5.8 3.4 4.4 6.8-1.9 4.5-9.4 9.2-9.4 9.2Z"/>
                  </svg>
                </button>`
              : ''
          }
        </div>
        <div class="product-card__body">
          <div class="product-card__head">
            <h3 class="product-card__title">
              <a href="${detailHref}" class="product-card__title-link">${escapeHtml(product.name)}</a>
            </h3>
            <span class="product-card__price">$${product.price}</span>
          </div>
          ${
            variant === 'featured'
              ? `<p class="product-card__desc">${escapeHtml(product.shortDesc)}</p>`
              : `<p class="product-card__category">
                  <a href="collection.html?category=${escapeHtml(product.category)}">${escapeHtml(product.categoryLabel)}</a>
                  ${isWaitlist ? '<span class="availability-tag"> · Waitlist</span>' : ''}
                </p>`
          }
          ${variantsMarkup}
          <div class="product-card__actions">
            ${
              isWaitlist
                ? `<a href="${detailHref}" class="btn btn--outline is-waitlist-btn">
                    View Details
                  </a>`
                : `<button type="button" class="btn btn--outline" data-add-to-bag="${escapeHtml(product.id)}">
                    Add to Bag
                  </button>`
            }
            ${
              variant !== 'featured'
                ? `<button type="button" class="product-card__quickview" data-quickview="${escapeHtml(product.id)}" aria-label="Quick view ${escapeHtml(product.name)}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>`
                : ''
            }
          </div>
        </div>
      </article>
    `;
  };

  Luvra.renderEditorialCard = function renderEditorialCard(entry) {
    const detailHref = `product.html?id=${encodeURIComponent(entry.id)}`;
    return `
      <article class="product-card">
        <div class="product-card__media-wrap">
          <a href="${detailHref}" class="product-card__media" aria-label="Explore ${escapeHtml(entry.title)}">
            <img src="${escapeHtml(entry.image)}" alt="${escapeHtml(entry.title)}" loading="lazy" decoding="async" />
            <span class="product-card__badge">${escapeHtml(entry.badge)}</span>
          </a>
        </div>
        <div class="product-card__body">
          <div class="product-card__head">
            <h3 class="product-card__title">
              <a href="${detailHref}" class="product-card__title-link">${escapeHtml(entry.title)}</a>
            </h3>
          </div>
          <p class="product-card__desc">${escapeHtml(entry.desc)}</p>
          <div class="product-card__actions">
            <button type="button" class="featured-explore-link" data-filter-jump="${escapeHtml(entry.targetCategory)}">
              ${escapeHtml(entry.ctaLabel)}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </article>
    `;
  };
})(window);
