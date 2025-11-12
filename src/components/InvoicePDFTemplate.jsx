import React from "react";

const InvoicePDFTemplate = React.forwardRef(({ invoice }, ref) => {
  if (!invoice) return null;

  // 🧮 Compute totals
  const netTotal = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const vatTotal = invoice.items.reduce(
    (sum, item) => sum + (item.unitPrice * item.vatRate * item.quantity) / 100,
    0
  );
  const grandTotal = netTotal + vatTotal;

  // 🧠 Conditional VAT mention
  let vatMention = "";
  if (invoice.vatRate === 0) {
    vatMention = "VAT exempt under Article 262-1° of the French Tax Code";
  } else if (invoice.vatRegime === "VAT Margin") {
    vatMention =
      "VAT applied under Margin Scheme – Article 297A of French Tax Code";
  }

  const companyCode = invoice.companyCode || "XX";
  const formattedInvoiceNo = `INV-${companyCode}-${invoice.invoiceNo}`;

  return (
    <div
      ref={ref}
      id="invoice-pdf"
      className="bg-white p-10 text-black text-sm"
      style={{
        width: "794px",
        margin: "0 auto",
        display: "none",
        fontFamily: "Arial, sans-serif",
        position: "relative",
      }}
    >
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start mb-8">
        {/* LEFT: Company Info */}
        <div className="w-1/2 flex gap-4 items-start">
          <img
            src="/Images/logoinovice.jfif"
            alt="Company Logo"
            className="w-32 mt-1"
          />
          <div>
            <h2 className="font-bold text-lg uppercase tracking-wide">
              VESTIAIRE ST. HONORÉ
            </h2>
            <p className="leading-tight mt-1 text-sm">
              229 Rue Saint-Honoré
              <br />
              75001 Paris, France
              <br />
              VAT: FR401234444
            </p>
          </div>
        </div>

        {/* RIGHT: Receiver Info */}
        <div className="w-1/2 text-right leading-tight text-sm">
          <h3 className="font-semibold">{invoice.customerName || "John Doe"}</h3>
          <p>
            {invoice.customerCompany || "ABC Traders"}
            <br />
            {invoice.customerCountry || "France"}
            <br />
            {invoice.vatNo && (
              <span>VAT: {invoice.vatNo}</span>
            )}
          </p>
        </div>
      </div>

      {/* ================= INVOICE META ================= */}
      <div className="mb-6 border-b pb-3">
        <p>
          <strong>Invoice No :</strong> {formattedInvoiceNo}
        </p>
        <p>
          <strong>Date :</strong> {invoice.date}
        </p>
        {vatMention && (
          <p className="italic text-gray-700 text-xs mt-1">{vatMention}</p>
        )}
      </div>

      {/* ================= ITEMS TABLE ================= */}
      <table className="w-full border-collapse text-sm mb-8">
        <thead>
          <tr className="bg-gray-100 border-y border-gray-300">
            <th className="text-left p-2">Description</th>
            <th className="text-right p-2">Quantity</th>
            <th className="text-right p-2">Unit Price</th>
            <th className="text-right p-2">VAT</th>
            <th className="text-right p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-200">
              <td className="p-2">{item.description}</td>
              <td className="text-right p-2">{item.quantity}</td>
              <td className="text-right p-2">
                {item.unitPrice.toLocaleString()} €
              </td>
              <td className="text-right p-2">{item.vatRate}%</td>
              <td className="text-right p-2">
                {(item.quantity * item.unitPrice).toLocaleString()} €
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= BANK + TOTALS ================= */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Bank Details */}
        <div className="border rounded-md p-4">
          <h3 className="font-semibold text-blue-700 mb-2">Bank Details</h3>
          <p>
            <strong>Bank:</strong> {invoice.bankDetails.bank}
          </p>
          <p>
            <strong>Account Number:</strong> {invoice.bankDetails.accountNumber}
          </p>
          <p>
            <strong>Account Type:</strong> {invoice.bankDetails.accountType}
          </p>
          <p>
            <strong>Currency:</strong> {invoice.bankDetails.currency}
          </p>
          <p>
            <strong>Payment Reference:</strong> {invoice.bankDetails.reference}
          </p>
        </div>

        {/* Totals Section */}
        <div className="border rounded-md p-4">
          <div className="flex justify-between mb-1">
            <span>Net amount</span>
            <span>{netTotal.toLocaleString()} €</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>VAT</span>
            <span>{vatTotal.toLocaleString()} €</span>
          </div>
         <div className="flex justify-between items-center bg-blue-900 text-white font-semibold h-10 pb-2 px-1 mt-3 rounded-md">
            <p className="inline-flex justify-center items-center">Total</p>
            <p className="inline-flex justify-center items-center">
              {grandTotal.toLocaleString()} €
            </p>
          </div>
          <div className="flex justify-between mt-2">
            <span>Amount Due</span>
            <span>0.00 €</span>
          </div>
        </div>
      </div>

      {/* ================= FOOTER NOTE ================= */}
      <p className="text-xs mt-40 leading-relaxed text-justify text-gray-700">
        No discount will be granted for early settlement. Any late payment shall
        automatically give rise to a penalty calculated at three times the
        statutory interest rate (Article L 441-10, paragraph 12 of the French
        Commercial Code). In addition, for any business customer, any amount not
        paid on its due date shall automatically incur a fixed recovery charge
        of €40 pursuant to Articles L 441-6, I, paragraph 12 and D 441-5 of the
        French Commercial Code.
      </p>

      {/* ================= FOOTER COMPANY DETAILS ================= */}
      <p className="text-center text-xs mt-6 font-semibold italic text-gray-800">
        VESTIAIRE SAINT-HONORÉ SAS — Share capital of 10,000€ — Company No
        94479826000016
      </p>
    </div>
  );
});

export default InvoicePDFTemplate;