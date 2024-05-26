document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("budget-form");
    const resultDiv = document.getElementById("result");
  
    form.addEventListener("input", calculateBudget);
  
    function formatCurrency(amount) {
      return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);
    }
  
    function calculateWithholdingTax(taxableIncome) {
      // Define the corrected tax brackets and rates
      const taxBrackets = [
        { limit: 20833.33333333333, rate: 0.00, base: 0 },
        { limit: 33333.33333333333, rate: 0.15, base: 20833.33333333333 },
        { limit: 66666.66666666666, rate: 0.20, base: 33333.33333333333 },
        { limit: 166666.6666666666, rate: 0.25, base: 66666.66666666666 },
        { limit: 666666.6666666666, rate: 0.30, base: 166666.6666666666 },
        { limit: Infinity, rate: 0.35, base: 666666.6666666666 }
      ];
  
      // Initialize the total tax
      let totalTax = 0;
  
      // Calculate tax progressively
      for (const bracket of taxBrackets) {
        if (taxableIncome <= bracket.limit) {
          const taxForBracket = (taxableIncome - bracket.base) * bracket.rate;
          totalTax += taxForBracket;
          break; // Exit the loop once tax is calculated
        } else {
          const taxForBracket = (bracket.limit - bracket.base) * bracket.rate;
          totalTax += taxForBracket;
        }
      }
  
      return totalTax;
    }
  
    function calculateSSSContribution(basicSalary) {
      const MIN_SALARY = 10000;
      const MAX_SALARY = 20000;
      const FIXED_CONTRIBUTION = 400;
      const MAX_CONTRIBUTION = 1350;
      const RATE = 0.045;
  
      if (basicSalary <= MIN_SALARY) {
        return FIXED_CONTRIBUTION;
      } else if (basicSalary >= MAX_SALARY) {
        return MAX_CONTRIBUTION;
      } else {
        return basicSalary * RATE;
      }
    }
  
    function calculatePhilHealthContribution(basicSalary) {
      if (basicSalary <= 10000) {
        return 200;
      } else if (basicSalary >= 80000) {
        return 1600;
      } else {
        return basicSalary * 0.025;
      }
    }
  
    function calculatePagIbigContribution(basicSalary) {
      return 200;
    }
  
    function calculateBudget() {
      const basicSalary = parseFloat(document.getElementById("income").value) || 0;
      const nonTaxableAllowance = parseFloat(document.getElementById("non-taxable-allowance").value) || 0;
  
      const monthlySalary = basicSalary + nonTaxableAllowance;
      const sssContribution = calculateSSSContribution(basicSalary);
      const philHealthContribution = calculatePhilHealthContribution(basicSalary);
      const pagIbigContribution = calculatePagIbigContribution(basicSalary);
  
      const totalContributions = sssContribution + philHealthContribution + pagIbigContribution;
      const taxableIncome = monthlySalary - totalContributions;
      const withholdingTax = calculateWithholdingTax(taxableIncome);
      const totalDeductions = withholdingTax + totalContributions;
      const netPay = monthlySalary - totalDeductions;
  
      const categories = [
        { name: "Basic Salary", amount: basicSalary },
        { name: "Non-taxable Allowance", amount: nonTaxableAllowance },
        { name: "Monthly Salary", amount: monthlySalary },
        { name: "Withholding Tax", amount: withholdingTax },
        { name: "SSS Contribution", amount: sssContribution },
        { name: "PhilHealth Contribution", amount: philHealthContribution },
        { name: "PAG-IBIG Contribution", amount: pagIbigContribution },
        { name: "Total Deductions", amount: totalDeductions },
        { name: "Net Pay", amount: netPay },
      ];
  
      const defaultPercentages = [
        { name: "Housing", percentage: 0.2 },
        { name: "Transportation", percentage: 0.08 },
        { name: "Food", percentage: 0.15 },
        { name: "Utilities", percentage: 0.09 },
        { name: "Insurance", percentage: 0.05 },
        { name: "Medical & Healthcare", percentage: 0.07 },
        { name: "Savings, Investing, & Debt Payments", percentage: 0.3 },
        { name: "Personal & Recreation", percentage: 0.03 },
        { name: "Miscellaneous", percentage: 0.03 },
      ];
  
      const totalIncome = netPay;
      const totalPercentage = defaultPercentages.reduce((total, category) => total + category.percentage, 0);
      const adjustedPercentages = defaultPercentages.map((category) => ({
        ...category,
        percentage: category.percentage / totalPercentage,
      }));
  
      let totalSum = 0;
      let resultHTML = '<div class="result">';
      categories.forEach((category) => {
        resultHTML += `
          <div class="category">
            <span class="category-name">${category.name}:</span>
            <span class="category-amount">${formatCurrency(category.amount)}</span>
          </div>
        `;
      });
  
      resultHTML += '<h3>Budget Categories:</h3>';
  
      adjustedPercentages.forEach((category) => {
        const allocatedAmount = totalIncome * category.percentage;
        const roundedAmount = Math.round(allocatedAmount);
  
        resultHTML += `
          <div class="category">
            <span class="category-name">${category.name}:</span>
            <span class="category-amount">${formatCurrency(roundedAmount)}</span>
          </div>
        `;
  
        totalSum += roundedAmount;
      });
  
      resultHTML += "</div>";
      resultDiv.innerHTML = resultHTML;
    }
  
    calculateBudget();
  });
  