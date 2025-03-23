document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("budget-form");
  const precisionCheckbox = document.getElementById("precise-distribution-of-calculation");
  const resultDiv = document.getElementById("result");

  form.addEventListener("input", calculateBudget);
  precisionCheckbox.addEventListener("change", calculateBudget);

  function formatCurrency(amount, isWholeNumber) {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: isWholeNumber ? 0 : 2,
      maximumFractionDigits: isWholeNumber ? 0 : 2,
    }).format(amount);
  }

  function calculateWithholdingTax(taxableIncome) {
    const taxBrackets = [
      { limit: 20833.33, rate: 0.0, base: 0 },
      { limit: 33333.33, rate: 0.15, base: 20833.33 },
      { limit: 66666.66, rate: 0.2, base: 33333.33 },
      { limit: 166666.66, rate: 0.25, base: 66666.66 },
      { limit: 666666.66, rate: 0.3, base: 166666.66 },
      { limit: Infinity, rate: 0.35, base: 666666.66 },
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
    return Math.min(Math.max(basicSalary * 0.045, 400), 1750);
  }

  function calculatePhilHealthContribution(basicSalary) {
    return Math.min(Math.max(basicSalary * 0.025, 200), 1600);
  }

  function calculatePagIbigContribution() {
    return 200;
  }

  function calculateBudget() {
    const basicSalary = parseFloat(document.getElementById("income").value) || 0;
    const nonTaxableAllowance = parseFloat(document.getElementById("non-taxable-allowance").value) || 0;
    const usePreciseValues = precisionCheckbox.checked;

    const monthlySalary = basicSalary + nonTaxableAllowance;
    const sssContribution = calculateSSSContribution(basicSalary);
    const philHealthContribution = calculatePhilHealthContribution(basicSalary);
    const pagIbigContribution = calculatePagIbigContribution();

    const totalContributions = sssContribution + philHealthContribution + pagIbigContribution;
    const taxableIncome = monthlySalary - totalContributions;
    const withholdingTax = calculateWithholdingTax(taxableIncome);
    const totalDeductions = withholdingTax + totalContributions;
    const netPay = Math.max(0, monthlySalary - totalDeductions);

    const fixedAllocations = [
      { name: "Housing", percentage: 0.2 },
      { name: "Transportation", percentage: 0.08 },
      { name: "Savings, Investing, & Debt Payments", percentage: 0.3 },
    ];

    let fixedTotal = 0;
    let fixedCategoryAmounts = fixedAllocations.map((cat) => {
      let amount = monthlySalary * cat.percentage;
      amount = usePreciseValues ? amount : Math.round(amount);
      fixedTotal += amount;
      return { name: cat.name, amount: amount };
    });

    let remainingNetPay = Math.max(0, netPay - fixedTotal);
    const variableAllocations = [
      { name: "Food", percentage: 0.15 },
      { name: "Utilities", percentage: 0.09 },
      { name: "Insurance", percentage: 0.05 },
      { name: "Medical & Healthcare", percentage: 0.07 },
      { name: "Personal & Recreation", percentage: 0.03 },
      { name: "Miscellaneous", percentage: 0.03 },
    ];

    const totalVariablePercentage = variableAllocations.reduce((total, cat) => total + cat.percentage, 0);
    let variableCategoryAmounts = variableAllocations.map((cat) => {
      let amount = remainingNetPay * (cat.percentage / totalVariablePercentage);
      amount = usePreciseValues ? amount : Math.round(amount);
      return { name: cat.name, amount: amount };
    });

    let resultHTML = '<div class="result">';

    resultHTML += `<h3>Income & Deductions:</h3>`;
    resultHTML += `
    
      <div class="category"><span>Gross Income:</span> <span>${formatCurrency(monthlySalary, false)}</span></div>
      <div class="category"><span>Withholding Tax:</span> <span>${formatCurrency(withholdingTax, false)}</span></div>
      <div class="category"><span>SSS Contribution:</span> <span>${formatCurrency(sssContribution, false)}</span></div>
      <div class="category"><span>PhilHealth Contribution:</span> <span>${formatCurrency(philHealthContribution, false)}</span></div>
      <div class="category"><span>PAG-IBIG Contribution:</span> <span>${formatCurrency(pagIbigContribution, false)}</span></div>
      <div class="category"><span>Net Pay:</span> <span>${formatCurrency(netPay, false)}</span></div>
    `;

    resultHTML += '<h3>Fixed Allocations (Based on Gross Income):</h3>';
    fixedCategoryAmounts.forEach((category) => {
      resultHTML += `<div class="category"><span>${category.name}:</span> <span>${formatCurrency(category.amount, false)}</span></div>`;
    });

    resultHTML += '<h3>Remaining Budget Categories (Based on Net Pay):</h3>';
    variableCategoryAmounts.forEach((category) => {
      resultHTML += `<div class="category"><span>${category.name}:</span> <span>${formatCurrency(category.amount, false)}</span></div>`;
    });

    resultHTML += '</div>';
    resultDiv.innerHTML = resultHTML;
  }

  calculateBudget();
});