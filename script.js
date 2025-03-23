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
        minimumFractionDigits: isWholeNumber ? 2 : 2, 
        maximumFractionDigits: isWholeNumber ? 2 : 2
    }).format(amount);
  }

  function calculateWithholdingTax(taxableIncome) {
      const taxBrackets = [
          { limit: 20833.33, rate: 0.00, base: 0 },
          { limit: 33333.33, rate: 0.15, base: 20833.33 },
          { limit: 66666.66, rate: 0.20, base: 33333.33 },
          { limit: 166666.66, rate: 0.25, base: 66666.66 },
          { limit: 666666.66, rate: 0.30, base: 166666.66 },
          { limit: Infinity, rate: 0.35, base: 666666.66 }
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
      return basicSalary > 0 ? Math.min(Math.max(basicSalary * 0.045, 400), 1750) : 0;
  }

  function calculatePhilHealthContribution(basicSalary) {
      return basicSalary > 0 ? Math.min(Math.max(basicSalary * 0.025, 200), 1600) : 0;
  }

  function calculatePagIbigContribution(basicSalary) {
      return basicSalary > 0 ? 200 : 0;
  }

  // function calculateBudget() {
  //     const basicSalary = parseFloat(document.getElementById("income").value) || 0;
  //     const nonTaxableAllowance = parseFloat(document.getElementById("non-taxable-allowance").value) || 0;
  
  //     const monthlySalary = basicSalary + nonTaxableAllowance;
  //     const sssContribution = calculateSSSContribution(basicSalary);
  //     const philHealthContribution = calculatePhilHealthContribution(basicSalary);
  //     const pagIbigContribution = calculatePagIbigContribution(basicSalary);
  
  //     const totalContributions = sssContribution + philHealthContribution + pagIbigContribution;
  //     const taxableIncome = monthlySalary - totalContributions;
  //     const withholdingTax = monthlySalary > 0 ? calculateWithholdingTax(taxableIncome) : 0;
  //     const totalDeductions = withholdingTax + totalContributions;

  //     const netPay = Math.max(0, monthlySalary - totalDeductions);
  
  //     const categories = [
  //         { name: "Basic Salary", amount: basicSalary },
  //         { name: "Non-taxable Allowance", amount: nonTaxableAllowance },
  //         { name: "Monthly Salary", amount: monthlySalary },
  //         { name: "Withholding Tax", amount: withholdingTax },
  //         { name: "SSS Contribution", amount: sssContribution },
  //         { name: "PhilHealth Contribution", amount: philHealthContribution },
  //         { name: "PAG-IBIG Contribution", amount: pagIbigContribution },
  //         { name: "Total Deductions", amount: totalDeductions },
  //         { name: "Net Pay", amount: netPay },
  //     ];
  
  //     const defaultPercentages = [
  //         { name: "Housing", percentage: 0.2 },
  //         { name: "Transportation", percentage: 0.08 },
  //         { name: "Food", percentage: 0.15 },
  //         { name: "Utilities", percentage: 0.09 },
  //         { name: "Insurance", percentage: 0.05 },
  //         { name: "Medical & Healthcare", percentage: 0.07 },
  //         { name: "Savings, Investing, & Debt Payments", percentage: 0.3 },
  //         { name: "Personal & Recreation", percentage: 0.03 },
  //         { name: "Miscellaneous", percentage: 0.03 },
  //     ];
  
  //     const totalIncome = Math.max(netPay, 0);
  //     const totalPercentage = defaultPercentages.reduce((total, cat) => total + cat.percentage, 0);
  //     const adjustedPercentages = defaultPercentages.map(cat => ({
  //         ...cat,
  //         percentage: cat.percentage / totalPercentage,
  //     }));
  
  //     let resultHTML = '<div class="result">';

  //     // Display salary and deductions
  //     categories.forEach(category => {
  //         resultHTML += `
  //             <div class="category">
  //                 <span>${category.name}:</span>
  //                 <span>${formatCurrency(category.amount, true)}</span>
  //             </div>
  //         `;
  //     });

  //     resultHTML += '<h3>Budget Categories:</h3>';

  //     // Allocate budget based on precision setting
  //     let remainingAmount = totalIncome;
  //     let lastIndex = adjustedPercentages.length - 1;
  //     let budgetAllocations = [];

  //     adjustedPercentages.forEach((category, index) => {
  //         let allocatedAmount;

  //         if (precisionCheckbox.checked) {
  //             // **Recent changes (precise rounding with last category adjustment)**
  //             allocatedAmount = parseFloat((totalIncome * category.percentage).toFixed(2));

  //             if (index === lastIndex) {
  //                 allocatedAmount = parseFloat(remainingAmount.toFixed(2)); // Adjust last category
  //             } else {
  //                 remainingAmount -= allocatedAmount;
  //             }
  //         } else {
  //             // **Whole numbers but with .00**
  //             allocatedAmount = Math.round(totalIncome * category.percentage);

  //             if (index === lastIndex) {
  //                 allocatedAmount = remainingAmount; // Adjust last category
  //             } else {
  //                 remainingAmount -= allocatedAmount;
  //             }
  //         }

  //         budgetAllocations.push({ name: category.name, amount: allocatedAmount });
  //     });

  //     budgetAllocations.forEach(category => {
  //         resultHTML += `
  //             <div class="category">
  //                 <span>${category.name}:</span>
  //                 <span>${formatCurrency(category.amount, true)}</span>
  //             </div>
  //         `;
  //     });

  //     resultHTML += '</div>';
  //     resultDiv.innerHTML = resultHTML;
  // }

  function calculateBudget() {
    const basicSalary = parseFloat(document.getElementById("income").value) || 0;
    const nonTaxableAllowance = parseFloat(document.getElementById("non-taxable-allowance").value) || 0;

    const monthlySalary = basicSalary + nonTaxableAllowance; // Gross Income
    const sssContribution = calculateSSSContribution(basicSalary);
    const philHealthContribution = calculatePhilHealthContribution(basicSalary);
    const pagIbigContribution = calculatePagIbigContribution(basicSalary);

    const totalContributions = sssContribution + philHealthContribution + pagIbigContribution;
    const taxableIncome = monthlySalary - totalContributions;
    const withholdingTax = monthlySalary > 0 ? calculateWithholdingTax(taxableIncome) : 0;
    const totalDeductions = withholdingTax + totalContributions;

    const netPay = Math.max(0, monthlySalary - totalDeductions); // Net Pay after deductions

    // Categories based on Gross Income
    const fixedAllocations = [
        { name: "Housing", percentage: 0.2 },
        { name: "Transportation", percentage: 0.08 },
        { name: "Savings, Investing, & Debt Payments", percentage: 0.3 },
    ];

    let fixedTotal = 0;
    let fixedCategoryAmounts = fixedAllocations.map(cat => {
        let amount = monthlySalary * cat.percentage;
        fixedTotal += amount;
        return { name: cat.name, amount: amount };
    });

    // Remaining amount after deducting fixed allocations from net pay
    let remainingNetPay = Math.max(0, netPay - fixedTotal);

    // Categories based on Net Pay
    const variableAllocations = [
        { name: "Food", percentage: 0.15 },
        { name: "Utilities", percentage: 0.09 },
        { name: "Insurance", percentage: 0.05 },
        { name: "Medical & Healthcare", percentage: 0.07 },
        { name: "Personal & Recreation", percentage: 0.03 },
        { name: "Miscellaneous", percentage: 0.03 },
    ];

    const totalVariablePercentage = variableAllocations.reduce((total, cat) => total + cat.percentage, 0);
    let variableCategoryAmounts = variableAllocations.map(cat => ({
        name: cat.name,
        amount: (remainingNetPay * (cat.percentage / totalVariablePercentage))
    }));

    let resultHTML = '<div class="result">';

    // Display salary and deductions
    resultHTML += `<h3>Income & Deductions:</h3>`;
    resultHTML += `
        <div class="category"><span>Gross Income:</span> <span>${formatCurrency(monthlySalary, true)}</span></div>
        <div class="category"><span>Withholding Tax:</span> <span>${formatCurrency(withholdingTax, true)}</span></div>
        <div class="category"><span>SSS Contribution:</span> <span>${formatCurrency(sssContribution, true)}</span></div>
        <div class="category"><span>PhilHealth Contribution:</span> <span>${formatCurrency(philHealthContribution, true)}</span></div>
        <div class="category"><span>PAG-IBIG Contribution:</span> <span>${formatCurrency(pagIbigContribution, true)}</span></div>
        <div class="category"><span>Net Pay:</span> <span>${formatCurrency(netPay, true)}</span></div>
    `;

    resultHTML += '<h3>Fixed Allocations (Based on Gross Income):</h3>';
    fixedCategoryAmounts.forEach(category => {
        resultHTML += `<div class="category"><span>${category.name}:</span> <span>${formatCurrency(category.amount, true)}</span></div>`;
    });

    resultHTML += '<h3>Remaining Budget Categories (Based on Net Pay):</h3>';
    variableCategoryAmounts.forEach(category => {
        resultHTML += `<div class="category"><span>${category.name}:</span> <span>${formatCurrency(category.amount, true)}</span></div>`;
    });

    resultHTML += '</div>';
    resultDiv.innerHTML = resultHTML;
}


  calculateBudget();
});
