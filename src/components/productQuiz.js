(function (global) {
  'use strict';

  const Luvra = (global.Luvra = global.Luvra || {});

  function escapeHtml(str) {
    return Luvra.escapeHtml ? Luvra.escapeHtml(str) : String(str);
  }

  const QUIZ_STEPS = [
    {
      id: 'category',
      kicker: 'Step 1 · Shopping Focus',
      question: 'Who or what are you browsing for?',
      hint: 'Choose one category preference, or skip to stay open to everything.',
      multi: false,
      options: [
        { value: 'for-her', label: 'For Her', desc: 'Solo contours and subtle warmth' },
        { value: 'for-him', label: 'For Him', desc: 'Weighted, sculpted precision' },
        { value: 'couples', label: 'Couples', desc: 'Synchronized shared silhouettes' },
        { value: 'wellness', label: 'Wellness', desc: 'Botanical body oils and mists' },
        { value: 'any', label: 'Open to Any', desc: 'Show recommendations across all categories' },
      ],
    },
    {
      id: 'material',
      kicker: 'Step 2 · Finish & Material',
      question: 'Which surface or vessel appeals most?',
      hint: 'Pick a preferred material finish, or skip this step.',
      multi: false,
      options: [
        { value: 'Matte Silicone', label: 'Matte Silicone', desc: 'Soft-touch seamless exteriors' },
        { value: 'Brushed Alloy', label: 'Brushed Alloy', desc: 'Champagne-toned weighted hardware' },
        { value: 'Amber Glass', label: 'Amber Glass & Botanicals', desc: 'Dark apothecary oils and mists' },
        { value: 'any', label: 'No Preference', desc: 'Include any material' },
      ],
    },
    {
      id: 'features',
      kicker: 'Step 3 · Product Features',
      question: 'Which features matter most to you?',
      hint: 'Select as many as you like, or skip to continue.',
      multi: true,
      options: [
        { value: 'Whisper Quiet', label: 'Whisper Quiet', desc: 'Tuned for low-acoustic resonance' },
        { value: 'Warming', label: 'Warming', desc: 'Gentle ambient warmth' },
        { value: 'Dual Motor', label: 'Dual Motor', desc: 'Independent synchronized zones' },
        { value: 'USB-C Rechargeable', label: 'USB-C Rechargeable', desc: 'Cordless magnetic charging' },
        { value: 'Silicone-Safe', label: 'Silicone-Safe Formula', desc: 'Compatible botanical blends' },
        { value: 'Sealed Housing', label: 'Sealed Housing', desc: 'Easy to rinse and clean' },
      ],
    },
    {
      id: 'price',
      kicker: 'Step 4 · Budget',
      question: 'What price range feels right?',
      hint: 'Select a target range or skip to see all price points.',
      multi: false,
      options: [
        { value: 'under-75', label: 'Under $75', desc: 'Botanical oils and mists' },
        { value: '75-150', label: '$75 – $150', desc: 'Signature solo pieces' },
        { value: 'over-150', label: '$150+', desc: 'Dual-motor and keepsake sets' },
        { value: 'any', label: 'Any Budget', desc: 'Show best matches regardless of price' },
      ],
    },
  ];

  Luvra.scoreQuizMatches = function scoreQuizMatches(answers, limit = 3) {
    const priceRange = Luvra.CATALOG.filterOptions.priceRanges.find(
      (r) => r.id === answers.price
    );
    const hasCategory = answers.category && answers.category !== 'any';
    const hasMaterial = answers.material && answers.material !== 'any';
    const selectedFeatures = Array.isArray(answers.features) ? answers.features : [];
    const hasPrice = Boolean(priceRange);

    const hasAnyPreference =
      hasCategory || hasMaterial || selectedFeatures.length > 0 || hasPrice;

    const scored = Luvra.CATALOG.products.map((product) => {
      let score = 0;
      const reasons = [];

      if (product.availability === 'in-stock') {
        score += 2;
      }

      if (hasCategory && product.category === answers.category) {
        score += 10;
        reasons.push(`${product.categoryLabel} category`);
      }

      if (hasMaterial && (product.materials || []).includes(answers.material)) {
        score += 6;
        reasons.push(`${answers.material} finish`);
      }

      const matchedFeatures = selectedFeatures.filter((f) =>
        (product.features || []).includes(f)
      );
      if (matchedFeatures.length > 0) {
        score += matchedFeatures.length * 4;
        reasons.push(matchedFeatures.join(' + '));
      }

      if (hasPrice && product.price >= priceRange.min && product.price <= priceRange.max) {
        score += 5;
        reasons.push(`${priceRange.label} budget`);
      }

      // Tie-breaker by popularity
      score += (product.popularity || 0) * 0.01;

      const explanation = !hasAnyPreference
        ? `Curated Luvra favorite in ${product.categoryLabel} featuring ${(product.materials || []).slice(0, 2).join(' and ')}.`
        : reasons.length > 0
          ? `Matches your ${reasons.join(', ')}.`
          : `Closest available Luvra recommendation in ${product.categoryLabel}.`;

      return { product, score, explanation, matchCount: reasons.length };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  };

  Luvra.initProductQuiz = function initProductQuiz() {
    const rootEl = document.getElementById('quiz-root');
    if (!rootEl) return;

    const state = {
      stepIndex: 0,
      completed: false,
      answers: {
        category: null,
        material: null,
        features: [],
        price: null,
      },
    };

    function getSummaryPills() {
      const pills = [];
      if (state.answers.category && state.answers.category !== 'any') {
        const opt = QUIZ_STEPS[0].options.find((o) => o.value === state.answers.category);
        if (opt) pills.push(`Category: ${opt.label}`);
      }
      if (state.answers.material && state.answers.material !== 'any') {
        pills.push(`Material: ${state.answers.material}`);
      }
      state.answers.features.forEach((f) => pills.push(`Feature: ${f}`));
      if (state.answers.price && state.answers.price !== 'any') {
        const opt = QUIZ_STEPS[3].options.find((o) => o.value === state.answers.price);
        if (opt) pills.push(`Budget: ${opt.label}`);
      }
      return pills;
    }

    function renderQuizStep() {
      const step = QUIZ_STEPS[state.stepIndex];
      const isLast = state.stepIndex === QUIZ_STEPS.length - 1;
      const currentVal = state.answers[step.id];
      const hasSelection = step.multi
        ? Array.isArray(currentVal) && currentVal.length > 0
        : Boolean(currentVal);

      rootEl.innerHTML = `
        <div class="quiz-card" aria-live="polite">
          <div class="quiz-progress">
            <div class="quiz-steps" role="progressbar" aria-valuenow="${state.stepIndex + 1}" aria-valuemin="1" aria-valuemax="${QUIZ_STEPS.length}" aria-label="Quiz progress">
              ${QUIZ_STEPS.map(
                (_, i) =>
                  `<span class="quiz-step-dot ${i < state.stepIndex ? 'is-complete' : i === state.stepIndex ? 'is-current' : ''}"></span>`
              ).join('')}
            </div>
            <span class="quiz-step-count">Step ${state.stepIndex + 1} of ${QUIZ_STEPS.length}</span>
          </div>

          <span class="kicker">${escapeHtml(step.kicker)}</span>
          <h2 class="quiz-question__title">${escapeHtml(step.question)}</h2>
          <p class="quiz-question__hint">${escapeHtml(step.hint)}</p>

          <div
            class="quiz-options"
            role="${step.multi ? 'group' : 'radiogroup'}"
            aria-label="${escapeHtml(step.question)}"
          >
            ${step.options
              .map((opt) => {
                const isSelected = step.multi
                  ? Array.isArray(currentVal) && currentVal.includes(opt.value)
                  : currentVal === opt.value;
                return `
                  <button
                    type="button"
                    class="quiz-option ${isSelected ? 'is-selected' : ''}"
                    data-quiz-option="${escapeHtml(opt.value)}"
                    aria-pressed="${isSelected}"
                  >
                    <span class="quiz-option__label">${escapeHtml(opt.label)}</span>
                    <span class="quiz-option__desc">${escapeHtml(opt.desc)}</span>
                  </button>
                `;
              })
              .join('')}
          </div>

          <div class="quiz-footer">
            <button
              type="button"
              class="quiz-btn-ghost"
              id="quiz-back-btn"
              ${state.stepIndex === 0 ? 'disabled' : ''}
            >
              ← Back
            </button>

            <div class="quiz-footer__right">
              <button type="button" class="text-link" id="quiz-skip-step-btn">
                Skip this step →
              </button>
              <button type="button" class="btn btn--primary" id="quiz-next-btn">
                ${isLast ? 'See Matches →' : hasSelection ? 'Continue →' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      `;

      rootEl.querySelectorAll('[data-quiz-option]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-quiz-option');
          if (step.multi) {
            const list = Array.isArray(state.answers[step.id]) ? state.answers[step.id] : [];
            state.answers[step.id] = list.includes(val)
              ? list.filter((item) => item !== val)
              : [...list, val];
          } else {
            state.answers[step.id] = state.answers[step.id] === val ? null : val;
          }
          renderQuizStep();
        });
      });

      const backBtn = document.getElementById('quiz-back-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          if (state.stepIndex > 0) {
            state.stepIndex -= 1;
            renderQuizStep();
          }
        });
      }

      const skipStepBtn = document.getElementById('quiz-skip-step-btn');
      if (skipStepBtn) {
        skipStepBtn.addEventListener('click', () => {
          state.answers[step.id] = step.multi ? [] : null;
          advanceStep();
        });
      }

      const nextBtn = document.getElementById('quiz-next-btn');
      if (nextBtn) {
        nextBtn.addEventListener('click', advanceStep);
      }
    }

    function advanceStep() {
      if (state.stepIndex < QUIZ_STEPS.length - 1) {
        state.stepIndex += 1;
        renderQuizStep();
      } else {
        state.completed = true;
        renderResults();
      }
    }

    function renderResults() {
      const matches = Luvra.scoreQuizMatches(state.answers, 3);
      const summaryPills = getSummaryPills();

      rootEl.innerHTML = `
        <div class="quiz-results-head">
          <div>
            <span class="kicker">Tailored Recommendations</span>
            <h2 class="section-title">Your Luvra <em>Matches</em></h2>
            <p class="section-subtitle">
              ${
                summaryPills.length
                  ? 'Selected based on your shopping preferences and desired features.'
                  : 'Showing curated Luvra signatures across our collection.'
              }
            </p>
          </div>

          <div class="quiz-results-actions">
            <button type="button" class="quiz-btn-ghost" id="quiz-edit-btn">
              Edit Answers
            </button>
            <button type="button" class="quiz-btn-ghost" id="quiz-restart-btn">
              Restart Quiz
            </button>
            <a href="shop.html" class="btn btn--primary">Browse Full Shop →</a>
          </div>
        </div>

        ${
          summaryPills.length
            ? `<div class="quiz-summary-pills" aria-label="Your selected preferences">
                ${summaryPills
                  .map((p) => `<span class="quiz-summary-pill">${escapeHtml(p)}</span>`)
                  .join('')}
              </div>`
            : ''
        }

        <div class="quiz-matches-grid">
          ${matches
            .map(
              (entry) => `
            <div class="quiz-match-item">
              <div class="quiz-match-reason">
                <strong>Why it matches:</strong> ${escapeHtml(entry.explanation)}
              </div>
              ${Luvra.renderProductCard(entry.product, { variant: 'shop' })}
            </div>
          `
            )
            .join('')}
        </div>
      `;

      const editBtn = document.getElementById('quiz-edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          state.completed = false;
          state.stepIndex = 0;
          renderQuizStep();
        });
      }

      const restartBtn = document.getElementById('quiz-restart-btn');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          state.completed = false;
          state.stepIndex = 0;
          state.answers = { category: null, material: null, features: [], price: null };
          renderQuizStep();
        });
      }
    }

    const skipAllBtn = document.getElementById('quiz-skip-all-btn');
    if (skipAllBtn) {
      skipAllBtn.addEventListener('click', () => {
        state.completed = true;
        renderResults();
      });
    }

    Luvra.store.subscribe(() => {
      if (state.completed) {
        renderResults();
      }
    });

    renderQuizStep();
  };
})(window);
