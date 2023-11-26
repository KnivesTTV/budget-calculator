document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("budget-form");
    const resultDiv = document.getElementById("result");

    form.addEventListener("input", calculateBudget);

    function formatCurrency(amount) {
        return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);
    }

    // Function to calculate withholding tax
    function calculateWithholdingTax(annualGrossSalary) {
        if (annualGrossSalary <= 250000) {
            return 0;
        } else if (annualGrossSalary <= 400000) {
            return (annualGrossSalary - 250000) * 0.15 / 12;
        } else if (annualGrossSalary <= 800000) {
            return (22500 + (annualGrossSalary - 400000) * 0.20) / 12;
        } else if (annualGrossSalary <= 2000000) {
            return (102500 + (annualGrossSalary - 800000) * 0.25) / 12;
        } else if (annualGrossSalary <= 8000000) {
            return (402500 + (annualGrossSalary - 2000000) * 0.30) / 12;
        } else {
            return (2202500 + (annualGrossSalary - 8000000) * 0.35) / 12;
        }
    }

    // Function to calculate SSS contribution
    function calculateSSSContribution(basicSalary) {
        if (basicSalary <= 10000) {
            return 400;
        } else if (basicSalary >= 20000) {
            return 1600;
        } else {
            return (basicSalary * 0.04);
        }
    }

    // Function to calculate PhilHealth contribution
    function calculatePhilHealthContribution(basicSalary) {
        if (basicSalary <= 10000) {
            return 200;
        } else if (basicSalary >= 80000) {
            return 1600;
        } else {
            return (basicSalary * 0.02);
        }
    }

    // Function to calculate PAG-IBIG contribution
    function calculatePagIbigContribution(basicSalary) {
        return 100; // Fixed at 100 for now
    }

    function calculateBudget() {
        // ... (rest of the code)
    }

    const defaultPercentages = [
        { name: "Housing", percentage: 0.2 },
        { name: "Transportation", percentage: 0.105 },
        { name: "Food", percentage: 0.165 },
        { name: "Utilities", percentage: 0.05 },
        { name: "Insurance", percentage: 0.05 },
        { name: "Medical & Healthcare", percentage: 0.07 },
        { name: "Savings, Investing, & Debt Payments", percentage: 0.3 },
        { name: "Personal & Recreation", percentage: 0.03 },
        { name: "Miscellaneous", percentage: 0.03 },
    ];

    calculateBudget(); // Initial calculation
});
