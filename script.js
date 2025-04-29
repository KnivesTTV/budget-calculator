// script.js
document.addEventListener("DOMContentLoaded", function () {
  // Cached DOM elements
  const incomeInput         = document.getElementById("income");
  const allowanceInput      = document.getElementById("non-taxable-allowance");
  const form                = document.getElementById("budget-form");
  const precisionCheckbox   = document.getElementById("precise-distribution-of-calculation");
  const resultDiv           = document.getElementById("result");

  // 1) Enforce numeric-only + live commas
  [incomeInput, allowanceInput].forEach((el) => {
    el.setAttribute("inputmode", "numeric");
    el.setAttribute("pattern", "\\d*");
    el.addEventListener("input", () => formatNumericInput(el));
  });

  // 2) Debounce rapid typing
  const debouncedCalc = (() => {
    let t;
    return () => {
      clearTimeout(t);
      t = setTimeout(calculateBudget, 100);
    };
  })();

  form.addEventListener("input", debouncedCalc);
  precisionCheckbox.addEventListener("change", calculateBudget);

  // Strip non-digits, add commas, then recalc
  function formatNumericInput(input) {
    let raw = input.value.replace(/,/g, "").replace(/\D+/g, "");
    if (!raw) return input.value = "";
    input.value = Number(raw).toLocaleString("en-PH");
    calculateBudget();
  }

  // Currency formatter
  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Tax, SSS, PhilHealth, PAG-IBIG calculators
  function calculateWithholdingTax(taxableIncome) {
    const taxBrackets = [
      { limit: 20833.33, rate: 0.0,  base: 0 },
      { limit: 33333.33, rate: 0.15, base: 20833.33 },
      { limit: 66666.66, rate: 0.2,  base: 33333.33 },
      { limit: 166666.66, rate: 0.25, base: 66666.66 },
      { limit: 666666.66, rate: 0.3,  base: 166666.66 },
      { limit: Infinity,   rate: 0.35, base: 666666.66 },
    ];
    let totalTax = 0;
    for (const bracket of taxBrackets) {
      if (taxableIncome <= bracket.limit) {
        totalTax += (taxableIncome - bracket.base) * bracket.rate;
        break;
      } else {
        totalTax += (bracket.limit - bracket.base) * bracket.rate;
      }
    }
    return Math.max(totalTax, 0);
  }

  function calculateSSSContribution(basicSalary) {
    if (basicSalary <= 0) return 0;
    return Math.min(Math.max(basicSalary * 0.045, 400), 1750);
  }

  function calculatePhilHealthContribution(basicSalary) {
    if (basicSalary <= 0) return 0;
    return Math.min(Math.max(basicSalary * 0.025, 200), 1600);
  }

  function calculatePagIbigContribution(basicSalary) {
    return basicSalary > 0 ? 200 : 0;
  }

  // Main budgeting logic
  function calculateBudget() {
    const basicSalary         = parseFloat(incomeInput.value.replace(/,/g, ""))    || 0;
    const nonTaxableAllowance = parseFloat(allowanceInput.value.replace(/,/g, "")) || 0;
    const usePreciseValues    = precisionCheckbox.checked;

    const monthlySalary        = basicSalary + nonTaxableAllowance;
    const sssContribution      = calculateSSSContribution(basicSalary);
    const philHealthContribution = calculatePhilHealthContribution(basicSalary);
    const pagIbigContribution  = calculatePagIbigContribution(basicSalary);

    const totalContrib       = sssContribution + philHealthContribution + pagIbigContribution;
    const taxableIncome      = monthlySalary - totalContrib;
    const withholdingTax     = calculateWithholdingTax(taxableIncome);
    const totalDeductions    = withholdingTax + totalContrib;
    const netPay             = Math.max(0, monthlySalary - totalDeductions);

    // Fixed allocations on gross income
    const fixedAllocations = [
      { name: "Housing", percentage: 0.2 },
      { name: "Transportation", percentage: 0.08 },
      { name: "Savings, Investing, & Debt Payments", percentage: 0.3 },
    ];
    let fixedTotal = 0;
    const fixedCategoryAmounts = fixedAllocations.map(cat => {
      const amount = usePreciseValues
        ? monthlySalary * cat.percentage
        : Math.round(monthlySalary * cat.percentage);
      fixedTotal += amount;
      return { name: cat.name, amount };
    });

    const remainingNetPay = Math.max(0, netPay - fixedTotal);

    // Variable allocations on remaining net pay
    const variableAllocations = [
      { name: "Food", percentage: 0.15 },
      { name: "Utilities", percentage: 0.09 },
      { name: "Insurance", percentage: 0.05 },
      { name: "Medical & Healthcare", percentage: 0.07 },
      { name: "Personal & Recreation", percentage: 0.03 },
      { name: "Miscellaneous", percentage: 0.03 },
    ];
    const totalVariablePercentage = variableAllocations
      .reduce((sum, cat) => sum + cat.percentage, 0);

    const variableCategoryAmounts = variableAllocations.map(cat => {
      const share = cat.percentage / totalVariablePercentage;
      const amount = usePreciseValues
        ? remainingNetPay * share
        : Math.round(remainingNetPay * share);
      return { name: cat.name, amount };
    });

    // Adjust for rounding
    const totalVariableAllocated = variableCategoryAmounts
      .reduce((sum, cat) => sum + cat.amount, 0);
    const roundingDifference = remainingNetPay - totalVariableAllocated;
    if (variableCategoryAmounts.length > 0) {
      variableCategoryAmounts[variableCategoryAmounts.length - 1].amount += roundingDifference;
    }

    // Build HTML
    let resultHTML = '<div class="result">';
    resultHTML += `<h3>Income & Deductions:</h3>
      <div class="category"><span>Gross Income:</span> <span>${formatCurrency(monthlySalary)}</span></div>
      <div class="category"><span>Withholding Tax:</span> <span>${formatCurrency(withholdingTax)}</span></div>
      <div class="category"><span>SSS Contribution:</span> <span>${formatCurrency(sssContribution)}</span></div>
      <div class="category"><span>PhilHealth Contribution:</span> <span>${formatCurrency(philHealthContribution)}</span></div>
      <div class="category"><span>PAG-IBIG Contribution:</span> <span>${formatCurrency(pagIbigContribution)}</span></div>
      <div class="category"><span>Net Pay:</span> <span>${formatCurrency(netPay)}</span></div>`;

    resultHTML += '<h3>Fixed Allocations (Based on Gross Income):</h3>';
    fixedCategoryAmounts.forEach(cat => {
      resultHTML += `<div class="category"><span>${cat.name}:</span> <span>${formatCurrency(cat.amount)}</span></div>`;
    });
    resultHTML += `<div class="category"><span>After Fixed Allocations:</span> <span>${formatCurrency(remainingNetPay)}</span></div>`;

    resultHTML += '<h3>Remaining Budget Categories (Based on Net Pay):</h3>';
    variableCategoryAmounts.forEach(cat => {
      resultHTML += `<div class="category"><span>${cat.name}:</span> <span>${formatCurrency(cat.amount)}</span></div>`;
    });
    resultHTML += '</div>';

    resultDiv.innerHTML = resultHTML;
  }

  // Initial render
  calculateBudget();
});
